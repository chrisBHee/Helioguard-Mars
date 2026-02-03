// NOAA Solar Flux Integration for HELIOGUARD
// Real-time radiation monitoring from GOES satellites

export interface SolarFluxReading {
  timestamp: Date;
  protonFlux: number; // particles/cm²/s/sr
  energy: string; // e.g., ">=10 MeV", ">=100 MeV"
  satellite: string; // e.g., "GOES-16", "GOES-18"
  qualityFlag: 'GOOD' | 'DEGRADED' | 'BAD';
  source: string;
}

export interface SolarFluxSummary {
  currentReading: SolarFluxReading;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  trendRate: number; // % change per hour
  alertLevel: 'NORMAL' | 'WARNING' | 'ALERT' | 'SEVERE';
  last24HoursMax: number;
  average24Hours: number;
}

export class NoaaSolarFluxService {
  private static API_BASE = 'https://services.swpc.noaa.gov/json/goes';
  private static jarvis = typeof window !== 'undefined' ? 
    require('./jarvis-core').JarvisCore.getInstance() : null;

  static async getLatestProtonFlux(): Promise<SolarFluxReading> {
    try {
      // Try primary integral protons endpoint
      const response = await fetch(`${this.API_BASE}/primary/integral-protons-instantaneous.json`);
      
      if (!response.ok) {
        throw new Error(`NOAA API error: ${response.status}`);
      }

      const rawData = await response.json();
      const parsedData = this.parseProtonFluxData(rawData);
      
      // Feed data to JARVIS for analysis
      if (this.jarvis) {
        this.jarvis.addProtonFluxData({
          timestamp: parsedData.timestamp,
          flux: parsedData.protonFlux,
          energy: parsedData.energy,
          satellite: parsedData.satellite
        });
        
        this.jarvis.addLogEntry('INFO', `[JARVIS] NOAA GOES-16 Telemetry received`);
        this.jarvis.addLogEntry('INFO', `[JARVIS] Proton flux: ${parsedData.protonFlux.toFixed(2)} pfu`);
      }

      return parsedData;

    } catch (error) {
      console.error('Error fetching NOAA solar flux data:', error);
      // Return mock data for demonstration
      return this.getMockSolarFluxReading();
    }
  }

  private static parseProtonFluxData(rawData: any): SolarFluxReading {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return this.getMockSolarFluxReading();
    }

    // Find the most recent >=10 MeV proton data
    const protonEntries = rawData.filter((entry: any) => 
      entry.satellite.includes('16') || entry.satellite.includes('18')
    );

    if (protonEntries.length === 0) {
      return this.getMockSolarFluxReading();
    }

    // Get the latest entry
    const latestEntry = protonEntries.reduce((latest: any, current: any) => {
      const latestTime = new Date(latest.time_tag || 0);
      const currentTime = new Date(current.time_tag || 0);
      return currentTime > latestTime ? current : latest;
    });

    // Extract proton flux for >=10 MeV
    const fluxData = latestEntry.channels?.find((channel: any) => 
      channel.energy === '>=10 MeV'
    );

