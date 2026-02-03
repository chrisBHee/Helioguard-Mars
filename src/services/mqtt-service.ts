// MQTT Service for Distributed Sensor Networks
// Enables communication with remote sensors and IoT devices across the Mars colony

interface MqttMessage {
  topic: string;
  payload: any;
  qos: 0 | 1 | 2;
  retain: boolean;
  timestamp: Date;
}

interface SensorData {
  sensorId: string;
  location: string;
  type: 'temperature' | 'humidity' | 'radiation' | 'pressure' | 'gas' | 'motion';
  value: number;
  unit: string;
  timestamp: Date;
  batteryLevel?: number;
  signalStrength?: number;
}

interface ColonyNetwork {
  nodeId: string;
  type: 'habitat' | 'rover' | 'sensor_array' | 'communication_relay';
  status: 'online' | 'offline' | 'maintenance';
  ipAddress: string;
  lastSeen: Date;
  capabilities: string[];
}

export class MqttService {
  private static instance: MqttService;
  private client: any = null; // Would be mqtt.Client in real implementation
  private isConnected = false;
  private topics: Set<string> = new Set();
  private sensorRegistry: Map<string, SensorData> = new Map();
  private networkNodes: Map<string, ColonyNetwork> = new Map();
  private subscribers: Map<string, ((message: MqttMessage) => void)[]> = new Map();

  private constructor() {
    this.initializeMqttClient();
    this.setupColonyNetwork();
  }

  public static getInstance(): MqttService {
    if (!MqttService.instance) {
      MqttService.instance = new MqttService();
    }
    return MqttService.instance;
  }

  private initializeMqttClient(): void {
    try {
      console.log('[MQTT] Initializing MQTT client...');
      
      // Simulate MQTT connection (would use actual mqtt.connect() in production)
      setTimeout(() => {
        this.isConnected = true;
        console.log('[MQTT] Connected to MQTT broker');
        this.setupTopicSubscriptions();
        this.simulateSensorNetwork();
      }, 800);

    } catch (error) {
      console.error('[MQTT] Failed to initialize MQTT client:', error);
    }
  }

  private setupTopicSubscriptions(): void {
    const topics = [
      'colony/sensors/+/data',        // Sensor data from all locations
      'colony/habitat/+/status',      // Habitat system status
      'colony/rovers/+/telemetry',    // Rover telemetry data
      'colony/weather/+',             // Weather station data
      'colony/alerts/#',              // All alert topics
      'colony/command/+',             // Command responses
      '$SYS/broker/+'                 // Broker system topics
    ];

    topics.forEach(topic => {
      this.subscribe(topic, this.handleIncomingMessage.bind(this));
    });
  }

  private setupColonyNetwork(): void {
    // Register colony network nodes
    const networkNodes: ColonyNetwork[] = [
      {
        nodeId: 'habitat-alpha',
        type: 'habitat',
        status: 'online',
        ipAddress: '192.168.1.10',
        lastSeen: new Date(),
        capabilities: ['life_support', 'power_management', 'communications']
      },
      {
        nodeId: 'rover-01',
        type: 'rover',
        status: 'online',
        ipAddress: '192.168.1.21',
        lastSeen: new Date(),
        capabilities: ['mobility', 'sampling', 'surveying']
      },
      {
        nodeId: 'sensor-array-north',
        type: 'sensor_array',
        status: 'online',
        ipAddress: '192.168.1.31',
        lastSeen: new Date(),
        capabilities: ['environmental_monitoring', 'radiation_detection']
      },
      {
        nodeId: 'comm-relay-01',
        type: 'communication_relay',
        status: 'online',
        ipAddress: '192.168.1.41',
        lastSeen: new Date(),
        capabilities: ['signal_boosting', 'data_relay', 'mesh_networking']
      }
    ];

    networkNodes.forEach(node => {
      this.networkNodes.set(node.nodeId, node);
    });

    console.log(`[MQTT] Registered ${networkNodes.length} colony network nodes`);
  }

  private simulateSensorNetwork(): void {
    // Simulate continuous sensor data
    setInterval(() => {
      if (this.isConnected) {
        this.generateSensorData();
      }
    }, 3000); // Every 3 seconds

    // Simulate network heartbeat
    setInterval(() => {
      if (this.isConnected) {
        this.updateNetworkStatus();
      }
    }, 30000); // Every 30 seconds
  }

  private generateSensorData(): void {
    const sensorLocations: Array<{id: string, location: string, type: SensorData['type'], unit: string}> = [
      { id: 'temp-01', location: 'Habitat_Living_Quarters', type: 'temperature', unit: '°C' },
      { id: 'hum-01', location: 'Habitat_Greenhouse', type: 'humidity', unit: '%' },
      { id: 'rad-01', location: 'Surface_Exterior', type: 'radiation', unit: 'μSv/h' },
      { id: 'pres-01', location: 'Habitat_Airlock', type: 'pressure', unit: 'kPa' },
      { id: 'gas-01', location: 'Laboratory', type: 'gas', unit: 'ppm' },
      { id: 'motion-01', location: 'Storage_Bay', type: 'motion', unit: 'detected' }
    ];

    sensorLocations.forEach(sensor => {
      const value = this.generateSensorValue(sensor.type);
      
      const sensorData: SensorData = {
        sensorId: sensor.id,
        location: sensor.location,
        type: sensor.type,
        value,
        unit: sensor.unit,
        timestamp: new Date(),
        batteryLevel: 85 + Math.random() * 15, // 85-100%
        signalStrength: 70 + Math.random() * 30 // 70-100%
      };

      this.sensorRegistry.set(sensor.id, sensorData);
      
      // Publish sensor data
      this.publish(`colony/sensors/${sensor.id}/data`, sensorData, 0);
    });
  }

