use std::net::Ipv4Addr;
use chrono::{DateTime, Utc};
use thiserror::Error;
use pcap::{Device, Capture};
use std::thread;
use std::sync::{mpsc, Arc, Mutex};
use std::thread::JoinHandle;

#[derive(Error, Debug)]
pub enum DHCPError {
    #[error("Capture error: {0}")]
    CaptureError(String),
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
                                
                                // Filtre DHCP
                                if let Err(e) = cap.filter("udp and (port 67 or port 68)", true) {
                                    println!("Erreur filtre DHCP: {}", e);
                                } else {
                                    println!("Filtre DHCP appliqué");
                                }

                                let mut packet_count = 0;
                                let start_time = std::time::Instant::now();
                                
                                println!("En attente de paquets sur {}...", device.name);
                                
                                // Boucle de capture avec timeout très court
                                let mut should_stop = false;
                                let mut last_check = std::time::Instant::now();
                                
                                while !should_stop {
                                    // Vérifier l'arrêt toutes les 1ms
                                    if last_check.elapsed() > std::time::Duration::from_millis(1) {
                                        if let Ok(capturing) = is_capturing.lock() {
                                            if !*capturing {
                                                println!("Arrêt de la capture demandé");
                                                should_stop = true;
                                                break;
                                            }
                                        }
                                        last_check = std::time::Instant::now();
                                    }
                                    
                                    // Capturer un paquet avec timeout très court
                                    match cap.next_packet() {
                                        Ok(packet) => {
                                            packet_count += 1;
                                            let elapsed = start_time.elapsed();
                                            let packet_data = packet.data;
                                            println!("Paquet #{} reçu après {:?}: {} octets", 
                                                     packet_count, elapsed, packet_data.len());

                                            Self::debug_packet_analysis(&packet_data);
                                            
                                            if let Some(dhcp_info) = Self::parse_dhcp_packet(&packet_data) {
                                                println!("DHCP détecté!");
                                                let _ = tx.send(dhcp_info);
                                            }
                                        }
                                        Err(_) => {
                                            // Pas de paquet reçu, continuer la boucle
                                            // Le délai est géré par la vérification d'arrêt ci-dessus
                                        }
                                    }
                                }
                                
