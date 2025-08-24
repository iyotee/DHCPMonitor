// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod dhcp_capture;
mod network_interfaces;

use dhcp_capture::DHCPCapture;
use network_interfaces::get_network_interfaces;
use std::sync::{Mutex, Arc};
use tauri::State;
use serde::{Serialize, Deserialize};
use reqwest;

// Application state
struct AppState {
    logs: Arc<Mutex<Vec<DHCPLog>>>,
    capture: Arc<Mutex<Option<DHCPCapture>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterface {
    pub name: String,
    pub description: String,
    pub addresses: Vec<String>,
    pub is_loopback: bool,
    pub is_up: bool,
    pub real_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DHCPLog {
    pub timestamp: String,
    pub packet_type: String,
    pub source_ip: String,
    pub destination_ip: String,
    pub option_50: Option<String>,
    pub interface: String,
    pub raw_data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubRelease {
    pub tag_name: String,
    pub name: String,
    pub body: String,
    pub html_url: String,
    pub published_at: String,
    pub assets: Vec<GitHubAsset>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubAsset {
    pub name: String,
    pub browser_download_url: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub current_version: String,
    pub latest_version: Option<String>,
    pub has_update: bool,
    pub release_info: Option<GitHubRelease>,
    pub download_url: Option<String>,
}

#[tauri::command]
fn get_interfaces() -> Result<Vec<NetworkInterface>, String> {
    let interfaces = get_network_interfaces();
    Ok(interfaces.into_iter().map(|iface| NetworkInterface {
        name: iface.name,
        description: iface.description,
        addresses: iface.addresses,
        is_loopback: iface.is_loopback,
        is_up: iface.is_active, // On utilise is_active du backend comme is_up pour le frontend
        real_name: iface.real_name,
    }).collect())
}



#[cfg(target_os = "windows")]
#[tauri::command]
fn check_npcap() -> Result<bool, String> {
    // Vérifier si Npcap est installé sur Windows
    let npcap_path = std::path::PathBuf::from("C:\\Program Files\\Npcap");
    let npcap_path_x86 = std::path::PathBuf::from("C:\\Program Files (x86)\\Npcap");
    
    if npcap_path.exists() || npcap_path_x86.exists() {
        println!("✅ Npcap trouvé sur Windows");
        Ok(true)
    } else {
        println!("❌ Npcap non trouvé sur Windows");
        Ok(false)
    }
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
fn check_npcap() -> Result<bool, String> {
    // Sur Linux/macOS, vérifier si libpcap est disponible
    match std::process::Command::new("pkg-config").args(&["--exists", "libpcap"]).output() {
        Ok(output) => {
            if output.status.success() {
                println!("✅ libpcap trouvé sur Linux/macOS");
                Ok(true)
            } else {
                println!("❌ libpcap non trouvé sur Linux/macOS");
                Ok(false)
            }
        }
        Err(_) => {
            println!("⚠️  pkg-config non disponible, vérification libpcap impossible");
            Ok(true) // On suppose que c'est OK
        }
    }
}

#[cfg(target_os = "windows")]
fn setup_dll_path() {
    if let Some(exe_path) = std::env::current_exe().ok() {
        if let Some(exe_dir) = exe_path.parent() {
            println!("📁 Executable directory: {}", exe_dir.display());
            
            // Add the executable directory to PATH
            if let Ok(current_path) = std::env::var("PATH") {
                let new_path = format!("{};{}", exe_dir.display(), current_path);
                std::env::set_var("PATH", new_path);
                println!("✅ Added executable directory to PATH");
            }
            
            // Try to load DLLs directly from System32 first
            let _system32_wpcap = std::path::PathBuf::from("%SystemRoot%\\System32\\wpcap.dll");
            let _system32_packet = std::path::PathBuf::from("%SystemRoot%\\System32\\packet.dll");
            
            println!("🔄 Trying to load DLLs from System32...");
            unsafe {
                match libloading::Library::new("wpcap.dll") {
                    Ok(_) => println!("✅ wpcap.dll loaded from System32"),
                    Err(e) => println!("❌ Failed to load wpcap.dll from System32: {}", e),
                }
                
                match libloading::Library::new("packet.dll") {
                    Ok(_) => println!("✅ packet.dll loaded from System32"),
                    Err(e) => println!("❌ Failed to load packet.dll from System32: {}", e),
                }
            }
            
            // Also try to copy to executable directory as backup
            let wpcap_path = exe_dir.join("wpcap.dll");
            let packet_path = exe_dir.join("packet.dll");
            
            if !wpcap_path.exists() || !packet_path.exists() {
                println!("🔄 Copying DLLs from System32 to executable directory...");
                
                if let Ok(_) = std::process::Command::new("cmd")
                    .args(&["/c", "copy", "%SystemRoot%\\System32\\wpcap.dll", &exe_dir.to_string_lossy()])
                    .output() {
                    println!("✅ Copied wpcap.dll from System32");
                } else {
                    println!("❌ Failed to copy wpcap.dll");
                }
                
                if let Ok(_) = std::process::Command::new("cmd")
                    .args(&["/c", "copy", "%SystemRoot%\\System32\\packet.dll", &exe_dir.to_string_lossy()])
                    .output() {
                    println!("✅ Copied packet.dll from System32");
                } else {
                    println!("❌ Failed to copy packet.dll");
                }
            }
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn setup_dll_path() {
    // Sur Linux/macOS, on utilise libpcap qui est installé via le système
    println!("🐧 Linux/macOS: Utilisation de libpcap système");
}

#[tauri::command]
fn start_capture(interface_name: String, state: State<AppState>) -> Result<(), String> {
    println!("🔍 Starting capture on interface: {}", interface_name);
    
    // Vérifier Npcap avant de démarrer la capture
    if !check_npcap().unwrap_or(false) {
        println!("❌ Npcap check failed");
        return Err("Npcap n'est pas installé. Veuillez installer Npcap depuis https://npcap.com/".to_string());
    }
    
    println!("✅ Npcap check passed");
    
    // Clear any existing logs when starting new capture
    if let Ok(mut logs) = state.logs.lock() {
        logs.clear();
        println!("📝 Logs cleared for new capture session");
    }
    
    let capture = DHCPCapture::new(&interface_name)
        .map_err(|e| {
            println!("❌ DHCPCapture::new failed: {}", e);
            format!("Erreur lors de l'initialisation: {}", e)
        })?;
    
    println!("✅ DHCPCapture initialized successfully");

    // Stocker la capture dans l'état
    if let Ok(mut capture_guard) = state.capture.lock() {
        *capture_guard = Some(capture);
    }

    // Démarrer la capture dans un thread séparé
    let logs_arc = state.logs.clone();
    let capture_arc = state.capture.clone();
    let interface_name_clone = interface_name.clone();
    
    std::thread::spawn(move || {
        if let Ok(mut capture_guard) = capture_arc.lock() {
            if let Some(ref mut capture) = *capture_guard {
                if let Err(e) = capture.start_capture_with_callback(move |packet| {
                    // Convertir le paquet DHCP en DHCPLog
                    let log = DHCPLog {
                        timestamp: packet.timestamp.to_rfc3339(),
                        packet_type: format!("{:?}", packet.message_type),
                        source_ip: packet.source_ip.to_string(),
                        destination_ip: packet.destination_ip.to_string(),
                        option_50: packet.option_50.map(|ip| ip.to_string()),
                        interface: interface_name_clone.clone(),
                        raw_data: format!("{:?}", packet.raw_data),
                    };
                    
                    println!("📦 Packet captured: {} from {} to {}", 
                             log.packet_type, log.source_ip, log.destination_ip);
                    
                    // Ajouter le log à l'état de l'application
                    if let Ok(mut logs) = logs_arc.lock() {
                        logs.push(log);
                        println!("📝 Log added to state, total logs: {}", logs.len());
                    } else {
                        eprintln!("❌ Failed to lock logs for writing");
                    }
                }) {
                    eprintln!("❌ Erreur de capture: {}", e);
                }
            } else {
                eprintln!("❌ No capture instance found in state");
            }
        } else {
            eprintln!("❌ Failed to lock capture state");
        }
    });

    Ok(())
}

#[tauri::command]
fn stop_capture(state: State<AppState>) -> Result<(), String> {
    println!("Demande d'arrêt de la capture...");
    
    // Marquer l'arrêt de la capture
    if let Ok(mut capture_guard) = state.capture.lock() {
        if let Some(ref mut capture) = *capture_guard {
            capture.stop_capture();
            println!("Signal d'arrêt envoyé à la capture");
        }
        
        // Nettoyer immédiatement la capture
        *capture_guard = None;
        println!("Capture nettoyée");
    }
    
    Ok(())
}

#[tauri::command]
fn get_logs(state: State<AppState>) -> Result<Vec<DHCPLog>, String> {
    let logs = state.logs.lock().map_err(|_| "Erreur de verrouillage".to_string())?;
    Ok(logs.clone())
}

#[tauri::command]
fn clear_logs(state: State<AppState>) -> Result<(), String> {
    let mut logs = state.logs.lock().map_err(|_| "Erreur de verrouillage".to_string())?;
    logs.clear();
    Ok(())
}

#[tauri::command]
fn test_capture(state: State<AppState>) -> Result<String, String> {
    println!("🧪 Testing capture functionality...");
    
    // Check if we have any logs
    let log_count = if let Ok(logs) = state.logs.lock() {
        logs.len()
    } else {
        return Err("Failed to access logs".to_string());
    };
    
    // Check if capture is active
    let capture_active = if let Ok(capture) = state.capture.lock() {
        capture.is_some()
    } else {
        return Err("Failed to access capture state".to_string());
    };
    
    let status = format!(
        "Capture Status:\n- Logs count: {}\n- Capture active: {}\n- Timestamp: {}",
        log_count,
        capture_active,
        chrono::Utc::now().to_rfc3339()
    );
    
    println!("{}", status);
    Ok(status)
}

#[tauri::command]
async fn check_for_updates() -> Result<UpdateInfo, String> {
    let current_version = env!("CARGO_PKG_VERSION").to_string();
    
    // URL de l'API GitHub pour les releases
    let api_url = "https://api.github.com/repos/iyotee/DHCPMonitor/releases/latest";
    
    let client = reqwest::Client::new();
    let response = client
        .get(api_url)
        .header("User-Agent", "DHCPMonitor-Update-Checker")
        .send()
        .await
        .map_err(|e| format!("Erreur réseau: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("Erreur API GitHub: {}", response.status()));
    }
    
    let release: GitHubRelease = response
        .json()
        .await
        .map_err(|e| format!("Erreur parsing JSON: {}", e))?;
    
    // Comparer les versions (supprimer le 'v' du tag si présent)
    let latest_version = release.tag_name.trim_start_matches('v').to_string();
    let current_version_clean = current_version.trim_start_matches('v').to_string();
    
    // Comparaison simple des versions (pour une implémentation plus robuste, utiliser une lib de comparaison de versions)
    let has_update = latest_version != current_version_clean;
    
    // Trouver l'asset de téléchargement approprié selon la plateforme
    let download_url = release.assets.iter().find_map(|asset| {
        if cfg!(target_os = "windows") && asset.name.contains(".exe") {
            Some(asset.browser_download_url.clone())
        } else if cfg!(target_os = "linux") && asset.name.contains(".AppImage") {
            Some(asset.browser_download_url.clone())
        } else if cfg!(target_os = "macos") && asset.name.contains(".dmg") {
            Some(asset.browser_download_url.clone())
        } else {
            None
        }
    });
    
    Ok(UpdateInfo {
        current_version: current_version_clean,
        latest_version: Some(latest_version),
        has_update,
        release_info: Some(release),
        download_url,
    })
}

fn main() {
    // Setup DLL path for Windows
    setup_dll_path();
    
    let app_state = AppState {
        logs: Arc::new(Mutex::new(Vec::new())),
        capture: Arc::new(Mutex::new(None)),
    };

    tauri::Builder::default()
        .manage(app_state)
                            .invoke_handler(tauri::generate_handler![
                        get_interfaces,
                        check_npcap,
                        start_capture,
                        stop_capture,
                        get_logs,
                        clear_logs,
                        check_for_updates,
                        test_capture
                    ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}