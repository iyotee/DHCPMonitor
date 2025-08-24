import React, { useState, useEffect } from 'react';
import { core } from '@tauri-apps/api';
import { Trash2, Download, Filter } from 'lucide-react';
import PacketDetails from './PacketDetails';

interface DHCPLog {
  timestamp: string;
  packet_type: string;
  source_ip: string;
  destination_ip: string;
  option_50: string | null;
  interface: string;
  raw_data: string;
}

interface LogsViewProps {
  isCapturing: boolean;
}

const LogsView: React.FC<LogsViewProps> = ({ isCapturing }) => {
  const [logs, setLogs] = useState<DHCPLog[]>([]);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedPacket, setSelectedPacket] = useState<DHCPLog | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const isTauri = window.__TAURI__ !== undefined;
        
        if (isTauri) {
          // Application de bureau - utiliser le backend Rust
          const fetchedLogs = await core.invoke<DHCPLog[]>('get_logs');
          setLogs(fetchedLogs);
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
          ];
          setLogs(mockLogs);
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    // Fetch logs initially
    fetchLogs();

    // Set up polling if capturing - reduced interval for better responsiveness
    if (isCapturing) {
      const interval = setInterval(fetchLogs, 100); // Changed from 1000ms to 100ms
      return () => clearInterval(interval);
    }
  }, [isCapturing]);

  const clearLogs = async () => {
    try {
      const isTauri = window.__TAURI__ !== undefined;
      
      if (isTauri) {
        // Application de bureau - utiliser le backend Rust
        await core.invoke('clear_logs');
      } else {
        // Version web - simulation
        console.log('Simulation: logs effacés');
      }
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const getLogColor = (packetType: string) => {
    switch (packetType.toLowerCase()) {
      case 'discover':
        return 'text-blue-600 dark:text-blue-400';
      case 'offer':
        return 'text-green-600 dark:text-green-400';
      case 'request':
        return 'text-orange-600 dark:text-orange-400';
      case 'ack':
        return 'text-purple-600 dark:text-purple-400';
      case 'nack':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLogBgColor = (packetType: string) => {
    switch (packetType.toLowerCase()) {
      case 'discover':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'offer':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'request':
        return 'bg-orange-50 dark:bg-orange-900/20';
      case 'ack':
        return 'bg-purple-50 dark:bg-purple-900/20';
      case 'nack':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  const filteredLogs = logs.filter(log =>
    log.packet_type.toLowerCase().includes(filter.toLowerCase()) ||
    log.source_ip.includes(filter) ||
    log.destination_ip.includes(filter) ||
    (log.option_50 && log.option_50.includes(filter))
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Logs DHCP
          </h2>
          {isCapturing && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400">
                Capture en cours
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filtrer les logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          
          <button
            onClick={clearLogs}
            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            title="Effacer les logs"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Destination IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Option 50
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Interface
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {isCapturing ? 'En attente de paquets DHCP...' : 'Aucun log disponible'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${getLogBgColor(log.packet_type)}`}
                    onDoubleClick={() => setSelectedPacket(log)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogColor(log.packet_type)}`}>
                        {log.packet_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {log.source_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {log.destination_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.option_50 ? (
                        <span className="text-purple-600 dark:text-purple-400 font-mono">
                          {log.option_50}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {log.interface}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} affiché{filteredLogs.length !== 1 ? 's' : ''}
          </span>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span>Défilement automatique</span>
          </label>
        </div>
      </div>

      {/* Packet Details Modal */}
      {selectedPacket && (
        <PacketDetails
          packet={selectedPacket}
          onClose={() => setSelectedPacket(null)}
        />
      )}
    </div>
  );
};

export default LogsView;