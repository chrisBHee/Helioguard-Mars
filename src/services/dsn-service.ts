import { DSNTrackingData } from '@/types/solar-data';

export class NasaDsnService {
  private static API_URL = 'https://eyes.nasa.gov/dsn/data/dsn.xml';

  static async getMarsSpacecraftTracking(): Promise<DSNTrackingData[]> {
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`NASA DSN API error: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parsedData = this.parseDsnXml(xmlText);
      
      if (parsedData.length > 0) {
        return parsedData;
      }
      
      // Try alternative DSN endpoints
      return await this.getAlternativeDsnData();
      
    } catch (error) {
      console.error('Error fetching DSN data:', error);
      throw error; // Don't use mock data - let UI handle error
    }
  }

  private static parseDsnXml(xml: string): DSNTrackingData[] {
    const trackingData: DSNTrackingData[] = [];
    
    try {
      // Parse XML manually since we can't use external libraries
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('XML parsing failed');
      }
      
      // Find spacecraft tracking data
      const targets = xmlDoc.getElementsByTagName('target');
      
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const spacecraftName = target.getAttribute('name') || '';
        
        // Only track MAVEN and MRO
        if (spacecraftName === 'MAVEN' || spacecraftName === 'MRO') {
          const dish = target.parentElement;
          if (dish) {
            const site = dish.parentElement;
            
            trackingData.push({
              spacecraft: spacecraftName,
              antenna: dish.getAttribute('name') || 'Unknown',
              status: this.parseDsnStatus(target.getAttribute('status') || ''),
              frequency: target.getAttribute('frequency') || 'X-band',
              azimuth: parseFloat(dish.getAttribute('az') || '0'),
              elevation: parseFloat(dish.getAttribute('el') || '0'),
              lastContact: new Date()
            });
          }
        }
      }
      
      return trackingData;
      
    } catch (error) {
      console.error('XML parsing error:', error);
      // Fallback to regex parsing
      return this.parseDsnXmlWithRegex(xml);
    }
  }

  private static parseDsnXmlWithRegex(xml: string): DSNTrackingData[] {
    const trackingData: DSNTrackingData[] = [];
    
    // Regex patterns for extracting spacecraft data
    const spacecraftPattern = /<target[^>]*name="(MAVEN|MRO)"[^>]*status="([^"]*)"[^>]*frequency="([^"]*)"[^>]*\/?>/g;
    const dishPattern = /<dish[^>]*name="([^"]*)"[^>]*az="([^"]*)"[^>]*el="([^"]*)"[^>]*>[\s\S]*?<\/dish>/g;
    
    let match;
    const spacecraftMatches: {name: string, status: string, frequency: string}[] = [];
    
    // Extract spacecraft data
    while ((match = spacecraftPattern.exec(xml)) !== null) {
      spacecraftMatches.push({
        name: match[1],
        status: match[2],
        frequency: match[3]
      });
    }
    
    // Extract dish data and combine with spacecraft
    while ((match = dishPattern.exec(xml)) !== null) {
      const antenna = match[1];
      const azimuth = parseFloat(match[2]) || 0;
      const elevation = parseFloat(match[3]) || 0;
      
      // Match with spacecraft data
      spacecraftMatches.forEach(spacecraft => {
        trackingData.push({
          spacecraft: spacecraft.name,
          antenna: antenna,
          status: this.parseDsnStatus(spacecraft.status),
          frequency: spacecraft.frequency,
          azimuth: azimuth,
          elevation: elevation,
          lastContact: new Date()
        });
      });
    }
    
    return trackingData;
  }

  private static async getAlternativeDsnData(): Promise<DSNTrackingData[]> {
    // Try NASA's alternative tracking endpoints
    const endpoints = [
      'https://eyes.nasa.gov/dsn/data/dsn_now.json',
      'https://eyes.nasa.gov/dsn/data/complex_data.json'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const jsonData = await response.json();
          const parsed = this.parseDsnJson(jsonData);
          if (parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch from ${endpoint}:`, error);
      }
    }
    
    throw new Error('No real DSN data available');
  }

  private static parseDsnJson(jsonData: any): DSNTrackingData[] {
    const trackingData: DSNTrackingData[] = [];
    
    if (!jsonData) return trackingData;
    
    // Handle different JSON structures
    const complexes = jsonData.complexes || jsonData.Complex || jsonData.sites || [];
    
    complexes.forEach((complex: any) => {
      const dishes = complex.dishes || complex.Dish || complex.antennas || [];
      
      dishes.forEach((dish: any) => {
        const targets = dish.targets || dish.Target || dish.spacecraft || [];
        
        targets.forEach((target: any) => {
          if (target.name === 'MAVEN' || target.name === 'MRO') {
            trackingData.push({
              spacecraft: target.name,
              antenna: dish.name || dish.Name || 'Unknown',
              status: this.parseDsnStatus(target.status || target.Status || ''),
              frequency: target.frequency || target.Frequency || 'X-band',
              azimuth: target.azimuth || target.Azimuth || target.az || 0,
              elevation: target.elevation || target.Elevation || target.el || 0,
              lastContact: new Date(target.last_contact || target.LastContact || Date.now())
            });
          }
        });
      });
    });
    
    return trackingData;
  }

  private static parseDsnStatus(status: string): DSNTrackingData['status'] {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('track') || statusLower === 'up') {
      return 'TRACKING';
    } else if (statusLower.includes('acq') || statusLower.includes('lock')) {
      return 'ACQUIRED';
    } else if (statusLower.includes('lost') || statusLower.includes('unlock')) {
      return 'LOST_LOCK';
    } else if (statusLower.includes('offline') || statusLower.includes('down')) {
      return 'OFFLINE';
    }
    
    return 'OFFLINE';
  }

  static getStatusColor(status: DSNTrackingData['status']): string {
    switch (status) {
      case 'TRACKING': return 'text-green-400';
      case 'ACQUIRED': return 'text-yellow-400';
      case 'LOST_LOCK': return 'text-orange-400';
      case 'OFFLINE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }
}