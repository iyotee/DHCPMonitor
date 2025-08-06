import React, { useState, useEffect } from 'react';
import { core } from '@tauri-apps/api';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface DHCPLog {
  timestamp: string;
  packet_type: string;
  source_ip: string;
  destination_ip: string;
  option_50: string | null;
  interface: string;
  raw_data: string;
}

interface Option50ViewProps {
  isCapturing: boolean;
}

const Option50View: React.FC<Option50ViewProps> = ({ isCapturing }) => {
  const [logs, setLogs] = useState<DHCPLog[]>([]);
  const [option50Count, setOption50Count] = useState(0);
  const [totalPackets, setTotalPackets] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const isTauri = window.__TAURI__ !== undefined;
        
        if (isTauri) {
          // Application de bureau - utiliser le backend Rust
          const fetchedLogs = await core.invoke<DHCPLog[]>('get_logs');
          setLogs(fetchedLogs);
          
          // Calculate statistics
          const option50Logs = fetchedLogs.filter(log => log.option_50);
          setOption50Count(option50Logs.length);
          setTotalPackets(fetchedLogs.length);
        } else {
          // Version web - données simulées
          const mockLogs: DHCPLog[] = [
            {
              timestamp: new Date().toISOString(),
              packet_type: "DISCOVER",
              source_ip: "0.0.0.0",
              destination_ip: "255.255.255.255",
              option_50: "192.168.1.100",
              interface: "Ethernet",
              raw_data: "Simulation de paquet DHCP",
            },
            {
              timestamp: new Date(Date.now() - 5000).toISOString(),
              packet_type: "OFFER",
              source_ip: "192.168.1.1",
              destination_ip: "192.168.1.100",
              option_50: "192.168.1.100",
              interface: "Ethernet",
              raw_data: "Simulation de paquet DHCP",
            },
            {
              timestamp: new Date(Date.now() - 10000).toISOString(),
              packet_type: "REQUEST",
              source_ip: "0.0.0.0",
              destination_ip: "255.255.255.255",
              option_50: null,
              interface: "Ethernet",
              raw_data: "Simulation de paquet DHCP",
            },
          ];
          setLogs(mockLogs);
          
          // Calculate statistics
          const option50Logs = mockLogs.filter(log => log.option_50);
          setOption50Count(option50Logs.length);
          setTotalPackets(mockLogs.length);
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();

    if (isCapturing) {
      const interval = setInterval(fetchLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [isCapturing]);

  const option50Logs = logs.filter(log => log.option_50);

  const getPacketTypeIcon = (packetType: string) => {
    switch (packetType.toLowerCase()) {
      case 'discover':
        return '🔍';
      case 'offer':
        return '📦';
      case 'request':
        return '📤';
      case 'ack':
        return '✅';
      case 'nack':
        return '❌';
      default:
        return '📋';
    }
  };

  const getPacketTypeColor = (packetType: string) => {
    switch (packetType.toLowerCase()) {
      case 'discover':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'request':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ack':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'nack':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Shield className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Option 50 - Requested IP Address
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {option50Count} paquet{option50Count !== 1 ? 's' : ''} avec Option 50
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalPackets} paquet{totalPackets !== 1 ? 's' : ''} total{totalPackets !== 1 ? 'aux' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Paquets Option 50
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {option50Count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Paquets
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalPackets}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pourcentage
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalPackets > 0 ? Math.round((option50Count / totalPackets) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Option 50 Logs */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Paquets avec Option 50
          </h3>
          
          {option50Logs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {isCapturing ? 'En attente de paquets avec Option 50...' : 'Aucun paquet avec Option 50 trouvé'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {option50Logs.map((log, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getPacketTypeIcon(log.packet_type)}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPacketTypeColor(log.packet_type)}`}>
                            {log.packet_type.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Source: <span className="font-mono text-gray-900 dark:text-white">{log.source_ip}</span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Destination: <span className="font-mono text-gray-900 dark:text-white">{log.destination_ip}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Interface: <span className="font-mono text-gray-900 dark:text-white">{log.interface}</span>
                            </span>
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              Option 50: <span className="font-mono">{log.option_50}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Option50View;