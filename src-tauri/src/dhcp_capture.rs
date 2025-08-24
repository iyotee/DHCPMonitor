use std::net::Ipv4Addr;
use chrono::{DateTime, Utc};
use thiserror::Error;
use pcap::{Device, Capture};
use std::thread;
use std::sync::{mpsc, Arc, Mutex};
use std::thread::JoinHandle;

#[derive(Error, Debug)]
pub enum DHCPError {
    // CaptureError variant removed as it's not used
}

#[derive(Debug, Clone)]
pub struct DHCPPacket {
    pub timestamp: DateTime<Utc>,
    pub message_type: DHCPMessageType,
    pub source_ip: Ipv4Addr,
    pub destination_ip: Ipv4Addr,
    pub option_50: Option<Ipv4Addr>,
    pub raw_data: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum DHCPMessageType {
    Discover,
    Offer,
    Request,
    Ack,
    Nack,
    Decline,
    Release,
    Inform,
    Unknown,
}

impl From<u8> for DHCPMessageType {
    fn from(value: u8) -> Self {
        match value {
            1 => DHCPMessageType::Discover,
            2 => DHCPMessageType::Offer,
            3 => DHCPMessageType::Request,
            5 => DHCPMessageType::Ack,
            6 => DHCPMessageType::Nack,
            7 => DHCPMessageType::Decline,
            8 => DHCPMessageType::Release,
            9 => DHCPMessageType::Inform,
            _ => DHCPMessageType::Unknown,
        }
    }
}

pub struct DHCPCapture {
    interface_name: String,
    is_capturing: Arc<Mutex<bool>>,
    capture_thread: Option<JoinHandle<()>>,
}

impl DHCPCapture {
    pub fn new(interface_name: &str) -> Result<Self, DHCPError> {
        Ok(Self {
            interface_name: interface_name.to_string(),
            is_capturing: Arc::new(Mutex::new(false)),
            capture_thread: None,
        })
    }

