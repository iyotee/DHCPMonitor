import React, { useState, useEffect } from 'react';
import { core } from '@tauri-apps/api';
import { 
  Activity, 
  Network, 
  Settings, 
  Shield, 
  Wifi,
  Moon,
  Sun
} from 'lucide-react';
import LogsView from './components/LogsView';
import Option50View from './components/Option50View';
import NetworkView from './components/NetworkView';
import SettingsView from './components/SettingsView';

type View = 'logs' | 'option50' | 'network' | 'settings';

interface NetworkInterface {
  name: string;
  description: string;
  addresses: string[];
  is_loopback: boolean;
  is_up: boolean;
  real_name: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('logs');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  // Mode de capture fixe - toujours réel
  const useRealCapture = true;

  useEffect(() => {
    // Apply dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Load network interfaces on startup
    loadInterfaces();
  }, []);

  const loadInterfaces = async () => {
    try {
      // Vérifier si nous sommes dans l'application de bureau ou dans le navigateur
      const isTauri = window.__TAURI__ !== undefined;
      
      if (isTauri) {
        // Application de bureau - utiliser le backend Rust
        const interfaces = await core.invoke<NetworkInterface[]>('get_interfaces');
        setInterfaces(interfaces);
        if (interfaces.length > 0 && !selectedInterface) {
          setSelectedInterface(interfaces[0].name);
        }
      } else {
        // Version web - utiliser des données simulées
        const mockInterfaces: NetworkInterface[] = [
          {
            name: "Ethernet",
            description: "Carte réseau Ethernet (simulée)",
            addresses: ["192.168.1.100"],
            is_loopback: false,
            is_up: true,
          },
          {
            name: "Wi-Fi",
            description: "Carte réseau Wi-Fi (simulée)",
            addresses: ["192.168.1.101"],
            is_loopback: false,
            is_up: true,
          },
          {
            name: "Loopback",
            description: "Interface de bouclage (simulée)",
            addresses: ["127.0.0.1"],
            is_loopback: true,
            is_up: false,
          },
        ];
        setInterfaces(mockInterfaces);
        if (mockInterfaces.length > 0 && !selectedInterface) {
          setSelectedInterface(mockInterfaces[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to load interfaces:', error);
    }
  };

  const startCapture = async () => {
    if (!selectedInterface) return;
    
    try {
      const isTauri = window.__TAURI__ !== undefined;
      
      if (isTauri) {
        // Vérifier Npcap d'abord
        const npcapInstalled = await core.invoke<boolean>('check_npcap');
        if (!npcapInstalled) {
          alert('Npcap n\'est pas installé. Veuillez installer Npcap depuis https://npcap.com/ pour capturer les paquets DHCP.');
          return;
        }
        
        // Trouver l'interface sélectionnée pour obtenir son nom réel
        const selectedIface = interfaces.find(iface => iface.name === selectedInterface);
        const interfaceName = selectedIface?.real_name || selectedInterface;
        
        console.log('Démarrage capture sur:', selectedInterface, '-> nom réel:', interfaceName);
        
        // Application de bureau - utiliser le backend Rust
        await core.invoke('start_capture', { interfaceName });
      } else {
        // Version web - simulation
        console.log('Simulation de capture démarrée sur:', selectedInterface);
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Failed to start capture:', error);
      if (error instanceof Error && error.message.includes('Npcap')) {
        alert('Erreur: ' + error.message);
      }
    }
  };

  const stopCapture = async () => {
    try {
      const isTauri = window.__TAURI__ !== undefined;
      
      if (isTauri) {
        // Application de bureau - utiliser le backend Rust
        await core.invoke('stop_capture');
      } else {
        // Version web - simulation
        console.log('Simulation de capture arrêtée');
      }
      setIsCapturing(false);
    } catch (error) {
      console.error('Failed to stop capture:', error);
    }
  };

  const navigation = [
    { id: 'logs', name: 'Logs', icon: Activity, color: 'text-blue-500' },
    { id: 'option50', name: 'Option 50', icon: Shield, color: 'text-purple-500' },
    { id: 'network', name: 'Réseau', icon: Network, color: 'text-orange-500' },
    { id: 'settings', name: 'Paramètres', icon: Settings, color: 'text-gray-500' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'logs':
        return <LogsView isCapturing={isCapturing} />;
      case 'option50':
        return <Option50View isCapturing={isCapturing} />;
      case 'network':
        return <NetworkView interfaces={interfaces} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <LogsView isCapturing={isCapturing} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Wifi className="h-6 w-6 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              DHCP Monitor
            </h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id as View)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Capture Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interface réseau
              </label>
              <select
                value={selectedInterface}
                onChange={(e) => setSelectedInterface(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {interfaces.map((iface) => (
                  <option key={iface.name} value={iface.name}>
                    {iface.name}
                  </option>
                ))}
              </select>
            </div>

            

            <button
              onClick={isCapturing ? stopCapture : startCapture}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isCapturing
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isCapturing ? 'Arrêter la capture' : 'Démarrer la capture'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export default App;