  private generateSensorValue(type: string): number {
    switch (type) {
      case 'temperature':
        return 20 + Math.random() * 5; // 20-25°C
      case 'humidity':
        return 40 + Math.random() * 20; // 40-60%
      case 'radiation':
        return 0.1 + Math.random() * 0.4; // 0.1-0.5 μSv/h
      case 'pressure':
        return 100 + Math.random() * 5; // 100-105 kPa
      case 'gas':
        return 400 + Math.random() * 100; // 400-500 ppm
      case 'motion':
        return Math.random() > 0.9 ? 1 : 0; // Occasional motion detection
      default:
        return Math.random() * 100;
    }
  }

  private updateNetworkStatus(): void {
    this.networkNodes.forEach((node, nodeId) => {
      // Randomly update some nodes to simulate network activity
      if (Math.random() > 0.7) {
        node.lastSeen = new Date();
        
        // Occasionally simulate node issues
        if (Math.random() > 0.95) {
          node.status = Math.random() > 0.5 ? 'maintenance' : 'offline';
          console.warn(`[MQTT] Node ${nodeId} status changed to ${node.status}`);
        } else if (node.status !== 'online') {
          node.status = 'online';
          console.log(`[MQTT] Node ${nodeId} restored to online`);
        }
      }
      
      this.networkNodes.set(nodeId, node);
    });
  }

  public subscribe(topic: string, callback: (message: MqttMessage) => void): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    
    this.subscribers.get(topic)!.push(callback);
    this.topics.add(topic);
    
    console.log(`[MQTT] Subscribed to topic: ${topic}`);
  }

  public publish(topic: string, payload: any, qos: 0 | 1 | 2 = 0, retain: boolean = false): void {
    if (this.isConnected) {
      const message: MqttMessage = {
        topic,
        payload,
        qos,
        retain,
        timestamp: new Date()
      };

      // Simulate message publishing
      console.log(`[MQTT] Publishing to ${topic}:`, payload);
      
      // Notify subscribers
      this.notifySubscribers(message);
      
      // Handle specific topics
      this.handlePublishedMessage(topic, payload);
    }
  }

  private handleIncomingMessage(message: MqttMessage): void {
    console.log(`[MQTT] Received message on ${message.topic}:`, message.payload);
    
    // Handle different message types
    if (message.topic.includes('/alerts/')) {
      this.handleAlertMessage(message.payload);
    } else if (message.topic.includes('/status')) {
      this.handleStatusUpdate(message.payload);
    }
  }

  private handlePublishedMessage(topic: string, payload: any): void {
    // Handle messages published by this client
    if (topic.startsWith('colony/command/')) {
      this.handleCommandResponse(payload);
    }
  }

  private handleAlertMessage(alertData: any): void {
    console.log('[MQTT] Processing alert:', alertData);
    // Forward to WebSocket service or notification system
  }

  private handleStatusUpdate(statusData: any): void {
    console.log('[MQTT] Processing status update:', statusData);
    // Update internal state
  }

  private handleCommandResponse(response: any): void {
    console.log('[MQTT] Command response received:', response);
    // Process command acknowledgment
  }

  private notifySubscribers(message: MqttMessage): void {
    // Notify exact topic subscribers
    const exactSubscribers = this.subscribers.get(message.topic) || [];
    exactSubscribers.forEach(callback => callback(message));

    // Notify wildcard subscribers
    this.subscribers.forEach((callbacks, topicPattern) => {
      if (this.matchesTopicPattern(message.topic, topicPattern)) {
        callbacks.forEach(callback => {
          if (!exactSubscribers.includes(callback)) { // Avoid duplicates
            callback(message);
          }
        });
      }
    });
  }

  private matchesTopicPattern(topic: string, pattern: string): boolean {
    // Simple topic matching (would use proper MQTT pattern matching in production)
    if (pattern === '#') return true;
    if (pattern === '+') return topic.split('/').length === 1;
    
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');
    
    if (patternParts.length !== topicParts.length) return false;
    
    return patternParts.every((part, index) => 
      part === '+' || part === '#' || part === topicParts[index]
    );
  }

  public getSensorData(sensorId?: string): SensorData | SensorData[] | null {
    if (sensorId) {
      return this.sensorRegistry.get(sensorId) || null;
    }
    return Array.from(this.sensorRegistry.values());
  }

  public getNetworkNodes(nodeId?: string): ColonyNetwork | ColonyNetwork[] | null {
    if (nodeId) {
      return this.networkNodes.get(nodeId) || null;
    }
    return Array.from(this.networkNodes.values());
  }

  public getConnectionStatus(): { connected: boolean; topics: number } {
    return {
      connected: this.isConnected,
      topics: this.topics.size
    };
  }

  public sendCommand(nodeId: string, command: string, params?: any): void {
    const topic = `colony/command/${nodeId}`;
    const payload = {
      command,
      params,
      timestamp: new Date(),
      requestId: Math.random().toString(36).substr(2, 9)
    };

    this.publish(topic, payload, 1); // QoS 1 for reliable delivery
    console.log(`[MQTT] Sent command to ${nodeId}: ${command}`);
  }

  public disconnect(): void {
    this.isConnected = false;
    this.client = null;
    console.log('[MQTT] Disconnected from broker');
  }
}

// Export singleton instance
export const mqttService = MqttService.getInstance();