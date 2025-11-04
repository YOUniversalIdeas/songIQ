import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';

interface OrderBook {
  bids: Array<{ price: number; amount: number }>;
  asks: Array<{ price: number; amount: number }>;
}

interface PriceUpdate {
  lastPrice: number;
  price24hHigh: number;
  price24hLow: number;
  price24hChange: number;
  volume24h: number;
}

interface Trade {
  amount: number;
  price: number;
  timestamp: string;
}

interface WebSocketHookOptions {
  enabled?: boolean;
  reconnect?: boolean;
  reconnectDelay?: number;
}

export const useTradingWebSocket = (options: WebSocketHookOptions = {}) => {
  const { token } = useAuth();
  const { enabled = true, reconnect = true, reconnectDelay = 3000 } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  // Message handlers
  const handlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const wsUrl = `ws://localhost:5001/ws/trading${token ? `?token=${token}` : ''}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Trading WebSocket connected');
        setIsConnected(true);
        setError(null);

        // Resubscribe to channels
        subscriptionsRef.current.forEach((channel) => {
          const [type, id] = channel.split(':');
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
          
          // Call all registered handlers for this message type
          const handlers = handlersRef.current.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message.data));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('Trading WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnect && enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to connect to WebSocket:', err);
    }
  }, [enabled, token, reconnect, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
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

  const on = useCallback((messageType: string, handler: (data: any) => void) => {
    if (!handlersRef.current.has(messageType)) {
      handlersRef.current.set(messageType, new Set());
    }
    handlersRef.current.get(messageType)!.add(handler);

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(messageType)?.delete(handler);
    };
  }, []);

  const send = useCallback((type: string, data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe,
    on,
    send,
    reconnect: connect
  };
};

// Hook for orderbook updates
export const useOrderbook = (tradingPairId: string | null) => {
  const [orderbook, setOrderbook] = useState<OrderBook>({ bids: [], asks: [] });
  const ws = useTradingWebSocket();

  useEffect(() => {
    if (!tradingPairId || !ws.isConnected) return;

    // Subscribe to orderbook updates
    ws.subscribe('orderbook', tradingPairId);

    // Handle orderbook updates
    const unsubscribe = ws.on('orderbook_update', (data) => {
      if (data.tradingPairId === tradingPairId) {
        setOrderbook(data.orderbook);
      }
    });

    return () => {
      unsubscribe();
      ws.unsubscribe('orderbook', tradingPairId);
    };
  }, [tradingPairId, ws.isConnected]);

  return orderbook;
};

// Hook for price updates
export const usePriceTicker = (tradingPairId: string | null) => {
  const [priceData, setPriceData] = useState<PriceUpdate | null>(null);
  const ws = useTradingWebSocket();

  useEffect(() => {
    if (!tradingPairId || !ws.isConnected) return;

    ws.subscribe('ticker', tradingPairId);

    const unsubscribe = ws.on('price_update', (data) => {
      if (data.tradingPairId === tradingPairId) {
        setPriceData(data);
      }
    });

    return () => {
      unsubscribe();
      ws.unsubscribe('ticker', tradingPairId);
    };
  }, [tradingPairId, ws.isConnected]);

  return priceData;
};

// Hook for recent trades
export const useRecentTrades = (tradingPairId: string | null) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const ws = useTradingWebSocket();

  useEffect(() => {
    if (!tradingPairId || !ws.isConnected) return;

    ws.subscribe('trades', tradingPairId);

    const unsubscribe = ws.on('trade_executed', (data) => {
      if (data.tradingPairId === tradingPairId) {
        setTrades(prev => [data.trade, ...prev.slice(0, 49)]); // Keep last 50
      }
    });

    return () => {
      unsubscribe();
      ws.unsubscribe('trades', tradingPairId);
    };
  }, [tradingPairId, ws.isConnected]);

  return trades;
};

// Hook for user balance updates
export const useBalanceUpdates = () => {
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const ws = useTradingWebSocket();
  const { token } = useAuth();

  useEffect(() => {
    if (!token || !ws.isConnected) return;

    ws.subscribe('balance');

    const unsubscribe = ws.on('balance_update', (data) => {
      setLastUpdate(data);
    });

    return () => {
      unsubscribe();
      ws.unsubscribe('balance');
    };
  }, [token, ws.isConnected]);

  return lastUpdate;
};

// Hook for user order updates
export const useOrderUpdates = () => {
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const ws = useTradingWebSocket();
  const { token } = useAuth();

  useEffect(() => {
    if (!token || !ws.isConnected) return;

    ws.subscribe('orders');

    const unsubscribe = ws.on('order_update', (data) => {
      setLastUpdate(data);
    });

    return () => {
      unsubscribe();
      ws.unsubscribe('orders');
    };
  }, [token, ws.isConnected]);

  return lastUpdate;
};

