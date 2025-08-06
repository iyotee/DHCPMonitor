import React from 'react';
import { Wifi, Server, AlertTriangle, CheckCircle, Cable } from 'lucide-react';

interface NetworkInterface {
  name: string;
  description: string;
  addresses: string[];
  is_loopback: boolean;
  is_up: boolean;
  real_name: string;
}

interface NetworkViewProps {
  interfaces: NetworkInterface[];
}

const NetworkView: React.FC<NetworkViewProps> = ({ interfaces }) => {
  const getInterfaceIcon = (iface: NetworkInterface) => {
    if (iface.is_loopback) {
      return <Server className="h-5 w-5 text-gray-500" />;
    }
    
    const desc = iface.description.toLowerCase();
    if (desc.includes('wifi') || desc.includes('wireless') || desc.includes('wlan')) {
      return <Wifi className="h-5 w-5 text-blue-500" />;
    } else if (desc.includes('ethernet') || desc.includes('lan')) {
      return <Cable className="h-5 w-5 text-green-500" />;
    } else {
      return <Server className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusIcon = (isUp: boolean) => {
    return isUp ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = (isUp: boolean) => {
    return isUp ? 'Actif' : 'Inactif';
  };

  const getStatusColor = (isUp: boolean) => {
    return isUp 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  const activeInterfaces = interfaces.filter(iface => !iface.is_loopback);
  const loopbackInterfaces = interfaces.filter(iface => iface.is_loopback);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Wifi className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Interfaces Réseau
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activeInterfaces.filter(iface => iface.is_up).length} interface{activeInterfaces.filter(iface => iface.is_up).length !== 1 ? 's' : ''} active{activeInterfaces.filter(iface => iface.is_up).length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Active Interfaces */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6">
          {/* Active Interfaces Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Interfaces Actives
            </h3>
            
            {activeInterfaces.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune interface active détectée
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInterfaces.map((iface, index) => (
                  <div
                    key={index}
                    className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow ${
                      iface.is_up ? 'ring-1 ring-green-200 dark:ring-green-800' : 'ring-1 ring-red-200 dark:ring-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getInterfaceIcon(iface)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {iface.description}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(iface.is_up)}
                              <span className={`text-xs font-medium ${getStatusColor(iface.is_up)}`}>
                                {getStatusText(iface.is_up)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                            {iface.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {iface.addresses.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Adresses IP:
                        </p>
                        <div className="space-y-1">
                          {iface.addresses.map((address, addrIndex) => (
                            <div key={addrIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-mono text-gray-900 dark:text-white">
                                {address}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loopback Interfaces Section */}
          {loopbackInterfaces.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Interfaces Loopback
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loopbackInterfaces.map((iface, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getInterfaceIcon(iface)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {iface.description}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(iface.is_up)}
                              <span className={`text-xs font-medium ${getStatusColor(iface.is_up)}`}>
                                {getStatusText(iface.is_up)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                            {iface.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {iface.addresses.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Adresses IP:
                        </p>
                        <div className="space-y-1">
                          {iface.addresses.map((address, addrIndex) => (
                            <div key={addrIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span className="text-xs font-mono text-gray-900 dark:text-white">
                                {address}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {interfaces.length} interface{interfaces.length !== 1 ? 's' : ''} détectée{interfaces.length !== 1 ? 's' : ''}
          </span>
          <span>
            {activeInterfaces.length} interface{activeInterfaces.length !== 1 ? 's' : ''} active{activeInterfaces.length !== 1 ? 's' : ''} disponible{activeInterfaces.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkView;