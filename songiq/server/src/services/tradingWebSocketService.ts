import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  subscriptions: Set<string>;
  isAlive: boolean;
}

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface Subscription {
  type: 'orderbook' | 'trades' | 'ticker' | 'balance' | 'orders';
  tradingPairId?: string;
  currencyId?: string;
}

class TradingWebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // channel -> Set of clientIds
  private pingInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/trading'
    });
    this.setupWebSocketServer();
    this.setupHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      const clientId = this.generateClientId();
      ws.subscriptions = new Set();
      ws.isAlive = true;
      
      this.clients.set(clientId, ws);
      console.log(`Trading WebSocket client connected: ${clientId}`);

      // Parse authentication from query params or headers
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
          ws.userId = decoded.id || decoded.userId;
          console.log(`Client ${clientId} authenticated as user ${ws.userId}`);
        } catch (error) {
          console.log(`Client ${clientId} authentication failed`);
        }
      }

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        data: {
          clientId,
          message: 'Connected to SongIQ Trading WebSocket',
          authenticated: !!ws.userId,
          timestamp: new Date().toISOString()
        }
      });

      // Handle pong responses
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle client messages
      ws.on('message', (message: string) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message);
          this.handleClientMessage(clientId, parsedMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(clientId, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });
  }

  private handleClientMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message.data);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message.data);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', data: { timestamp: Date.now() } });
        break;
      default:
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  private handleSubscribe(clientId: string, subscription: Subscription) {
    const client = this.clients.get(clientId);
    if (!client) return;

    let channel: string = subscription.type;
    
    if (subscription.tradingPairId) {
      channel = `${subscription.type}:${subscription.tradingPairId}`;
    } else if (subscription.currencyId) {
      channel = `${subscription.type}:${subscription.currencyId}`;
    } else if (subscription.type === 'balance' || subscription.type === 'orders') {
      // User-specific channels require authentication
      if (!client.userId) {
        this.sendError(clientId, 'Authentication required for this subscription');
        return;
      }
      channel = `${subscription.type}:${client.userId}`;
    }

    // Add to client subscriptions
    client.subscriptions.add(channel);

    // Add to channel subscriptions
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(clientId);

    this.sendToClient(clientId, {
      type: 'subscribed',
      data: { channel, subscription }
    });

    console.log(`Client ${clientId} subscribed to ${channel}`);
  }

  private handleUnsubscribe(clientId: string, subscription: Subscription) {
    const client = this.clients.get(clientId);
    if (!client) return;

    let channel: string = subscription.type;
    
    if (subscription.tradingPairId) {
      channel = `${subscription.type}:${subscription.tradingPairId}`;
    } else if (subscription.currencyId) {
      channel = `${subscription.type}:${subscription.currencyId}`;
    } else if (client.userId) {
      channel = `${subscription.type}:${client.userId}`;
    }

    client.subscriptions.delete(channel);
    this.subscriptions.get(channel)?.delete(clientId);

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      data: { channel }
    });

    console.log(`Client ${clientId} unsubscribed from ${channel}`);
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    
    if (client) {
      // Remove from all subscriptions
      client.subscriptions.forEach(channel => {
        this.subscriptions.get(channel)?.delete(clientId);
      });
    }

    this.clients.delete(clientId);
    console.log(`Trading WebSocket client disconnected: ${clientId}`);
  }

  // Public methods for broadcasting updates

  public broadcastOrderbookUpdate(tradingPairId: string, orderbook: any) {
    this.broadcast(`orderbook:${tradingPairId}`, {
      type: 'orderbook_update',
      data: {
        tradingPairId,
        orderbook,
        timestamp: new Date().toISOString()
      }
    });
  }

  public broadcastTradeExecution(tradingPairId: string, trade: any) {
    this.broadcast(`trades:${tradingPairId}`, {
      type: 'trade_executed',
      data: {
        tradingPairId,
        trade,
        timestamp: new Date().toISOString()
      }
    });

    // Also notify involved users
    if (trade.buyerUserId) {
      this.broadcastToUser(trade.buyerUserId, {
        type: 'order_filled',
        data: trade
      });
    }
    if (trade.sellerUserId) {
      this.broadcastToUser(trade.sellerUserId, {
        type: 'order_filled',
        data: trade
      });
    }
  }

  public broadcastPriceUpdate(tradingPairId: string, priceData: any) {
    this.broadcast(`ticker:${tradingPairId}`, {
      type: 'price_update',
      data: {
        tradingPairId,
        ...priceData,
        timestamp: new Date().toISOString()
      }
    });
  }

  public broadcastBalanceUpdate(userId: string, balance: any) {
    this.broadcastToUser(userId, {
      type: 'balance_update',
      data: {
        balance,
        timestamp: new Date().toISOString()
      }
    });
  }

  public broadcastOrderUpdate(userId: string, order: any) {
    this.broadcastToUser(userId, {
      type: 'order_update',
      data: {
        order,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Private helper methods

  private broadcast(channel: string, message: any) {
    const subscribers = this.subscriptions.get(channel);
    
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    subscribers.forEach(clientId => {
      this.sendToClient(clientId, message);
    });
  }

  private broadcastToUser(userId: string, message: any) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
      }
    }
  }

  private sendError(clientId: string, error: string) {
    this.sendToClient(clientId, {
      type: 'error',
      data: { error, timestamp: new Date().toISOString() }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupHeartbeat() {
    // Ping clients every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`Terminating inactive client: ${clientId}`);
          client.terminate();
          this.handleDisconnect(clientId);
          return;
        }

        client.isAlive = false;
        client.ping();
      });
    }, 30000);
  }

  // Public utility methods

  public getStats() {
    return {
      connectedClients: this.clients.size,
      activeSubscriptions: Array.from(this.subscriptions.entries()).map(([channel, clients]) => ({
        channel,
        subscribers: clients.size
      })),
      timestamp: new Date().toISOString()
    };
  }

  public closeAll() {
    clearInterval(this.pingInterval);
    this.clients.forEach((client, clientId) => {
      client.close();
    });
    this.clients.clear();
    this.subscriptions.clear();
    console.log('All trading WebSocket connections closed');
  }
}

export default TradingWebSocketService;

