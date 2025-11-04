import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (type: string, id?: string) => void;
  unsubscribe: (type: string, id?: string) => void;
  on: (event: string, handler: (data: any) => void) => () => void;
  send: (type: string, data?: any) => void;
  lastError: string | null;
}

const TradingWebSocketContext = createContext<WebSocketContextType | null>(null);

export const useTradingWebSocket = () => {
  const context = useContext(TradingWebSocketContext);
  if (!context) {
    throw new Error('useTradingWebSocket must be used within TradingWebSocketProvider');
  }
  return context;
};

interface TradingWebSocketProviderProps {
  children: React.ReactNode;
}

export const TradingWebSocketProvider: React.FC<TradingWebSocketProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const wsUrl = `ws://localhost:5001/ws/trading${token ? `?token=${token}` : ''}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✓ Trading WebSocket connected');
        setIsConnected(true);
        setLastError(null);

        // Resubscribe to all channels
        subscriptionsRef.current.forEach((channel) => {
          const parts = channel.split(':');
          const type = parts[0];
          const id = parts[1];
          
          ws.send(JSON.stringify({
            type: 'subscribe',
            data: {
              type,
              ...(id ? { tradingPairId: id } : {})
            }
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Log connection messages
          if (message.type === 'connected') {
            console.log('Trading WebSocket authenticated:', message.data.authenticated);
          }
          
          // Call all registered handlers for this message type
          const handlers = handlersRef.current.get(message.type);
          if (handlers) {
            handlers.forEach(handler => {
              try {
                handler(message.data);
              } catch (err) {
                console.error('Error in message handler:', err);
              }
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setLastError('Connection error');
      };

      ws.onclose = () => {
        console.log('Trading WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err: any) {
      setLastError(err.message);
      console.error('Failed to connect to Trading WebSocket:', err);
    }
  }, [token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const subscribe = useCallback((type: string, id?: string) => {
    const channel = id ? `${type}:${id}` : type;
    subscriptionsRef.current.add(channel);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        data: {
          type,
          ...(id ? { tradingPairId: id } : {})
        }
      }));
    }
  }, []);

  const unsubscribe = useCallback((type: string, id?: string) => {
    const channel = id ? `${type}:${id}` : type;
    subscriptionsRef.current.delete(channel);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        data: {
          type,
          ...(id ? { tradingPairId: id } : {})
        }
      }));
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    return () => {
      handlersRef.current.get(event)?.delete(handler);
    };
  }, []);

  const send = useCallback((type: string, data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value: WebSocketContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    on,
    send,
    lastError
  };

  return (
    <TradingWebSocketContext.Provider value={value}>
      {children}
    </TradingWebSocketContext.Provider>
  );
};

