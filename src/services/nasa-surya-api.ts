import { SolarActivityData, SolarStormAlert, MarsWeatherData } from '@/types/solar-data';

const NASA_SURYA_API_BASE = process.env.NASA_SURYA_API_URL || 'https://api.nasa.gov/surya/v1';
const API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

export class NasaSuryaDataService {
  private static async fetchFromAPI(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${NASA_SURYA_API_BASE}${endpoint}?api_key=${API_KEY}`);
      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from NASA Surya API:', error);
      // Return mock data for demo purposes
      return this.generateMockData(endpoint);
    }
  }

  private static generateMockData(endpoint: string): any {
    const now = new Date();
    
    switch (endpoint) {
      case '/solar-activity':
        return {
          solarFlux: 120 + Math.random() * 80,
          sunspotNumber: Math.floor(Math.random() * 150),
          solarWindSpeed: 400 + Math.random() * 200,
          protonDensity: 5 + Math.random() * 15,
          magneticFieldStrength: 5 + Math.random() * 10,
          geomagneticIndex: Math.floor(Math.random() * 9),
          xRayClass: ['A1.0', 'B1.0', 'B5.0', 'C1.0', 'C5.0', 'M1.0', 'M5.0', 'X1.0'][Math.floor(Math.random() * 8)],
          lastUpdated: now.toISOString()
        };
      
      case '/mars-weather':
        return {
          temperature: -80 + Math.random() * 100,
          atmosphericPressure: 600 + Math.random() * 200,
          radiationLevel: 20 + Math.random() * 80,
          solarRadiation: 500 + Math.random() * 300,
          dustStormProbability: Math.floor(Math.random() * 100),
          lastUpdated: now.toISOString()
        };
      
      case '/alerts':
        const severities = ['LOW', 'MODERATE', 'HIGH', 'SEVERE', 'EXTREME'];
        const types = ['Solar Flare', 'Coronal Mass Ejection', 'Geomagnetic Storm', 'Solar Wind'];
        const regions = ['Mars Surface', 'Mars Orbit', 'Transit Corridor', 'Earth-Mars Communication'];
        
        return Array.from({ length: 3 }, (_, i) => ({
          id: `alert-${Date.now()}-${i}`,
          timestamp: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
          severity: severities[Math.floor(Math.random() * severities.length)],
          type: types[Math.floor(Math.random() * types.length)],
          intensity: Math.floor(Math.random() * 10) + 1,
          duration: `${Math.floor(Math.random() * 12) + 1} hours`,
          impactProbability: Math.floor(Math.random() * 100),
          affectedRegions: [regions[Math.floor(Math.random() * regions.length)]],
          recommendations: [
            'Monitor radiation levels',
            'Adjust spacecraft orientation',
            'Review emergency protocols'
          ],
          sourceData: this.generateMockData('/solar-activity')
        }));

      default:
        return {};
    }
  }

  static async getCurrentSolarActivity(): Promise<SolarActivityData> {
    const data = await this.fetchFromAPI('/solar-activity');
    return {
      solarFlux: data.solarFlux,
      sunspotNumber: data.sunspotNumber,
      solarWindSpeed: data.solarWindSpeed,
      protonDensity: data.protonDensity,
      magneticFieldStrength: data.magneticFieldStrength,
      geomagneticIndex: data.geomagneticIndex,
      xRayClass: data.xRayClass,
      lastUpdated: new Date(data.lastUpdated)
    };
  }

  static async getMarsWeather(): Promise<MarsWeatherData> {
    const data = await this.fetchFromAPI('/mars-weather');
    return {
      temperature: data.temperature,
      atmosphericPressure: data.atmosphericPressure,
      radiationLevel: data.radiationLevel,
      solarRadiation: data.solarRadiation,
      dustStormProbability: data.dustStormProbability,
      lastUpdated: new Date(data.lastUpdated)
    };
  }

  static async getActiveAlerts(): Promise<SolarStormAlert[]> {
    const alerts = await this.fetchFromAPI('/alerts');
    return alerts.map((alert: any) => ({
      ...alert,
      timestamp: new Date(alert.timestamp),
      sourceData: {
        ...alert.sourceData,
        lastUpdated: new Date(alert.sourceData.lastUpdated)
      }
    }));
  }

  static async predictSolarStorms(hoursAhead: number = 24): Promise<SolarStormAlert[]> {
    // In a real implementation, this would use NASA's predictive models
    // For demo, we'll generate some predictions based on current data
    
    const currentActivity = await this.getCurrentSolarActivity();
    const predictions: SolarStormAlert[] = [];
    
    // Simple prediction algorithm based on current conditions
    if (currentActivity.geomagneticIndex > 5 || currentActivity.solarWindSpeed > 500) {
      predictions.push({
        id: `prediction-${Date.now()}`,
        timestamp: new Date(Date.now() + 2 * 3600000), // 2 hours from now
        severity: currentActivity.geomagneticIndex > 7 ? 'HIGH' : 'MODERATE',
        type: 'Geomagnetic Storm',
        intensity: Math.min(10, currentActivity.geomagneticIndex + 2),
        duration: '4-6 hours',
        impactProbability: 75,
        affectedRegions: ['Mars Surface', 'Mars Orbit'],
        recommendations: [
          'Increase shielding protocols',
          'Postpone EVA activities',
          'Monitor communication systems'
        ],
        sourceData: currentActivity
      });
    }
    
    return predictions;
  }
}