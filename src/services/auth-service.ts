'use client';

// Simple JWT decoder without external dependencies
function jwtDecode(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export interface User {
  id: string;
  username: string;
  role: 'ASTRONAUT' | 'MISSION_CONTROL' | 'SCIENTIST' | 'ADMIN';
  missionId?: string;
  fullName: string;
  lastLogin: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
  missionCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'helio_token';
  private static readonly REFRESH_TOKEN_KEY = 'helio_refresh_token';
  private static readonly USER_KEY = 'helio_user';

  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Simulate NASA authentication API call
    try {
      // In a real NASA system, this would connect to NASA's authentication service
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Mock authentication logic
      const mockUsers: Record<string, User> = {
        'astro.commander': {
          id: 'user-001',
          username: 'astro.commander',
          role: 'ASTRONAUT',
          missionId: 'MARS-2026-A',
          fullName: 'Cmdr. Alex Johnson',
          lastLogin: new Date()
        },
        'mission.control': {
          id: 'user-002',
          username: 'mission.control',
          role: 'MISSION_CONTROL',
          missionId: 'MARS-2026-A',
          fullName: 'Dr. Sarah Chen',
          lastLogin: new Date()
        },
        'science.team': {
          id: 'user-003',
          username: 'science.team',
          role: 'SCIENTIST',
          missionId: 'MARS-2026-A',
          fullName: 'Dr. Michael Rodriguez',
          lastLogin: new Date()
        },
        'admin.nasa': {
          id: 'user-004',
          username: 'admin.nasa',
          role: 'ADMIN',
          fullName: 'NASA Administrator',
          lastLogin: new Date()
        }
      };

      const user = mockUsers[credentials.username];
      if (!user || credentials.password !== 'nasa2026') {
        throw new Error('Invalid credentials');
      }

      // Generate mock tokens
      const accessToken = this.generateMockToken(user, 'access', 3600); // 1 hour
      const refreshToken = this.generateMockToken(user, 'refresh', 86400); // 24 hours

      const tokens = { accessToken, refreshToken };
      
      // Store in localStorage
      this.storeTokens(tokens);
      this.storeUser(user);
      
      return { user, tokens };
    } catch (error) {
      throw new Error('Authentication failed: ' + (error as Error).message);
    }
  }

  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Simulate token refresh API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const decoded = jwtDecode(refreshToken) as any;
      const user: User = decoded.user;
      
      const newAccessToken = this.generateMockToken(user, 'access', 3600);
      const newRefreshToken = this.generateMockToken(user, 'refresh', 86400);
      
      const tokens = { accessToken: newAccessToken, refreshToken: newRefreshToken };
      this.storeTokens(tokens);
      
      return tokens;
    } catch (error) {
      this.logout();
      throw new Error('Token refresh failed');
    }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token) as any;
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  static getUserRole(): User['role'] | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  static hasPermission(requiredRole: User['role']): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    const roleHierarchy: Record<User['role'], number> = {
      'ASTRONAUT': 1,
      'MISSION_CONTROL': 2,
      'SCIENTIST': 3,
      'ADMIN': 4
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  private static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private static storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private static storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private static generateMockToken(user: User, type: 'access' | 'refresh', expiresIn: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        missionId: user.missionId
      },
      type,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = btoa('mock-signature'); // In reality, this would be properly signed
    
    return `${header}.${payload}.${signature}`;
  }
}