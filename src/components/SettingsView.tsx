import React, { useState } from 'react';
import { Settings, Monitor, Shield, Info, Download, Github } from 'lucide-react';

const SettingsView: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [maxLogs, setMaxLogs] = useState(1000);
  const [showRawData, setShowRawData] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Settings className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Paramètres
          </h2>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl space-y-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Monitor className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Paramètres Généraux
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actualisation automatique
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mettre à jour les données en temps réel
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intervalle d'actualisation (ms)
                </label>
                <input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  min="500"
                  max="10000"
                  step="500"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Intervalle entre les mises à jour (500ms - 10s)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre maximum de logs
                </label>
                <input
                  type="number"
                  value={maxLogs}
                  onChange={(e) => setMaxLogs(Number(e.target.value))}
                  min="100"
                  max="10000"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Limite le nombre de logs en mémoire
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Afficher les données brutes
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Inclure les données hexadécimales dans les logs
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRawData}
                    onChange={(e) => setShowRawData(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Sécurité et Permissions
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Privilèges Administrateur Requis
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Cette application nécessite des privilèges administrateur pour capturer les paquets DHCP. 
                      Assurez-vous d'exécuter l'application en tant qu'administrateur.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Instructions d'Exécution
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                      <p><strong>Windows:</strong> Clic droit → "Exécuter en tant qu'administrateur"</p>
                      <p><strong>Linux/macOS:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">sudo ./dhcp-monitor</code></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Info className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                À Propos
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  DHCP Monitor - Option 50 Tracker
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Application moderne de surveillance DHCP avec détection spécifique de l'Option 50 (Requested IP Address).
                  Développée avec Tauri, React et TypeScript pour une expérience multiplateforme.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Version:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1.0.0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Licence:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">MIT</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  <Download className="h-4 w-4" />
                  <span>Vérifier les mises à jour</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <Github className="h-4 w-4" />
                  <span>Code source</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;