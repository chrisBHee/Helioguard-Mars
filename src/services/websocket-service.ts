// Real-time WebSocket Service for HELIOGUARD
// Provides continuous data streaming for solar monitoring and system status

interface WebSocketMessage {
  type: 'solar_data' | 'system_status' | 'alert' | 'dsd_update' | 'user_action';
  timestamp: Date;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SolarDataStream {
  protonFlux: number;
  electronFlux: number;
  solarWindSpeed: number;
  bzComponent: number;
  timestamp: Date;
}

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskSpace: number;
  networkLatency: number;
  uptime: number;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribers: Map<string, ((data: WebSocketMessage) => void)[]> = new Map();
  private isConnected = false;
  
  // Data caches for real-time updates
  private solarCache: SolarDataStream | null = null;
  private systemCache: SystemHealth | null = null;
  private alertCache: any[] = [];

  private constructor() {
    this.initializeWebSocket();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initializeWebSocket(): void {
    try {
      // In a real implementation, this would connect to a WebSocket server
      // For demo purposes, we'll simulate the connection
      console.log('[WS] Initializing WebSocket connection...');
      
      // Simulate successful connection
      setTimeout(() => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('[WS] WebSocket connected successfully');
        this.startDataSimulation();
        this.notifySubscribers('system_status', {
          status: 'connected',
          timestamp: new Date()
        });
      }, 500);

    } catch (error) {
      console.error('[WS] WebSocket initialization failed:', error);
      this.handleReconnection();
    }
  }

  private startDataSimulation(): void {
    // Simulate real-time solar data streaming
    setInterval(() => {
      if (this.isConnected) {
        const solarData: SolarDataStream = {
          protonFlux: 10 + Math.random() * 50, // 10-60 pfu
          electronFlux: 5 + Math.random() * 30, // 5-35 efu
          solarWindSpeed: 300 + Math.random() * 200, // 300-500 km/s
          bzComponent: -10 + Math.random() * 20, // -10 to +10 nT
          timestamp: new Date()
        };

        this.solarCache = solarData;
        this.broadcastMessage('solar_data', solarData, 'medium');
      }
    }, 2000); // Update every 2 seconds

    // Simulate system health monitoring
    setInterval(() => {
      if (this.isConnected) {
        const systemData: SystemHealth = {
          cpuUsage: 15 + Math.random() * 20, // 15-35%
          memoryUsage: 45 + Math.random() * 25, // 45-70%
          diskSpace: 75 + Math.random() * 20, // 75-95% free
          networkLatency: 120 + Math.random() * 80, // 120-200 ms
          uptime: Date.now() - new Date('2026-01-01').getTime()
        };

        this.systemCache = systemData;
        this.broadcastMessage('system_status', systemData, 'low');
      }
    }, 5000); // Update every 5 seconds

    // Simulate occasional alerts
    setInterval(() => {
      if (this.isConnected && Math.random() > 0.8) { // 20% chance of alert
        const alertTypes = ['solar_flare', 'radiation_spike', 'communication_issue'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const alertData = {
          type: alertType,
          severity: Math.random() > 0.7 ? 'high' : 'medium',
          message: `Simulated ${alertType.replace('_', ' ')} detected`,
          timestamp: new Date()
        };

        this.alertCache.push(alertData);
        if (this.alertCache.length > 50) {
          this.alertCache.shift(); // Keep only last 50 alerts
        }

        this.broadcastMessage('alert', alertData, alertData.severity as any);
      }
    }, 10000); // Check for alerts every 10 seconds
  }

  public subscribe(topic: string, callback: (data: WebSocketMessage) => void): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    
    const callbacks = this.subscribers.get(topic)!;
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  public broadcastMessage(type: string, data: any, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const message: WebSocketMessage = {
      type: type as any,
      timestamp: new Date(),
      data,
      priority
    };

    // Notify all subscribers for this topic
    const subscribers = this.subscribers.get(type) || [];
    subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('[WS] Error in subscriber callback:', error);
      }
    });

    // Also notify general message subscribers
    const generalSubscribers = this.subscribers.get('message') || [];
    generalSubscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('[WS] Error in general subscriber callback:', error);
      }
    });
  }

  private notifySubscribers(type: string, data: any): void {
    const message: WebSocketMessage = {
      type: type as any,
      timestamp: new Date(),
      data,
      priority: 'low'
    };

    const subscribers = this.subscribers.get(type) || [];
    subscribers.forEach(callback => callback(message));
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WS] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('[WS] Maximum reconnection attempts reached');
      this.notifySubscribers('system_status', {
        status: 'disconnected',
        error: 'Maximum reconnection attempts exceeded'
      });
    }
  }

  public getCachedData(type: 'solar' | 'system' | 'alerts'): any {
    switch (type) {
      case 'solar':
        return this.solarCache;
      case 'system':
        return this.systemCache;
      case 'alerts':
        return [...this.alertCache];
      default:
        return null;
    }
  }

  public getConnectionStatus(): { connected: boolean; attempts: number } {
    return {
      connected: this.isConnected,
      attempts: this.reconnectAttempts
    };
  }

  public sendCommand(command: string, data?: any): void {
    if (this.isConnected) {
      const message: WebSocketMessage = {
        type: 'user_action',
        timestamp: new Date(),
        data: { command, ...data },
        priority: 'medium'
      };
      
      // In real implementation, this would send to WebSocket server
      console.log('[WS] Sending command:', command, data);
      
      // Simulate command response
      setTimeout(() => {
        this.broadcastMessage('system_status', {
          command,
          status: 'executed',
          timestamp: new Date()
        });
      }, 100);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    console.log('[WS] Disconnected from WebSocket server');
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();