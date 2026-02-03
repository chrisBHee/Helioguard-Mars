export interface SolarActivityData {
  solarFlux: number; // Solar radio flux at 10.7 cm wavelength (sfu)
  sunspotNumber: number; // Number of sunspots
  solarWindSpeed: number; // km/s
  protonDensity: number; // particles/cm³
  magneticFieldStrength: number; // nanotesla (nT)
  geomagneticIndex: number; // Kp index (0-9)
  xRayClass: string; // Solar X-ray classification (A, B, C, M, X)
  lastUpdated: Date;
}

export interface MarsWeatherData {
  temperature: number; // Celsius
  atmosphericPressure: number; // Pascals
  radiationLevel: number; // microsieverts per hour (μSv/h)
  solarRadiation: number; // W/m²
  dustStormProbability: number; // percentage (0-100)
  lastUpdated: Date;
}

export interface SolarStormAlert {
  id: string;
  timestamp: Date;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'EXTREME';
  type: string; // e.g., 'Solar Flare', 'Coronal Mass Ejection'
  intensity: number; // Scale of 1-10
  duration: string; // e.g., '2-4 hours'
  impactProbability: number; // percentage (0-100)
  affectedRegions: string[];
  recommendations: string[];
  sourceData: SolarActivityData;
}

export interface MissionStatus {
  crewCount: number;
  missionPhase: 'SURFACE_OPERATIONS' | 'ORBIT' | 'TRANSIT' | 'RETURN';
  distanceFromEarth: number; // kilometers
  distanceFromSun: number; // Astronomical Units (AU)
  communicationDelay: number; // seconds
  lastContact: Date;
}

export interface DSNTrackingData {
  spacecraft: string; // "MAVEN" or "MRO"
  antenna: string; // e.g., "DSS-14", "DSS-34"
  status: 'TRACKING' | 'ACQUIRED' | 'LOST_LOCK' | 'OFFLINE';
  frequency: string; // e.g., "X-band", "Ka-band"
  azimuth: number; // degrees
  elevation: number; // degrees
  lastContact: Date;
}