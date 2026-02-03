// NASA DONKI Integration for HELIOGUARD
// Solar flare and space weather event monitoring

export interface SolarFlareEvent {
  id: string;
  timestamp: Date;
  startTime: Date;
  endTime: Date;
  peakTime: Date;
  classType: 'A' | 'B' | 'C' | 'M' | 'X';
  magnitude: number; // For X-class: X1.0 = 1.0, X2.5 = 2.5
  sourceLocation: string; // e.g., "N05W12"
  activeRegion: number;
  probability: number; // 0-100%
  impacts: string[];
  forecast: string;
}

export interface DonkiAlert {
  timestamp: Date;
  eventType: 'Solar Flare' | 'CME' | 'Geomagnetic Storm' | 'SEP Event';
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  message: string;
  affectedSystems: string[];
  recommendedActions: string[];
}

export class NasaDonkiService {
  private static API_BASE = 'https://api.nasa.gov/DONKI';
  private static API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
  private static jarvis = typeof window !== 'undefined' ? 
    require('./jarvis-core').JarvisCore.getInstance() : null;

  static async getRecentSolarFlares(days: number = 7): Promise<SolarFlareEvent[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `${this.API_BASE}/FLR?startDate=${startStr}&endDate=${endStr}&api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`DONKI API error: ${response.status}`);
      }

      const rawData = await response.json();
      const flares = this.parseSolarFlareData(rawData);
      
      // Log significant events to JARVIS
      flares.forEach(flares => {
        if (flares.classType === 'M' || flares.classType === 'X') {
          this.jarvis?.addLogEntry('WARNING', 
            `[JARVIS] Solar flare detected: ${flares.classType}${flares.magnitude} at ${flares.startTime.toISOString()}`
          );
        }
      });

      return flares;

    } catch (error) {
      console.error('Error fetching DONKI solar flare data:', error);
      return this.getMockSolarFlares();
    }
  }

  private static parseSolarFlareData(rawData: any[]): SolarFlareEvent[] {
    if (!Array.isArray(rawData)) {
      return this.getMockSolarFlares();
    }

    return rawData.map((flare: any) => {
      // Parse class type and magnitude
      const classType = flare.classType?.charAt(0) as 'A' | 'B' | 'C' | 'M' | 'X' || 'C';
      const magnitude = parseFloat(flare.classType?.substring(1)) || 1.0;

      return {
        id: flare.flaresID || `FLR_${Date.now()}_${Math.random()}`,
        timestamp: new Date(flare.lastUpdate || new Date()),
        startTime: new Date(flare.beginTime || new Date()),
        endTime: new Date(flare.endTime || new Date()),
        peakTime: new Date(flare.peakTime || new Date()),
        classType,
        magnitude,
        sourceLocation: flare.sourceLocation || 'Unknown',
        activeRegion: parseInt(flare.activeRegionNum) || 0,
        probability: 95, // High confidence for recorded events
        impacts: this.determineFlareImpacts(classType, magnitude),
        forecast: this.generateFlareForecast(classType, magnitude)
      };
    }).sort((a, b) => b.startTime.getTime() - a.startTime.getTime()); // Sort by most recent
  }

  private static determineFlareImpacts(classType: string, magnitude: number): string[] {
    const impacts: string[] = [];

    if (classType === 'X' || (classType === 'M' && magnitude > 5)) {
      impacts.push('Severe radio blackouts possible');
      impacts.push('GPS navigation disruption likely');
      impacts.push('Satellite drag effects');
      impacts.push('Increased radiation exposure');
    } else if (classType === 'M') {
      impacts.push('Moderate radio interference');
      impacts.push('Possible GPS degradation');
      impacts.push('Minor satellite effects');
    } else if (classType === 'C') {
      impacts.push('Weak radio effects');
      impacts.push('Minimal system impacts');
    }

    return impacts;
  }

  private static generateFlareForecast(classType: string, magnitude: number): string {
    if (classType === 'X') {
      return `Extreme solar flare (${classType}${magnitude}) - High probability of significant space weather impacts. Monitor radiation levels closely.`;
    } else if (classType === 'M' && magnitude > 5) {
      return `Major solar flare (M${magnitude}) - Moderate to strong impacts expected. Enhanced monitoring recommended.`;
    } else if (classType === 'M') {
      return `Moderate solar flare (M${magnitude}) - Minor impacts likely. Standard protocols sufficient.`;
    } else {
      return `Minor solar flare (${classType}${magnitude}) - Minimal impacts expected. Continue normal operations.`;
    }
  }

  static async getDonkiAlerts(days: number = 3): Promise<DonkiAlert[]> {
    try {
      const alerts: DonkiAlert[] = [];
      
      // Get various space weather alerts
      const [flares, cmes, gst] = await Promise.all([
        this.getRecentSolarFlares(days),
        this.getCMEData(days),
        this.getGSTData(days)
      ]);

      // Process solar flares into alerts
      flares.forEach(flares => {
        if (flares.classType === 'M' || flares.classType === 'X') {
          alerts.push({
            timestamp: flares.timestamp,
            eventType: 'Solar Flare',
            severity: flares.classType === 'X' ? 'Severe' : 'Moderate',
            message: `Solar flare ${flares.classType}${flares.magnitude} detected`,
            affectedSystems: ['Communications', 'Navigation', 'Radiation Levels'],
            recommendedActions: [
              'Monitor radio communications',
              'Review EVA schedules',
              'Check spacecraft charging status'
            ]
          });
        }
      });

      return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    } catch (error) {
      console.error('Error fetching DONKI alerts:', error);
      return this.getMockDonkiAlerts();
    }
  }

  private static async getCMEData(days: number): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `${this.API_BASE}/CME?startDate=${startStr}&endDate=${endStr}&api_key=${this.API_KEY}`
      );

      if (!response.ok) return [];
      return await response.json();

    } catch (error) {
      console.error('Error fetching CME data:', error);
      return [];
    }
  }

  private static async getGSTData(days: number): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `${this.API_BASE}/GST?startDate=${startStr}&endDate=${endStr}&api_key=${this.API_KEY}`
      );

      if (!response.ok) return [];
      return await response.json();

    } catch (error) {
      console.error('Error fetching GST data:', error);
      return [];
    }
  }

  private static getMockSolarFlares(): SolarFlareEvent[] {
    return [
      {
        id: 'FLR_MOCK_001',
        timestamp: new Date(),
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(),
        peakTime: new Date(Date.now() - 1800000),
        classType: 'M',
        magnitude: 3.2,
        sourceLocation: 'N12E45',
        activeRegion: 1234,
        probability: 95,
        impacts: ['Moderate radio interference', 'Possible GPS degradation'],
        forecast: 'Moderate solar flare (M3.2) - Minor impacts expected'
      }
    ];
  }

  private static getMockDonkiAlerts(): DonkiAlert[] {
    return [
      {
        timestamp: new Date(),
        eventType: 'Solar Flare',
        severity: 'Moderate',
        message: 'Solar flare M3.2 detected - minor impacts expected',
        affectedSystems: ['Communications', 'Navigation'],
        recommendedActions: [
          'Monitor radio communications',
          'Review EVA schedules'
        ]
      }
    ];
  }

  static getClassColor(classType: string): string {
    switch (classType) {
      case 'X': return 'text-red-400';
      case 'M': return 'text-orange-400';
      case 'C': return 'text-yellow-400';
      case 'B': return 'text-green-400';
      case 'A': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  static getSeverityColor(severity: string): string {
    switch (severity) {
      case 'Extreme': return 'text-red-400';
      case 'Severe': return 'text-orange-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Minor': return 'text-green-400';
      default: return 'text-gray-400';
    }
  }
}