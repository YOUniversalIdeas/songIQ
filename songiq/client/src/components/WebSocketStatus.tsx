import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTradingWebSocket } from '../contexts/TradingWebSocketContext';

const WebSocketStatus: React.FC = () => {
  const { isConnected, lastError, reconnect } = useTradingWebSocket();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg text-sm">
        <Wifi className="w-4 h-4" />
        <span className="hidden sm:inline">Live</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-lg text-sm">
      <WifiOff className="w-4 h-4" />
      <span className="hidden sm:inline">Reconnecting...</span>
      <button
        onClick={reconnect}
        className="ml-1 hover:bg-yellow-200 dark:hover:bg-yellow-800/30 rounded p-0.5 transition-colors"
        title="Reconnect"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
};

export default WebSocketStatus;

