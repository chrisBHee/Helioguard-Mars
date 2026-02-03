import { SolarProtonFluxData } from '@/types/solar-data';

export class NoaaSpaceWeatherService {
  private static API_BASE = 'https://services.swpc.noaa.gov/json';

  static async getSolarProtonFlux(): Promise<SolarProtonFluxData> {
    try {
      const response = await fetch(`${this.API_BASE}/satellite-indices.json`);
      
      if (!response.ok) {
        throw new Error(`NOAA API error: ${response.status}`);
      }
      
      const rawData = await response.json();
      
      // Parse real NOAA satellite data
      const parsedData = this.parseNoaaData(rawData);
      
      if (parsedData) {
        return parsedData;
      }
      
      // Fallback to secondary NOAA endpoints
      return await this.getSecondaryNoaaData();
      
    } catch (error) {
      console.error('Error fetching NOAA data:', error);
      throw error; // Don't use mock data - let the UI handle the error
    }
  }

  private static parseNoaaData(rawData: any): SolarProtonFluxData | null {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return null;
    }
    
    // Look for proton flux data in the satellite indices
    const protonEntries = rawData.filter((entry: any) => 
      entry.phenomenon === 'proton-flux' && 
      entry.satellite && 
      entry.flux !== undefined
    );
    
    if (protonEntries.length > 0) {
      // Get the most recent entry
      const latestEntry = protonEntries.reduce((latest: any, current: any) => {
        const latestTime = new Date(latest.time_tag || 0);
        const currentTime = new Date(current.time_tag || 0);
        return currentTime > latestTime ? current : latest;
      });
      
      return {
        timestamp: new Date(latestEntry.time_tag),
        protonFlux: parseFloat(latestEntry.flux) || 0,
        energy: latestEntry.energy || '>=10 MeV',
        satellite: latestEntry.satellite || 'GOES',
        lastUpdated: new Date()
      };
    }
    
    return null;
  }

  private static async getSecondaryNoaaData(): Promise<SolarProtonFluxData> {
    // Try the primary GOES satellite data
    const goesResponse = await fetch(`${this.API_BASE}/goes/instrument-and-sensor-data.json`);
    
    if (goesResponse.ok) {
      const goesData = await goesResponse.json();
      const parsed = this.parseGoesData(goesData);
      if (parsed) return parsed;
    }
    
    // Try real-time proton data
    const realtimeResponse = await fetch(`${this.API_BASE}/products/noaa-proton-flux-primary.json`);
    
    if (realtimeResponse.ok) {
      const realtimeData = await realtimeResponse.json();
      return this.parseRealtimeProtonData(realtimeData);
    }
    
    throw new Error('No real NOAA data available');
  }

  private static parseGoesData(goesData: any): SolarProtonFluxData | null {
    if (!goesData || !Array.isArray(goesData) || goesData.length === 0) {
      return null;
    }
    
    // Find proton flux measurements
    const protonMeasurements = goesData.filter((item: any) => 
      item.instrument === 'SEMP' && // Space Environment Monitor - Protons
      item.parameter === 'proton_flux'
    );
    
    if (protonMeasurements.length > 0) {
      const latest = protonMeasurements[0];
      return {
        timestamp: new Date(latest.timestamp),
        protonFlux: latest.value || 0,
        energy: '>=10 MeV',
        satellite: latest.satellite || 'GOES',
        lastUpdated: new Date()
      };
    }
    
    return null;
  }

  private static parseRealtimeProtonData(realtimeData: any): SolarProtonFluxData {
    const now = new Date();
    
    // Extract from the structured realtime data
    if (realtimeData && realtimeData.proton_flux) {
      return {
        timestamp: new Date(realtimeData.timestamp || now),
        protonFlux: realtimeData.proton_flux['>=10MeV'] || 
                   realtimeData.proton_flux['p10'] || 
                   realtimeData.proton_flux.measured || 0,
        energy: '>=10 MeV',
        satellite: realtimeData.satellite || 'GOES-16',
        lastUpdated: now
      };
    }
    
    // Fallback structure parsing
    return {
      timestamp: now,
      protonFlux: realtimeData?.p10 ?? realtimeData?.['>=10MeV'] ?? 0,
      energy: '>=10 MeV',
      satellite: 'GOES-16',
      lastUpdated: now
    };
  }

  static getAlertLevel(flux: number): 'NORMAL' | 'WARNING' | 'ALERT' | 'SEVERE' {
    if (flux >= 1000) return 'SEVERE';
    if (flux >= 100) return 'ALERT';
    if (flux >= 10) return 'WARNING';
    return 'NORMAL';
  }
}