    pub fn start_capture_with_callback<F>(&mut self, mut callback: F) -> Result<(), DHCPError>
    where
        F: FnMut(DHCPPacket) + Send + 'static,
    {
        println!("Démarrage capture DHCP sur {}", self.interface_name);
        
        // Marquer comme en cours de capture
        if let Ok(mut capturing) = self.is_capturing.lock() {
            *capturing = true;
        }
        
        let (tx, rx) = mpsc::channel();
        let interface_name = self.interface_name.clone();
        let is_capturing = self.is_capturing.clone();
        
        // Créer un thread séparé pour la capture
        let capture_handle = thread::spawn(move || {
            let devices = Device::list().unwrap_or_else(|_| vec![]);
            println!("Interfaces disponibles:");
            for device in &devices {
                println!("  - {}", device.name);
            }
            
            let target_device = devices.iter().find(|d| {
                d.name == interface_name || 
                d.name.contains(&interface_name) || 
                d.desc.as_ref().map(|desc| desc.contains(&interface_name)).unwrap_or(false)
            });
            
            if let Some(device) = target_device {
                println!("Interface sélectionnée: {}", device.name);
                
                match Capture::from_device(device.clone()) {
                    Ok(cap) => {
                        match cap.open() {
                            Ok(mut cap) => {
                                println!("Capture démarrée sur {}", device.name);
                                
                                // Filtre DHCP avec gestion d'erreur améliorée
                                match cap.filter("udp and (port 67 or port 68)", true) {
                                    Ok(_) => println!("✅ Filtre DHCP appliqué avec succès"),
                                    Err(e) => {
                                        println!("⚠️ Erreur filtre DHCP: {}, tentative sans filtre...", e);
                                        // Essayer sans filtre si le filtre échoue
                                        if let Err(e2) = cap.filter("", true) {
                                            println!("❌ Impossible d'appliquer un filtre: {}", e2);
                                        } else {
                                            println!("✅ Capture sans filtre appliquée");
                                        }
                                    }
                                }

                                let mut packet_count = 0;
                                let start_time = std::time::Instant::now();
                                
                                println!("🚀 Starting capture loop on {}", device.name);
                                
                                // Boucle de capture avec timeout très court
                                let mut should_stop = false;
                                let mut last_check = std::time::Instant::now();
                                let mut consecutive_errors = 0;
                                let max_consecutive_errors = 5;
                                
                                while !should_stop {
                                    // Vérifier l'arrêt toutes les 10ms (reduced from 1ms for better performance)
                                    if last_check.elapsed() > std::time::Duration::from_millis(10) {
                                        if let Ok(capturing) = is_capturing.lock() {
                                            if !*capturing {
                                                println!("🛑 Arrêt de la capture demandé");
                                                should_stop = true;
                                                break;
                                            }
                                        }
                                        last_check = std::time::Instant::now();
                                    }
                                    
                                    // Capturer un paquet avec timeout très court
                                    match cap.next_packet() {
                                        Ok(packet) => {
                                            consecutive_errors = 0; // Reset error counter on success
                                            packet_count += 1;
                                            let elapsed = start_time.elapsed();
                                            let packet_data = packet.data;
                                            println!("✅ Paquet #{} reçu après {:?}: {} octets", 
                                                     packet_count, elapsed, packet_data.len());

                                            Self::debug_packet_analysis(&packet_data);
                                            
                                            if let Some(dhcp_info) = Self::parse_dhcp_packet(&packet_data) {
                                                println!("🎯 DHCP détecté et parsé avec succès!");
                                                if let Err(e) = tx.send(dhcp_info) {
                                                    eprintln!("❌ Erreur envoi paquet: {}", e);
                                                } else {
                                                    println!("📤 Paquet envoyé au callback");
                                                }
                                            } else {
                                                println!("⚠️ Paquet reçu mais pas parsé comme DHCP valide");
                                            }
                                        }
                                        Err(e) => {
                                            consecutive_errors += 1;
                                            if consecutive_errors <= max_consecutive_errors {
                                                // Log only first few errors to avoid spam
                                                if consecutive_errors == 1 {
                                                    println!("⏳ En attente de paquets... (erreur: {})", e);
                                                }
                                            } else if consecutive_errors == max_consecutive_errors {
                                                println!("⚠️ {} erreurs consécutives, mais continuation de la capture...", consecutive_errors);
                                            }
                                            
                                            // Small delay to prevent CPU spinning
                                            std::thread::sleep(std::time::Duration::from_millis(1));
                                        }
                                    }
                                }
                                
                                if should_stop {
                                    println!("🛑 Capture arrêtée par l'utilisateur");
                                } else if packet_count == 0 {
                                    println!("⚠️ AUCUN PAQUET REÇU sur {} !", device.name);
                                } else {
                                    println!("✅ Capture terminée ({} paquets)", packet_count);
                                }
                            }
                            Err(e) => {
                                eprintln!("❌ Erreur ouverture capture: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("❌ Erreur création capture: {}", e);
                    }
                }
            } else {
                eprintln!("❌ Interface non trouvée: {}", interface_name);
                // Essayer de lister toutes les interfaces disponibles pour le debug
                println!("📋 Interfaces disponibles:");
                for device in &devices {
                    println!("  - {}: {}", device.name, device.desc.as_deref().unwrap_or("No description"));
                }
            }
        });
        
        // Stocker le handle du thread
        self.capture_thread = Some(capture_handle);
        
        // Traiter les paquets reçus dans un thread séparé
        thread::spawn(move || {
            for packet_data in rx {
                callback(packet_data.clone());
            }
        });
        
        Ok(())
    }

    pub fn stop_capture(&mut self) {
        if let Ok(mut capturing) = self.is_capturing.lock() {
            *capturing = false;
            println!("Arrêt de la capture demandé pour {}", self.interface_name);
        }
    }
    


    fn debug_packet_analysis(packet_data: &[u8]) {
        if packet_data.len() >= 14 {
            let eth_type = ((packet_data[12] as u16) << 8) | (packet_data[13] as u16);
            
            if eth_type == 0x0800 && packet_data.len() >= 34 {
                let protocol = packet_data[23];
                
                if protocol == 17 && packet_data.len() >= 38 {
                    let src_port = ((packet_data[34] as u16) << 8) | (packet_data[35] as u16);
                    let dst_port = ((packet_data[36] as u16) << 8) | (packet_data[37] as u16);
                    
                    if (src_port == 67 || src_port == 68) || (dst_port == 67 || dst_port == 68) {
                        println!("PAQUET DHCP DÉTECTÉ!");
                    }
                }
            }
        }
    }

    fn parse_dhcp_packet(packet_data: &[u8]) -> Option<DHCPPacket> {
        // Vérifier la taille minimale d'un paquet DHCP (plus flexible)
        if packet_data.len() < 236 { // Reduced from 240 for better compatibility
            println!("⚠️ Paquet trop court: {} octets (minimum 236)", packet_data.len());
            return None;
        }
        
        // Chercher l'option 53 (DHCP Message Type) dans les options
        let mut message_type_byte = 0;
        let mut option_50_ip: Option<Ipv4Addr> = None;
        
        // Try different starting positions for DHCP options (more flexible parsing)
        let possible_starts = [278, 282, 286, 290];
        let mut options_start = None;
        
        // Find the actual start of DHCP options
        for &start_pos in &possible_starts {
            if start_pos < packet_data.len() - 3 {
                let option_code = packet_data[start_pos];
                if option_code == 53 || option_code == 0 || option_code == 255 {
                    options_start = Some(start_pos);
                    println!("🎯 Options DHCP trouvées à l'octet {}", start_pos);
                    break;
                }
            }
        }
        
        let options_start = options_start?;
        
        // Debug: afficher les octets autour du début des options
        println!("Debug options DHCP (octets {}-{}):", options_start, options_start + 20);
        for j in options_start..std::cmp::min(options_start + 20, packet_data.len()) {
            print!("{:02x} ", packet_data[j]);
        }
        println!();
        
        // Parcourir les options DHCP
        let mut i = options_start;
        while i < packet_data.len() - 1 {
            let option_code = packet_data[i];
            let option_length = if i + 1 < packet_data.len() { packet_data[i + 1] } else { 0 };
            
            // Option 255 (End) - fin des options
            if option_code == 255 {
                println!("🏁 Fin des options DHCP");
                break;
            }
            
            // Option 0 (Padding) - ignorer
            if option_code == 0 {
                i += 1;
                continue;
            }
            
            // Vérifier que l'option a une longueur valide
            if option_length == 0 || i + 2 + option_length as usize > packet_data.len() {
                println!("⚠️ Option invalide à l'octet {}: code={}, longueur={}", i, option_code, option_length);
                i += 1;
                continue;
            }
            
            // Option 53 = DHCP Message Type
            if option_code == 53 && option_length == 1 && i + 2 < packet_data.len() {
                message_type_byte = packet_data[i + 2];
                println!("✅ Option 53 (Message Type) trouvée à l'octet {}: {}", i, message_type_byte);
            }
            
            // Option 50 = Requested IP Address
            if option_code == 50 && option_length == 4 && i + 6 <= packet_data.len() {
                let ip_bytes = [
                    packet_data[i + 2],
                    packet_data[i + 3],
                    packet_data[i + 4],
                    packet_data[i + 5],
                ];
                option_50_ip = Some(Ipv4Addr::new(ip_bytes[0], ip_bytes[1], ip_bytes[2], ip_bytes[3]));
                println!("✅ Option 50 (Requested IP) trouvée: {}", option_50_ip.unwrap());
            }
            
            i += 2 + option_length as usize;
        }
        
        // Extraire les adresses IP source et destination
        let source_ip = if packet_data.len() >= 30 {
            Ipv4Addr::new(
                packet_data[26],
                packet_data[27],
                packet_data[28],
                packet_data[29],
            )
        } else {
            Ipv4Addr::new(0, 0, 0, 0)
        };
        
        let destination_ip = if packet_data.len() >= 30 {
            Ipv4Addr::new(
                packet_data[30],
                packet_data[31],
                packet_data[32],
                packet_data[33],
            )
        } else {
            Ipv4Addr::new(0, 0, 0, 0)
        };
        
        // Créer le paquet DHCP
        let dhcp_packet = DHCPPacket {
            timestamp: Utc::now(),
            message_type: DHCPMessageType::from(message_type_byte),
            source_ip,
            destination_ip,
            option_50: option_50_ip,
            raw_data: packet_data.to_vec(),
        };
        
        println!("🎉 Paquet DHCP parsé avec succès: {:?} de {} vers {}", 
                 dhcp_packet.message_type, source_ip, destination_ip);
        
        Some(dhcp_packet)
    }


} 