                                if should_stop {
                                    println!("Capture arrêtée par l'utilisateur");
                                } else if packet_count == 0 {
                                    println!("AUCUN PAQUET REÇU sur {} !", device.name);
                                } else {
                                    println!("Capture terminée ({} paquets)", packet_count);
                                }
                            }
                            Err(e) => {
                                println!("Erreur ouverture capture: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        println!("Erreur création capture: {}", e);
                    }
                }
            } else {
                println!("Interface non trouvée: {}", interface_name);
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
        // Vérifier la taille minimale d'un paquet DHCP
        if packet_data.len() < 240 {
            return None;
        }
        
        // Chercher l'option 53 (DHCP Message Type) dans les options
        let mut message_type_byte = 0;
        let mut i = 278; // Début des options DHCP (basé sur les logs)
        
        // Debug: afficher les octets autour de 278
        println!("Debug options DHCP (octets 278-298):");
        for j in 278..std::cmp::min(298, packet_data.len()) {
            print!("{:02x} ", packet_data[j]);
        }
        println!();
        
        // Parcourir tous les octets pour trouver l'Option 53
        while i < packet_data.len() - 1 {
            let option_code = packet_data[i];
            let option_length = if i + 1 < packet_data.len() { packet_data[i + 1] } else { 0 };
            
            println!("Option à l'octet {}: code={}, longueur={}", i, option_code, option_length);
            
            // Option 255 (End) - fin des options
            if option_code == 255 {
                println!("Fin des options DHCP");
                break;
            }
            
            // Option 0 (Padding) - ignorer
            if option_code == 0 {
                i += 1;
                continue;
            }
            
            // Option 53 = DHCP Message Type
            if option_code == 53 && option_length == 1 && i + 2 < packet_data.len() {
                message_type_byte = packet_data[i + 2];
                println!("Option 53 (Message Type) trouvée à l'octet {}: {}", i, message_type_byte);
                // Ne pas break ici, continuer pour trouver Option 50
            }
            
            i += 2 + option_length as usize;
        }
        
        // Si on n'a pas trouvé l'Option 53, chercher dans les octets suivants
        if message_type_byte == 0 {
            println!("Option 53 non trouvée, recherche dans les octets suivants...");
            let mut j = 278;
            while j < packet_data.len() - 2 {
                if packet_data[j] == 53 && packet_data[j + 1] == 1 && j + 2 < packet_data.len() {
                    message_type_byte = packet_data[j + 2];
                    println!("Option 53 trouvée à l'octet {}: {}", j, message_type_byte);
                    break;
                }
                j += 1;
            }
        }
        
        let message_type = DHCPMessageType::from(message_type_byte);
        println!("Type DHCP détecté: {:?} (byte: {})", message_type, message_type_byte);
        
        // Afficher les types de messages DHCP de manière plus claire
        match message_type_byte {
            1 => println!("DHCP DISCOVER"),
            2 => println!("DHCP OFFER"),
            3 => println!("DHCP REQUEST"),
            4 => println!("DHCP DECLINE"),
            5 => println!("DHCP ACK"),
            6 => println!("DHCP NAK"),
            7 => println!("DHCP RELEASE"),
            8 => println!("DHCP INFORM"),
            _ => println!("Type DHCP inconnu: {}", message_type_byte),
        }
        
        // Extraire les adresses IP source et destination depuis les en-têtes IP
        let source_ip = if packet_data.len() >= 26 {
            Ipv4Addr::new(packet_data[26], packet_data[27], packet_data[28], packet_data[29])
        } else {
            Ipv4Addr::new(0, 0, 0, 0)
        };
        
        let destination_ip = if packet_data.len() >= 30 {
            Ipv4Addr::new(packet_data[30], packet_data[31], packet_data[32], packet_data[33])
        } else {
            Ipv4Addr::new(255, 255, 255, 255)
        };
        
        
        
        // Chercher l'Option 50 (Requested IP Address) et autres options importantes
        let mut option_50 = None;
        let mut i = 278; // Début des options DHCP
        
        println!("Recherche des options DHCP à partir de l'octet {}", i);
        
        // Parcourir tous les octets pour trouver toutes les options
        while i < packet_data.len() - 1 {
            let option_code = packet_data[i];
            let option_length = if i + 1 < packet_data.len() { packet_data[i + 1] } else { 0 };
            
            // Option 255 (End) - fin des options
            if option_code == 255 {
                println!("Fin des options DHCP à l'octet {}", i);
                break;
            }
            
            // Option 0 (Padding) - ignorer
            if option_code == 0 {
                i += 1;
                continue;
            }
            
            println!("Option DHCP trouvée à l'octet {}: code={}, longueur={}", i, option_code, option_length);
            
            // Option 50 (Requested IP Address)
            if option_code == 50 && option_length == 4 && i + 5 < packet_data.len() {
                let ip_bytes = [packet_data[i + 2], packet_data[i + 3], 
                               packet_data[i + 4], packet_data[i + 5]];
                option_50 = Some(Ipv4Addr::from(ip_bytes));
                println!("Option 50 trouvée à l'octet {}: {}", i, option_50.unwrap());
            }
            
            // Option 53 (DHCP Message Type) - déjà traité plus haut
            if option_code == 53 && option_length == 1 && i + 2 < packet_data.len() {
                let msg_type = packet_data[i + 2];
                println!("Option 53 (Message Type) à l'octet {}: {}", i, msg_type);
            }
            
            // Option 54 (Server Identifier)
            if option_code == 54 && option_length == 4 && i + 5 < packet_data.len() {
                let ip_bytes = [packet_data[i + 2], packet_data[i + 3], 
                               packet_data[i + 4], packet_data[i + 5]];
                let server_ip = Ipv4Addr::from(ip_bytes);
                println!("Option 54 (Server ID) à l'octet {}: {}", i, server_ip);
            }
            
            // Option 61 (Client Identifier)
            if option_code == 61 && option_length > 0 && i + 2 + option_length as usize <= packet_data.len() {
                println!("Option 61 (Client ID) trouvée à l'octet {}, longueur: {}", i, option_length);
            }
            
            // Option 32 (Requested IP Address) - alternative à Option 50
            if option_code == 32 && option_length == 4 && i + 5 < packet_data.len() {
                let ip_bytes = [packet_data[i + 2], packet_data[i + 3], 
                               packet_data[i + 4], packet_data[i + 5]];
                let requested_ip = Ipv4Addr::from(ip_bytes);
                println!("Option 32 (Requested IP) trouvée à l'octet {}: {}", i, requested_ip);
                // Utiliser Option 32 comme fallback si Option 50 n'est pas trouvée
                if option_50.is_none() {
                    option_50 = Some(requested_ip);
                    println!("Utilisation de l'Option 32 comme adresse demandée: {}", requested_ip);
                }
            }
            
            i += 2 + option_length as usize;
        }
        
        // Si on n'a pas trouvé l'Option 50/32, chercher dans les octets suivants
        if option_50.is_none() {
            println!("Option 50/32 non trouvée, recherche dans les octets suivants...");
            let mut j = 278;
            while j < packet_data.len() - 5 {
                // Chercher Option 50
                if packet_data[j] == 50 && packet_data[j + 1] == 4 && j + 5 < packet_data.len() {
                    let ip_bytes = [packet_data[j + 2], packet_data[j + 3], 
                                   packet_data[j + 4], packet_data[j + 5]];
                    option_50 = Some(Ipv4Addr::from(ip_bytes));
                    println!("Option 50 trouvée à l'octet {}: {}", j, option_50.unwrap());
                    break;
                }
                // Chercher Option 32
                if packet_data[j] == 32 && packet_data[j + 1] == 4 && j + 5 < packet_data.len() {
                    let ip_bytes = [packet_data[j + 2], packet_data[j + 3], 
                                   packet_data[j + 4], packet_data[j + 5]];
                    let requested_ip = Ipv4Addr::from(ip_bytes);
                    option_50 = Some(requested_ip);
                    println!("Option 32 trouvée à l'octet {}: {}", j, requested_ip);
                    break;
                }
                j += 1;
            }
        }
        
        // Retourner le paquet DHCP
        if option_50.is_some() {
            println!("Paquet DHCP avec Option 50 valide détecté!");
        } else {
            println!("Paquet DHCP détecté (sans Option 50)");
        }
        
                            Some(DHCPPacket {
                        timestamp: Utc::now(),
                        message_type,
                        source_ip,
                        destination_ip,
                        option_50,
                        raw_data: packet_data.to_vec(),
                    })
    }


} 