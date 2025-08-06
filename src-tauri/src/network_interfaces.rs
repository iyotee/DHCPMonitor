use std::collections::HashMap;
use pcap::Device;

#[derive(Debug, Clone)]
pub struct NetworkInterface {
    pub name: String,
    pub description: String,
    pub addresses: Vec<String>,
    pub is_loopback: bool,
    pub is_active: bool,
    pub real_name: String,
}

pub fn get_network_interfaces() -> Vec<NetworkInterface> {
    match Device::list() {
        Ok(devices) => {
            let mut interfaces = Vec::new();
            let mut interface_count = HashMap::new();
            
            for device in devices {
                let description = device.desc.unwrap_or_else(|| "Interface Réseau".to_string());
                let addresses: Vec<String> = device
                    .addresses
                    .iter()
                    .map(|addr| addr.addr.to_string())
                    .collect();
                
                // Une interface est considérée comme active si elle a des adresses
                // ou si elle n'est pas une interface de bouclage/virtuelle
                let has_addresses = !addresses.is_empty();
                let is_loopback = description.to_lowercase().contains("loopback");
                let is_not_virtual = !description.to_lowercase().contains("virtual") && 
                                   !description.to_lowercase().contains("hyper-v");
                let is_not_kernel = !description.to_lowercase().contains("kernel");
                
                let is_active = has_addresses || (!is_loopback && is_not_virtual && is_not_kernel);
                let clean_name = generate_clean_name(&description, &device.name, &mut interface_count);
                
                println!("DEBUG: Interface '{}' ({}): actif={}, loopback={}, adresses={:?}", 
                        clean_name, description, is_active, is_loopback, addresses);
                
                interfaces.push(NetworkInterface {
                    name: clean_name.clone(),
                    description,
                    addresses,
                    is_loopback,
                    is_active,
                    real_name: device.name.clone(),
                });
                
                println!("DEBUG: Nom affiché: '{}' -> Nom réel: '{}'", clean_name, device.name);
            }
            
            interfaces
        }
        Err(_) => {
            // Fallback si pcap n'est pas disponible
            vec![NetworkInterface {
                name: "Ethernet".to_string(),
                description: "Carte réseau Ethernet (fallback)".to_string(),
                addresses: vec!["192.168.1.100".to_string()],
                is_loopback: false,
                is_active: true,
                real_name: "Ethernet".to_string(),
            }]
        }
    }
}

fn generate_clean_name(description: &str, device_name: &str, interface_count: &mut HashMap<String, u32>) -> String {
    if device_name.starts_with(r"\Device\NPF_") {
        let desc_lower = description.to_lowercase();
        
        if desc_lower.contains("ethernet") || desc_lower.contains("gigabit") || desc_lower.contains("network adapter") {
            if desc_lower.contains("aquantia") {
                "Ethernet (Aquantia)".to_string()
            } else if desc_lower.contains("intel") {
                "Ethernet (Intel)".to_string()
            } else if desc_lower.contains("realtek") {
                "Ethernet (Realtek)".to_string()
            } else {
                "Ethernet".to_string()
            }
        } else if desc_lower.contains("wifi") || desc_lower.contains("wireless") || desc_lower.contains("802.11") {
            "Wi-Fi".to_string()
        } else if desc_lower.contains("bluetooth") {
            "Bluetooth".to_string()
        } else if desc_lower.contains("loopback") {
            "Loopback".to_string()
        } else if desc_lower.contains("virtual") || desc_lower.contains("hyper-v") {
            "Interface Virtuelle".to_string()
        } else if desc_lower.contains("microsoft") {
            if desc_lower.contains("kernel") {
                "Interface Kernel".to_string()
            } else {
                let count = interface_count.entry("Microsoft".to_string()).or_insert(0);
                *count += 1;
                if *count == 1 {
                    "Interface Microsoft".to_string()
                } else {
                    format!("Interface Microsoft {}", *count)
                }
            }
        } else {
            extract_meaningful_name(description)
        }
    } else {
        device_name.to_string()
    }
}

fn extract_meaningful_name(description: &str) -> String {
    let parts: Vec<&str> = description.split_whitespace().collect();
    if parts.len() > 2 {
        let meaningful_parts: Vec<&str> = parts.iter()
            .filter(|&&p| {
                let p_lower = p.to_lowercase();
                p.len() > 2 && 
                !p_lower.eq("microsoft") && 
                !p_lower.eq("adapter") && 
                !p_lower.eq("network") &&
                !p_lower.eq("interface")
            })
            .take(2)
            .copied()
            .collect();
        
        if !meaningful_parts.is_empty() {
            meaningful_parts.join(" ")
        } else {
            "Interface Réseau".to_string()
        }
    } else {
        "Interface Réseau".to_string()
    }
}

