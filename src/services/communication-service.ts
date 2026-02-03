'use client';

export interface CrewMember {
  id: string;
  name: string;
  role: 'COMMANDER' | 'PILOT' | 'SCIENTIST' | 'ENGINEER' | 'MEDIC';
  location: 'SURFACE' | 'ORBIT' | 'TRANSIT' | 'EVA';
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  lastUpdate: Date;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string | 'ALL';
  content: string;
  timestamp: Date;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  read: boolean;
  messageType: 'TEXT' | 'ALERT' | 'STATUS' | 'COMMAND';
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: 'MISSION_CONTROL' | 'CREW_INTERNAL' | 'EARTH_RELAY' | 'AUTONOMOUS';
  status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE';
  latency: number; // seconds
  bandwidth: number; // kbps
  encryption: 'AES-256' | 'RSA-4096' | 'QUANTUM';
}

export class MissionCommunicationService {
  private static crewMembers: CrewMember[] = [
    {
      id: 'crew-001',
      name: 'Cmdr. Alex Johnson',
      role: 'COMMANDER',
      location: 'SURFACE',
      status: 'NORMAL',
      lastUpdate: new Date()
    },
    {
      id: 'crew-002',
      name: 'Dr. Sarah Chen',
      role: 'SCIENTIST',
      location: 'SURFACE',
      status: 'NORMAL',
      lastUpdate: new Date()
    },
    {
      id: 'crew-003',
      name: 'Lt. Mike Rodriguez',
      role: 'ENGINEER',
      location: 'ORBIT',
      status: 'WARNING',
      lastUpdate: new Date()
    },
    {
      id: 'crew-004',
      name: 'Dr. Emma Wilson',
      role: 'MEDIC',
      location: 'SURFACE',
      status: 'NORMAL',
      lastUpdate: new Date()
    },
    {
      id: 'crew-005',
      name: 'Capt. James Park',
      role: 'PILOT',
      location: 'ORBIT',
      status: 'NORMAL',
      lastUpdate: new Date()
    },
    {
      id: 'crew-006',
      name: 'Dr. Lisa Kumar',
      role: 'SCIENTIST',
      location: 'SURFACE',
      status: 'NORMAL',
      lastUpdate: new Date()
    }
  ];

  private static channels: CommunicationChannel[] = [
    {
      id: 'chan-001',
      name: 'Mission Control Direct',
      type: 'MISSION_CONTROL',
      status: 'ACTIVE',
      latency: 1280,
      bandwidth: 1024,
      encryption: 'AES-256'
    },
    {
      id: 'chan-002',
      name: 'Crew Internal Network',
      type: 'CREW_INTERNAL',
      status: 'ACTIVE',
      latency: 2,
      bandwidth: 512,
      encryption: 'AES-256'
    },
    {
      id: 'chan-003',
      name: 'Earth Relay Backup',
      type: 'EARTH_RELAY',
      status: 'DEGRADED',
      latency: 2560,
      bandwidth: 256,
      encryption: 'RSA-4096'
    },
    {
      id: 'chan-004',
      name: 'Autonomous Systems',
      type: 'AUTONOMOUS',
      status: 'ACTIVE',
      latency: 0.1,
      bandwidth: 128,
      encryption: 'AES-256'
    }
  ];

  private static messages: Message[] = [];

  static getCrewMembers(): CrewMember[] {
    return [...this.crewMembers];
  }

  static getCommunicationChannels(): CommunicationChannel[] {
    return [...this.channels];
  }

  static getMessages(recipient?: string): Message[] {
    if (recipient) {
      return this.messages.filter(msg => 
        msg.recipient === recipient || msg.recipient === 'ALL'
      ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    return [...this.messages].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<Message> {
    // Simulate communication delay based on channel
    const channel = this.channels.find(c => 
      message.messageType === 'ALERT' ? c.type === 'MISSION_CONTROL' : c.type === 'CREW_INTERNAL'
    );
    
    if (channel) {
      await new Promise(resolve => setTimeout(resolve, channel.latency * 100)); // Scale for demo
    }

    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    this.messages.unshift(newMessage);
    
    // Limit message history
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(0, 100);
    }

    return newMessage;
  }

  static markAsRead(messageId: string): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.read = true;
    }
  }

  static getCrewStatusSummary(): Record<string, number> {
    return this.crewMembers.reduce((summary, member) => {
      summary[member.status] = (summary[member.status] || 0) + 1;
      return summary;
    }, {} as Record<string, number>);
  }

  static getChannelHealth(): Record<string, { status: string; health: number }> {
    return this.channels.reduce((health, channel) => {
      const healthScore = this.calculateChannelHealth(channel);
      health[channel.name] = {
        status: channel.status,
        health: healthScore
      };
      return health;
    }, {} as Record<string, { status: string; health: number }>);
  }

  static async sendEmergencyBroadcast(content: string, sender: string): Promise<void> {
    const emergencyChannels = this.channels.filter(c => 
      c.type === 'MISSION_CONTROL' || c.type === 'CREW_INTERNAL'
    );

    for (const channel of emergencyChannels) {
      await this.sendMessage({
        sender,
        recipient: 'ALL',
        content,
        priority: 'EMERGENCY',
        messageType: 'ALERT'
      });
    }
  }

  static updateCrewMemberStatus(memberId: string, status: CrewMember['status']): void {
    const member = this.crewMembers.find(m => m.id === memberId);
    if (member) {
      member.status = status;
      member.lastUpdate = new Date();
    }
  }

  static updateCrewMemberLocation(memberId: string, location: CrewMember['location']): void {
    const member = this.crewMembers.find(m => m.id === memberId);
    if (member) {
      member.location = location;
      member.lastUpdate = new Date();
    }
  }

  static getUnreadMessageCount(recipient: string): number {
    return this.messages.filter(msg => 
      (msg.recipient === recipient || msg.recipient === 'ALL') && !msg.read
    ).length;
  }

  static getRecentAlerts(hours: number = 24): Message[] {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.messages.filter(msg => 
      msg.messageType === 'ALERT' && msg.timestamp >= cutoff
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private static calculateChannelHealth(channel: CommunicationChannel): number {
    let health = 100;
    
    // Factor in status
    if (channel.status === 'OFFLINE') health -= 100;
    else if (channel.status === 'DEGRADED') health -= 30;
    
    // Factor in latency (higher latency = lower health)
    health -= Math.min(50, channel.latency / 100);
    
    // Factor in bandwidth
    if (channel.bandwidth < 256) health -= 20;
    else if (channel.bandwidth < 512) health -= 10;
    
    return Math.max(0, Math.min(100, health));
  }
}