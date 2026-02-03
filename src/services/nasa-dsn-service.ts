// NASA DSN Integration Service for HELIOGUARD
// Tracks Earth antennas communicating with Mars assets

export interface DSNAntenna {
  name: string;
  site: 'Goldstone' | 'Madrid' | 'Canberra';
  status: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE' | 'OFFLINE';
  azimuth: number;
  elevation: number;
  frequency: string;
}

export interface MarsAsset {
  name: 'MAVEN' | 'MRO' | 'Perseverance' | 'Ingenuity';
  status: 'TRACKING' | 'ACQUIRED' | 'LOST_LOCK' | 'OFFLINE';
  antenna: string;
  signalStrength: number; // dB
  dataRate: number; // kbps
  lastContact: Date;
}

export interface DSNStatus {
  timestamp: Date;
  antennas: DSNAntenna[];
  marsAssets: MarsAsset[];
  activeConnections: number;
  totalSignalQuality: number; // 0-100%
}

export class NasaDSNService {
  private static API_URL = 'https://eyes.nasa.gov/dsn/data/dsn.xml';
  private static jarvis = typeof window !== 'undefined' ? 
    require('./jarvis-core').JarvisCore.getInstance() : null;

  static async getDSNStatus(): Promise<DSNStatus> {
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`DSN API error: ${response.status}`);
      }

      const xmlText = await response.text();
      const parsedData = this.parseDSNXML(xmlText);
      
      // Log DSN status to JARVIS
      if (this.jarvis) {
        this.jarvis.addLogEntry('INFO', `[JARVIS] DSN Link Status: ${parsedData.activeConnections} active connections`);
        parsedData.marsAssets.forEach(asset => {
          if (asset.status === 'TRACKING') {
            this.jarvis.addLogEntry('INFO', `[JARVIS] DSN Link Status: ${asset.antenna} ${parsedData.antennas.find(a => a.name === asset.antenna)?.site} connected to ${asset.name}`);
          }
        });
      }

      return parsedData;

    } catch (error) {
      console.error('Error fetching DSN data:', error);
      
      // Return mock data for demonstration
      return this.getMockDSNStatus();
    }
  }

  private static parseDSNXML(xml: string): DSNStatus {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    
    const antennas: DSNAntenna[] = [];
    const marsAssets: MarsAsset[] = [];
    let activeConnections = 0;
    let totalSignalQuality = 0;
    let signalReadings = 0;

    try {
      // Parse antenna data
      const dishes = xmlDoc.getElementsByTagName('dish');
      
      for (let i = 0; i < dishes.length; i++) {
        const dish = dishes[i];
        const name = dish.getAttribute('name') || `DSS-${43 + i}`;
        const az = parseFloat(dish.getAttribute('az') || '0');
        const el = parseFloat(dish.getAttribute('el') || '0');
        
        // Determine site based on antenna number
        let site: DSNAntenna['site'] = 'Goldstone';
        if (name.includes('26') || name.includes('34') || name.includes('55')) site = 'Goldstone';
        else if (name.includes('14') || name.includes('15') || name.includes('63')) site = 'Madrid';
        else if (name.includes('43') || name.includes('45') || name.includes('65')) site = 'Canberra';

        antennas.push({
          name,
          site,
          status: 'ACTIVE',
          azimuth: az,
          elevation: el,
          frequency: 'X-band'
        });
      }

      // Parse spacecraft tracking data
      const targets = xmlDoc.getElementsByTagName('target');
      
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const name = target.getAttribute('name') || '';
        const status = target.getAttribute('status') || '';
        const signal = parseFloat(target.getAttribute('signal') || '0');
        const dataRate = parseFloat(target.getAttribute('data_rate') || '0');

        // Only track Mars assets
        if (name === 'MAVEN' || name === 'MRO' || name === 'Perseverance' || name === 'Ingenuity') {
          const parentDish = target.parentElement;
          const antennaName = parentDish?.getAttribute('name') || 'Unknown';
          
          const assetStatus: MarsAsset['status'] = 
            status.includes('track') ? 'TRACKING' :
            status.includes('acq') ? 'ACQUIRED' :
            status.includes('lost') ? 'LOST_LOCK' : 'OFFLINE';

          if (assetStatus === 'TRACKING') activeConnections++;

          marsAssets.push({
            name: name as MarsAsset['name'],
            status: assetStatus,
            antenna: antennaName,
            signalStrength: signal,
            dataRate: dataRate,
            lastContact: new Date()
          });

          if (signal > 0) {
            totalSignalQuality += Math.min(100, signal * 10); // Normalize signal
            signalReadings++;
          }
        }
      }

    } catch (error) {
      console.error('Error parsing DSN XML:', error);
      return this.getMockDSNStatus();
    }

    return {
      timestamp: new Date(),
      antennas,
      marsAssets,
      activeConnections,
      totalSignalQuality: signalReadings > 0 ? totalSignalQuality / signalReadings : 0
    };
  }

  private static getMockDSNStatus(): DSNStatus {
    const mockAntennas: DSNAntenna[] = [
      {
        name: 'DSS-14',
        site: 'Goldstone',
        status: 'ACTIVE',
        azimuth: 45,
        elevation: 30,
        frequency: 'X-band'
      },
      {
        name: 'DSS-63',
        site: 'Madrid',
        status: 'ACTIVE',
        azimuth: 120,
        elevation: 45,
        frequency: 'X-band'
      },
      {
        name: 'DSS-43',
        site: 'Canberra',
        status: 'ACTIVE',
        azimuth: 200,
        elevation: 25,
        frequency: 'X-band'
      }
    ];

    const mockAssets: MarsAsset[] = [
      {
        name: 'MAVEN',
        status: 'TRACKING',
        antenna: 'DSS-63',
        signalStrength: 85,
        dataRate: 128,
        lastContact: new Date()
      },
      {
        name: 'MRO',
        status: 'ACQUIRED',
        antenna: 'DSS-14',
        signalStrength: 78,
        dataRate: 256,
        lastContact: new Date()
      }
    ];

    return {
      timestamp: new Date(),
      antennas: mockAntennas,
      marsAssets: mockAssets,
      activeConnections: 2,
      totalSignalQuality: 81.5
    };
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'TRACKING': return 'text-green-400';
      case 'ACQUIRED': return 'text-yellow-400';
      case 'LOST_LOCK': return 'text-orange-400';
      case 'OFFLINE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  static getSiteColor(site: string): string {
    switch (site) {
      case 'Goldstone': return 'text-blue-400';
      case 'Madrid': return 'text-red-400';
      case 'Canberra': return 'text-green-400';
      default: return 'text-gray-400';
    }
  }
}