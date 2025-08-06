// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod dhcp_capture;
mod network_interfaces;

use dhcp_capture::DHCPCapture;
use network_interfaces::get_network_interfaces;
use std::sync::{Mutex, Arc};
use std::collections::HashMap;
use tauri::State;
use serde::{Serialize, Deserialize};

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



#[tauri::command]
fn check_npcap() -> Result<bool, String> {
    // Vérifier si Npcap est installé sur Windows
    #[cfg(target_os = "windows")]
    {
        let npcap_path = std::path::Path::new("C:\\Program Files\\Npcap");
        let npcap_path_x86 = std::path::Path::new("C:\\Program Files (x86)\\Npcap");
        
        if npcap_path.exists() || npcap_path_x86.exists() {
            Ok(true)
        } else {
            Ok(false)
        }
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        // Sur Linux, on suppose que libpcap est installé
        Ok(true)
    }
}

fn setup_dll_path() {
    #[cfg(target_os = "windows")]
    {
        use std::env;
        use std::path::PathBuf;
        use std::process::Command;
        use std::fs;
        use libloading::Library;
        
        println!("🔧 Setting up DLL path for Windows...");
        
        // Get the executable directory
        if let Ok(exe_path) = env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                println!("🔍 Executable directory: {}", exe_dir.display());
                
                // Add System32 to PATH first (like start.bat does)
                if let Ok(current_path) = env::var("PATH") {
                    let new_path = format!("{};{}", "%SystemRoot%\\System32", current_path);
                    env::set_var("PATH", new_path);
                    println!("✅ Added System32 to PATH");
                }
                
                // Add the executable directory to PATH
                if let Ok(current_path) = env::var("PATH") {
                    let new_path = format!("{};{}", exe_dir.display(), current_path);
                    env::set_var("PATH", new_path);
                    println!("✅ Added executable directory to PATH");
                }
                
                // Try to load DLLs directly from System32 first
                let system32_wpcap = PathBuf::from("%SystemRoot%\\System32\\wpcap.dll");
                let system32_packet = PathBuf::from("%SystemRoot%\\System32\\packet.dll");
                
                println!("🔄 Trying to load DLLs from System32...");
                unsafe {
                    match Library::new("wpcap.dll") {
                        Ok(_) => println!("✅ wpcap.dll loaded from System32"),
                        Err(e) => println!("❌ Failed to load wpcap.dll from System32: {}", e),
                    }
                    
                    match Library::new("packet.dll") {
                        Ok(_) => println!("✅ packet.dll loaded from System32"),
                        Err(e) => println!("❌ Failed to load packet.dll from System32: {}", e),
                    }
                }
                
                // Also try to copy to executable directory as backup
                let wpcap_path = exe_dir.join("wpcap.dll");
                let packet_path = exe_dir.join("packet.dll");
                
                if !wpcap_path.exists() || !packet_path.exists() {
                    println!("🔄 Copying DLLs from System32 to executable directory...");
                    
                    if let Ok(_) = Command::new("cmd")
                        .args(&["/c", "copy", "%SystemRoot%\\System32\\wpcap.dll", &exe_dir.to_string_lossy()])
                        .output() {
                        println!("✅ Copied wpcap.dll from System32");
                    } else {
                        println!("❌ Failed to copy wpcap.dll");
                    }
                    
                    if let Ok(_) = Command::new("cmd")
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
                    
                    // Ajouter le log à l'état de l'application
                    if let Ok(mut logs) = logs_arc.lock() {
                        logs.push(log);
                    }
                }) {
                    eprintln!("Erreur de capture: {}", e);
                }
            }
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
                        clear_logs
                    ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}