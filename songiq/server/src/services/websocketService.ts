import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { AnalysisProgress } from './realTimeAnalysisService';

interface WebSocketMessage {
  type: 'analysis_progress' | 'analysis_complete' | 'analysis_error' | 'subscribe_to_analysis' | 'unsubscribe_from_analysis';
  data: any;
}

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        data: { clientId, message: 'Connected to songIQ WebSocket service' }
      }));

      // Handle client messages
      ws.on('message', (message: string) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message);
          this.handleClientMessage(clientId, parsedMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  private handleClientMessage(clientId: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe_to_analysis':
        // Client wants to subscribe to analysis updates for a specific song
        const { songId } = message.data;
        this.subscribeToAnalysis(clientId, songId);
        break;
      
      case 'unsubscribe_from_analysis':
        // Client wants to unsubscribe from analysis updates
        const { songId: unsubSongId } = message.data;
        this.unsubscribeFromAnalysis(clientId, unsubSongId);
        break;
      
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private subscribeToAnalysis(clientId: string, songId: string) {
    // Store subscription mapping
    console.log(`Client ${clientId} subscribed to analysis updates for song ${songId}`);
  }

  private unsubscribeFromAnalysis(clientId: string, songId: string) {
    // Remove subscription mapping
    console.log(`Client ${clientId} unsubscribed from analysis updates for song ${songId}`);
  }

  // Send analysis progress update to all subscribed clients
  public broadcastAnalysisProgress(progress: AnalysisProgress) {
    const message: WebSocketMessage = {
      type: 'analysis_progress',
      data: progress
    };

    this.broadcast(message);
  }

  // Send analysis completion to all subscribed clients
  public broadcastAnalysisComplete(results: AnalysisProgress) {
    const message: WebSocketMessage = {
      type: 'analysis_complete',
      data: results
    };

    this.broadcast(message);
  }

  // Send analysis error to all subscribed clients
  public broadcastAnalysisError(songId: string, error: string) {
    const message: WebSocketMessage = {
      type: 'analysis_error',
      data: { songId, error }
    };

    this.broadcast(message);
  }

  private broadcast(message: WebSocketMessage) {
    const messageString = JSON.stringify(message);
    
    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageString);
        } catch (error) {
          console.error(`Error sending message to client ${clientId}:`, error);
          // Remove failed client
          this.clients.delete(clientId);
        }
      }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current client count
  public getClientCount(): number {
    return this.clients.size;
  }

  // Get all connected client IDs
  public getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }
}

export default WebSocketService;