    return {
      timestamp: new Date(latestEntry.time_tag),
      protonFlux: fluxData?.flux || 0,
      energy: '>=10 MeV',
      satellite: latestEntry.satellite || 'GOES-16',
      qualityFlag: latestEntry.quality_flag === 'ok' ? 'GOOD' : 'DEGRADED',
      source: 'NOAA SWPC GOES'
    };
  }

  static async getFluxSummary(hours: number = 24): Promise<SolarFluxSummary> {
    try {
      // Get historical data for trend analysis
      const response = await fetch(`${this.API_BASE}/primary/integral-protons-6-hour.json`);
      
      if (!response.ok) {
        throw new Error(`NOAA API error: ${response.status}`);
      }

      const rawData = await response.json();
      return this.analyzeFluxTrend(rawData, hours);

    } catch (error) {
      console.error('Error fetching flux summary:', error);
      return this.getMockFluxSummary();
    }
  }

  private static analyzeFluxTrend(rawData: any[], hours: number): SolarFluxSummary {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return this.getMockFluxSummary();
    }

    // Filter for recent data within specified hours
    const cutoffTime = new Date(Date.now() - hours * 3600000);
    const recentData = rawData.filter(entry => 
      new Date(entry.time_tag) > cutoffTime
    );

    if (recentData.length < 2) {
      return this.getMockFluxSummary();
    }

    // Get current reading (most recent)
    const currentEntry = recentData[recentData.length - 1];
    const currentFlux = currentEntry.channels?.find((c: any) => c.energy === '>=10 MeV')?.flux || 0;

    // Get oldest reading for comparison
    const oldestEntry = recentData[0];
    const oldestFlux = oldestEntry.channels?.find((c: any) => c.energy === '>=10 MeV')?.flux || 1;

    // Calculate trend
    const percentChange = ((currentFlux - oldestFlux) / oldestFlux) * 100;
    const timeSpanHours = (new Date(currentEntry.time_tag).getTime() - new Date(oldestEntry.time_tag).getTime()) / 3600000;
    const trendRate = timeSpanHours > 0 ? (percentChange / timeSpanHours) : 0;

    let trend: SolarFluxSummary['trend'] = 'STABLE';
    if (percentChange > 5) trend = 'INCREASING';
    else if (percentChange < -5) trend = 'DECREASING';

    // Determine alert level
    let alertLevel: SolarFluxSummary['alertLevel'] = 'NORMAL';
    if (currentFlux >= 1000) alertLevel = 'SEVERE';
    else if (currentFlux >= 100) alertLevel = 'ALERT';
    else if (currentFlux >= 10) alertLevel = 'WARNING';

    // Calculate statistics
    const fluxValues = recentData
      .map(entry => entry.channels?.find((c: any) => c.energy === '>=10 MeV')?.flux || 0)
      .filter(val => val > 0);

    const last24HoursMax = Math.max(...fluxValues);
    const average24Hours = fluxValues.reduce((sum, val) => sum + val, 0) / fluxValues.length;

    return {
      currentReading: {
        timestamp: new Date(currentEntry.time_tag),
        protonFlux: currentFlux,
        energy: '>=10 MeV',
        satellite: currentEntry.satellite || 'GOES-16',
        qualityFlag: 'GOOD',
        source: 'NOAA SWPC GOES'
      },
      trend,
      trendRate,
      alertLevel,
      last24HoursMax,
      average24Hours
    };
  }

  private static getMockSolarFluxReading(): SolarFluxReading {
    return {
      timestamp: new Date(),
      protonFlux: 15 + Math.random() * 50, // Mock flux value
      energy: '>=10 MeV',
      satellite: 'GOES-16',
      qualityFlag: 'GOOD',
      source: 'NOAA SWPC GOES (Mock)'
    };
  }

  private static getMockFluxSummary(): SolarFluxSummary {
    const mockFlux = 25 + Math.random() * 30;
    return {
      currentReading: this.getMockSolarFluxReading(),
      trend: 'STABLE',
      trendRate: 0.5,
      alertLevel: 'NORMAL',
      last24HoursMax: mockFlux * 1.5,
      average24Hours: mockFlux
    };
  }

  static getAlertColor(alertLevel: string): string {
    switch (alertLevel) {
      case 'SEVERE': return 'text-red-400';
      case 'ALERT': return 'text-orange-400';
      case 'WARNING': return 'text-yellow-400';
      case 'NORMAL': return 'text-green-400';
      default: return 'text-gray-400';
    }
  }

  static getFluxRiskAssessment(flux: number): {
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    description: string;
    recommendations: string[];
  } {
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
    let description = 'Minimal radiation hazard';
    let recommendations: string[] = ['Continue standard operations'];

    if (flux >= 1000) {
      riskLevel = 'SEVERE';
      description = 'Extreme radiation levels detected';
      recommendations = [
        'Initiate emergency shielding protocols',
        'Suspend all EVA activities',
        'Activate habitat radiation shelters',
        'Notify mission control immediately'
      ];
    } else if (flux >= 100) {
      riskLevel = 'HIGH';
      description = 'Significant radiation hazard present';
      recommendations = [
        'Enhance radiation monitoring',
        'Review crew exposure limits',
        'Prepare contingency procedures'
      ];
    } else if (flux >= 10) {
      riskLevel = 'MODERATE';
      description = 'Moderate radiation levels observed';
      recommendations = [
        'Maintain heightened awareness',
        'Monitor trends closely',
        'Ensure shielding systems readiness'
      ];
    }

    return { riskLevel, description, recommendations };
  }
}