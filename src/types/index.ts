// Types pour l'application DHCP Monitor

export interface DHCPLog {
  timestamp: string;
  packet_type: string;
  source_ip: string;
  destination_ip: string;
  option_50: string | null;
  interface: string;
  raw_data: string;
}

export interface Statistics {
  total_packets: number;
  option_50_packets: number;
  discover_count: number;
  offer_count: number;
  request_count: number;
  ack_count: number;
  nack_count: number;
}

export interface NetworkInterface {
  name: string;
  description: string;
  addresses: string[];
  is_loopback: boolean;
  is_up: boolean;
}

export type View = 'logs' | 'option50' | 'statistics' | 'network' | 'settings';

export interface PacketTypeData {
  name: string;
  value: number;
  color: string;
}

export interface BarChartData {
  name: string;
  packets: number;
}

// Types pour les thèmes
export type Theme = 'light' | 'dark' | 'auto';

// Types pour les paramètres
export interface AppSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  maxLogs: number;
  showRawData: boolean;
  theme: Theme;
}

// Types pour les erreurs
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}