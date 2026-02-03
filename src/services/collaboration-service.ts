// Collaborative Features Service for HELIOGUARD
// Enables multi-user support, shared sessions, and team collaboration

interface UserSession {
  userId: string;
  username: string;
  role: 'administrator' | 'operator' | 'scientist' | 'observer';
  sessionId: string;
  joinTime: Date;
  lastActivity: Date;
  permissions: string[];
  currentLocation: string;
  isActive: boolean;
}

interface SharedSession {
  sessionId: string;
  sessionName: string;
  creatorId: string;
  participants: UserSession[];
  createdAt: Date;
  isActive: boolean;
  sharedResources: string[];
}

interface CollaborationMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  messageType: 'chat' | 'command' | 'alert' | 'notification' | 'file_share';
  content: any;
  timestamp: Date;
  sessionId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface TeamResource {
  resourceId: string;
  resourceName: string;
  resourceType: 'dashboard' | 'terminal' | 'report' | 'configuration' | 'sensor_data';
  ownerId: string;
  sharedWith: string[];
  permissions: Record<string, string[]>;
  lastModified: Date;
  version: number;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private activeSessions: Map<string, SharedSession> = new Map();
  private activeUsers: Map<string, UserSession> = new Map();
  private chatMessages: Map<string, CollaborationMessage[]> = new Map();
  private sharedResources: Map<string, TeamResource> = new Map();
  private messageSubscribers: Array<(message: CollaborationMessage) => void> = [];

  private constructor() {
    this.initializeDemoUsers();
    this.createDemoSession();
  }

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  private initializeDemoUsers(): void {
    const demoUsers: UserSession[] = [
      {
        userId: 'user-001',
        username: 'dr_smith',
        role: 'administrator',
        sessionId: '',
        joinTime: new Date(),
        lastActivity: new Date(),
        permissions: ['full_access', 'system_admin', 'data_export'],
        currentLocation: '/dashboard',
        isActive: true
      },
      {
        userId: 'user-002',
        username: 'mission_ops',
        role: 'operator',
        sessionId: '',
        joinTime: new Date(),
        lastActivity: new Date(),
        permissions: ['terminal_access', 'alert_management', 'status_monitoring'],
        currentLocation: '/helio-guard',
        isActive: true
      },
      {
        userId: 'user-003',
        username: 'dr_johnson',
        role: 'scientist',
        sessionId: '',
        joinTime: new Date(),
        lastActivity: new Date(),
        permissions: ['data_analysis', 'report_generation', 'sensor_data'],
        currentLocation: '/reports',
        isActive: true
      },
      {
        userId: 'user-004',
        username: 'earth_control',
        role: 'observer',
        sessionId: '',
        joinTime: new Date(),
        lastActivity: new Date(),
        permissions: ['read_only', 'status_view', 'alert_notifications'],
        currentLocation: '/overview',
        isActive: true
      }
    ];

    demoUsers.forEach(user => {
      this.activeUsers.set(user.userId, user);
    });

    console.log(`[COLLAB] Initialized ${demoUsers.length} demo users`);
  }

  private createDemoSession(): void {
    const demoSession: SharedSession = {
      sessionId: 'session-' + Date.now(),
      sessionName: 'Mars Mission Control - Shift 1',
      creatorId: 'user-001',
      participants: Array.from(this.activeUsers.values()),
      createdAt: new Date(),
      isActive: true,
      sharedResources: ['dashboard', 'terminal', 'sensor_data', 'reports']
    };

    this.activeSessions.set(demoSession.sessionId, demoSession);
    
    // Initialize chat for this session
    this.chatMessages.set(demoSession.sessionId, []);
    
    console.log(`[COLLAB] Created demo session: ${demoSession.sessionName}`);
  }

  public createUserSession(userData: Omit<UserSession, 'sessionId' | 'joinTime' | 'lastActivity' | 'isActive'>): Promise<UserSession> {
    return new Promise((resolve) => {
      const newUser: UserSession = {
        ...userData,
        sessionId: 'sess-' + Math.random().toString(36).substr(2, 9),
        joinTime: new Date(),
        lastActivity: new Date(),
        isActive: true
      };

      this.activeUsers.set(newUser.userId, newUser);
      console.log(`[COLLAB] New user joined: ${newUser.username}`);

      resolve(newUser);
    });
  }

  public joinSharedSession(sessionId: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const session = this.activeSessions.get(sessionId);
      const user = this.activeUsers.get(userId);

      if (!session || !user) {
        resolve(false);
        return;
      }

      // Add user to session
      user.sessionId = sessionId;
      user.lastActivity = new Date();
      session.participants.push(user);

      this.activeSessions.set(sessionId, session);
      this.activeUsers.set(userId, user);

      // Broadcast join notification
      this.sendMessage({
        senderId: userId,
        senderName: user.username,
        messageType: 'notification',
        content: { text: `${user.username} joined the session` },
        sessionId,
        priority: 'normal'
      });

      console.log(`[COLLAB] User ${user.username} joined session ${session.sessionName}`);
      resolve(true);
    });
  }

  public sendMessage(message: Omit<CollaborationMessage, 'messageId' | 'timestamp'>): Promise<CollaborationMessage> {
    return new Promise((resolve) => {
      const newMessage: CollaborationMessage = {
        ...message,
        messageId: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        timestamp: new Date()
      };

      // Store message
      if (!this.chatMessages.has(message.sessionId)) {
        this.chatMessages.set(message.sessionId, []);
      }
      
      const sessionMessages = this.chatMessages.get(message.sessionId)!;
      sessionMessages.push(newMessage);
      
      // Keep only last 100 messages per session
      if (sessionMessages.length > 100) {
        sessionMessages.shift();
      }

      this.chatMessages.set(message.sessionId, sessionMessages);

      // Notify subscribers
      this.messageSubscribers.forEach(callback => {
        try {
          callback(newMessage);
        } catch (error) {
          console.error('[COLLAB] Error in message subscriber:', error);
        }
      });

      // Update user activity
      const user = this.activeUsers.get(message.senderId);
      if (user) {
        user.lastActivity = new Date();
        this.activeUsers.set(user.userId, user);
      }

      console.log(`[COLLAB] Message sent by ${message.senderName}: ${message.content.text || '[command]'}`);
      resolve(newMessage);
    });
  }

  public createSharedResource(resourceData: Omit<TeamResource, 'resourceId' | 'lastModified' | 'version'>): Promise<TeamResource> {
    return new Promise((resolve) => {
      const newResource: TeamResource = {
        ...resourceData,
        resourceId: 'res-' + Date.now(),
        lastModified: new Date(),
        version: 1
      };

      this.sharedResources.set(newResource.resourceId, newResource);
      console.log(`[COLLAB] Created shared resource: ${newResource.resourceName}`);

      resolve(newResource);
    });
  }

  public shareResourceWithUser(resourceId: string, userId: string, permissions: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      const resource = this.sharedResources.get(resourceId);
      if (!resource) {
        resolve(false);
        return;
      }

      // Add user to shared list
      if (!resource.sharedWith.includes(userId)) {
        resource.sharedWith.push(userId);
      }

      // Set permissions
      resource.permissions[userId] = permissions;
      resource.lastModified = new Date();
      resource.version++;

      this.sharedResources.set(resourceId, resource);
      resolve(true);
    });
  }

  public getUserSessions(userId: string): SharedSession[] {
    return Array.from(this.activeSessions.values()).filter(session => 
      session.participants.some(p => p.userId === userId && p.isActive)
    );
  }

  public getSessionParticipants(sessionId: string): UserSession[] {
    const session = this.activeSessions.get(sessionId);
    return session ? session.participants.filter(p => p.isActive) : [];
  }

  public getSessionMessages(sessionId: string, limit: number = 50): CollaborationMessage[] {
    const messages = this.chatMessages.get(sessionId) || [];
    return messages.slice(-limit);
  }

  public getSharedResources(userId: string): TeamResource[] {
    return Array.from(this.sharedResources.values()).filter(resource => 
      resource.ownerId === userId || resource.sharedWith.includes(userId)
    );
  }

  public subscribeToMessages(callback: (message: CollaborationMessage) => void): () => void {
    this.messageSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageSubscribers.indexOf(callback);
      if (index > -1) {
        this.messageSubscribers.splice(index, 1);
      }
    };
  }

  public updateUserActivity(userId: string, location?: string): void {
    const user = this.activeUsers.get(userId);
    if (user) {
      user.lastActivity = new Date();
      if (location) {
        user.currentLocation = location;
      }
      this.activeUsers.set(userId, user);
    }
  }

  public leaveSession(userId: string): Promise<void> {
    return new Promise((resolve) => {
      const user = this.activeUsers.get(userId);
      if (user && user.sessionId) {
        const session = this.activeSessions.get(user.sessionId);
        if (session) {
          // Remove user from session participants
          session.participants = session.participants.filter(p => p.userId !== userId);
          this.activeSessions.set(user.sessionId, session);
        }

        // Clear user's session
        user.sessionId = '';
        user.currentLocation = '/logout';
        this.activeUsers.set(userId, user);

        console.log(`[COLLAB] User ${user.username} left session`);
      }
      resolve();
    });
  }

  public getSessionStatus(sessionId: string): { 
    activeUsers: number; 
    totalMessages: number; 
    resourcesShared: number;
    uptime: string;
  } {
    const session = this.activeSessions.get(sessionId);
    const messages = this.chatMessages.get(sessionId) || [];
    const resources = Array.from(this.sharedResources.values()).filter(r => 
      r.sharedWith.some(uid => 
        session?.participants.some(p => p.userId === uid)
      )
    );

    if (!session) {
      return {
        activeUsers: 0,
        totalMessages: 0,
        resourcesShared: 0,
        uptime: '00:00:00'
      };
    }

    const uptimeMs = Date.now() - session.createdAt.getTime();
    const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const uptimeSeconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);

    return {
      activeUsers: session.participants.filter(p => p.isActive).length,
      totalMessages: messages.length,
      resourcesShared: resources.length,
      uptime: `${uptimeHours.toString().padStart(2, '0')}:${uptimeMinutes.toString().padStart(2, '0')}:${uptimeSeconds.toString().padStart(2, '0')}`
    };
  }

  public getAllActiveUsers(): UserSession[] {
    return Array.from(this.activeUsers.values()).filter(user => user.isActive);
  }

  public disconnect(): void {
    // Clean up all sessions and users
    this.activeSessions.clear();
    this.activeUsers.clear();
    this.chatMessages.clear();
    this.sharedResources.clear();
    this.messageSubscribers = [];
    console.log('[COLLAB] Disconnected from collaboration service');
  }
}

// Export singleton instance
export const collaborationService = CollaborationService.getInstance();