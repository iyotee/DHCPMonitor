import React from 'react';
import { X, Network, Clock, MapPin, Server, User, Package } from 'lucide-react';

interface DHCPLog {
  timestamp: string;
  packet_type: string;
  source_ip: string;
  destination_ip: string;
  option_50: string | null;
  interface: string;
  raw_data: string;
}

interface PacketDetailsProps {
  packet: DHCPLog;
  onClose: () => void;
}

const PacketDetails: React.FC<PacketDetailsProps> = ({ packet, onClose }) => {
  const getPacketIcon = (packetType: string) => {
    const type = packetType.toLowerCase();
    if (type.includes('discover')) {
      return <Network className="h-6 w-6 text-blue-500" />;
    } else if (type.includes('offer')) {
      return <Server className="h-6 w-6 text-green-500" />;
    } else if (type.includes('request')) {
      return <User className="h-6 w-6 text-orange-500" />;
    } else if (type.includes('ack')) {
      return <Package className="h-6 w-6 text-purple-500" />;
    } else {
      return <Network className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPacketColor = (packetType: string) => {
    const type = packetType.toLowerCase();
    if (type.includes('discover')) {
      return 'text-blue-600 dark:text-blue-400';
    } else if (type.includes('offer')) {
      return 'text-green-600 dark:text-green-400';
    } else if (type.includes('request')) {
      return 'text-orange-600 dark:text-orange-400';
    } else if (type.includes('ack')) {
      return 'text-purple-600 dark:text-purple-400';
    } else {
      return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        millisecond: '3-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const parseRawData = (rawData: string) => {
    try {
      // Essayer de parser les données hexadécimales
      if (rawData.startsWith('[') && rawData.endsWith(']')) {
        const hexString = rawData.slice(1, -1).replace(/,/g, ' ').trim();
        return hexString.split(' ').map(byte => byte.padStart(2, '0')).join(' ');
      }
      return rawData;
    } catch {
      return rawData;
    }
  };

  const extractDHCPOptions = (rawData: string) => {
    const options: { [key: number]: string } = {};
    try {
      const hexData = parseRawData(rawData);
      const bytes = hexData.split(' ').map(byte => parseInt(byte, 16));
      
      // Chercher les options DHCP (commencent à l'offset 240)
      let i = 240;
      while (i < bytes.length - 1) {
        const optionCode = bytes[i];
        const optionLength = bytes[i + 1];
        
        if (optionCode === 0 || optionCode === 255) break; // Fin des options
        
        if (i + 2 + optionLength <= bytes.length) {
          const optionData = bytes.slice(i + 2, i + 2 + optionLength);
          options[optionCode] = optionData.map(b => b.toString(16).padStart(2, '0')).join(' ');
        }
        
        i += 2 + optionLength;
      }
    } catch (e) {
      console.error('Erreur parsing options DHCP:', e);
    }
    return options;
  };

  const getOptionName = (code: number) => {
    const optionNames: { [key: number]: string } = {
      1: 'Subnet Mask',
      2: 'Time Offset',
      3: 'Router',
      6: 'DNS Server',
      12: 'Hostname',
      15: 'Domain Name',
      28: 'Broadcast Address',
      50: 'Requested IP Address',
      51: 'IP Address Lease Time',
      53: 'DHCP Message Type',
      54: 'Server Identifier',
      55: 'Parameter Request List',
      60: 'Vendor Class Identifier',
      61: 'Client Identifier',
      66: 'TFTP Server Name',
      67: 'Bootfile Name',
      82: 'Agent Information',
      255: 'End'
    };
    return optionNames[code] || `Option ${code}`;
  };

  const formatOptionValue = (code: number, value: string) => {
    if (code === 53) { // DHCP Message Type
      const messageTypes: { [key: string]: string } = {
        '01': 'DISCOVER',
        '02': 'OFFER', 
        '03': 'REQUEST',
        '05': 'ACK',
        '06': 'NAK',
        '07': 'DECLINE',
        '08': 'RELEASE',
        '09': 'INFORM'
      };
      return messageTypes[value] || value;
    } else if (code === 50 || code === 54) { // IP addresses
      const bytes = value.split(' ').map(byte => parseInt(byte, 16));
      if (bytes.length === 4) {
        return bytes.join('.');
      }
    }
    return value;
  };

  const dhcpOptions = extractDHCPOptions(packet.raw_data);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getPacketIcon(packet.packet_type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Paquet DHCP - {packet.packet_type}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Détails du paquet capturé
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</span>
              </div>
              <p className="text-gray-900 dark:text-white font-mono text-sm">
                {formatTimestamp(packet.timestamp)}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Network className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interface</span>
              </div>
              <p className="text-gray-900 dark:text-white font-mono text-sm">
                {packet.interface}
              </p>
            </div>
          </div>

          {/* IP Addresses */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Adresses IP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Source</span>
                </div>
                <p className="text-blue-900 dark:text-blue-100 font-mono">
                  {packet.source_ip}
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Destination</span>
                </div>
                <p className="text-green-900 dark:text-green-100 font-mono">
                  {packet.destination_ip}
                </p>
              </div>
            </div>
          </div>

          {/* Option 50 - Requested IP */}
          {packet.option_50 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Option 50 - Adresse IP demandée
                </span>
              </div>
              <p className="text-orange-900 dark:text-orange-100 font-mono text-lg font-semibold">
                {packet.option_50}
              </p>
            </div>
          )}

          {/* DHCP Options */}
          {Object.keys(dhcpOptions).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Options DHCP
              </h3>
              <div className="space-y-2">
                {Object.entries(dhcpOptions).map(([code, value]) => (
                  <div key={code} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getOptionName(parseInt(code))}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Code: {code}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-mono text-sm mt-1">
                      {formatOptionValue(parseInt(code), value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Données brutes (hex)
            </h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs font-mono">
                {parseRawData(packet.raw_data)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PacketDetails; 