// JARVIS-V1: Autonomous Mars Defense Intelligence System
// Addresses NASA Strategic Shortfalls in Autonomous Systems & Advanced Habitation

export interface JarvisState {
  systemStatus: 'NOMINAL' | 'WARNING' | 'ALERT' | 'EMERGENCY';
  threatLevel: number; // 0-100 scale
  autonomousMode: boolean;
  lastDecisionTimestamp: Date;
  shieldingStatus: 'ACTIVE' | 'STANDBY' | 'DEPLOYED' | 'OFFLINE';
  communicationDelayCompensation: boolean;
}

export interface JarvisLogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARNING' | 'ALERT' | 'EMERGENCY';
  message: string;
  data?: any;
}

export interface ProtonFluxDataPoint {
  timestamp: Date;
  flux: number; // particles/cm²/s/sr
  energy: string;
  satellite: string;
}

export class JarvisCore {
  private static instance: JarvisCore;
  private state: JarvisState;
  private logHistory: JarvisLogEntry[] = [];
  private protonFluxHistory: ProtonFluxDataPoint[] = [];
  private maxHistoryPoints = 20;
  private emergencyThreshold = 15; // 15% increase threshold
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.state = {
      systemStatus: 'NOMINAL',
      threatLevel: 0,
      autonomousMode: true,
      lastDecisionTimestamp: new Date(),
      shieldingStatus: 'STANDBY',
      communicationDelayCompensation: true
    };
    this.initializeLogging();
  }

  public static getInstance(): JarvisCore {
    if (!JarvisCore.instance) {
      JarvisCore.instance = new JarvisCore();
    }
    return JarvisCore.instance;
  }

  private initializeLogging(): void {
    this.addLogEntry('INFO', '[JARVIS] Initializing autonomous defense system...');
    this.addLogEntry('INFO', '[JARVIS] NASA shortfall compensation protocols loaded');
    this.addLogEntry('INFO', '[JARVIS] Communication delay mitigation: ACTIVE (20.6 min bypass)');
  }

  public addLogEntry(level: JarvisLogEntry['level'], message: string, data?: any): void {
    const entry: JarvisLogEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };

    this.logHistory.unshift(entry);
    // Keep only last 100 log entries
    if (this.logHistory.length > 100) {
      this.logHistory.pop();
    }

    // Log to console for development
    console.log(`[${entry.timestamp.toISOString()}] ${level}: ${message}`);
  }

  public getLogHistory(): JarvisLogEntry[] {
    return [...this.logHistory];
  }

  public addProtonFluxData(data: ProtonFluxDataPoint): void {
    this.protonFluxHistory.unshift(data);
    
    // Maintain fixed history size
    if (this.protonFluxHistory.length > this.maxHistoryPoints) {
      this.protonFluxHistory.pop();
    }

    this.analyzeTrends();
  }

  private analyzeTrends(): void {
    if (this.protonFluxHistory.length < 5) return;

    // Calculate slope using linear regression on recent 5 points
    const recentPoints = this.protonFluxHistory.slice(0, 5);
    const slope = this.calculateSlope(recentPoints);
    
    const latestFlux = recentPoints[0].flux;
    const baselineFlux = recentPoints[recentPoints.length - 1].flux;
    const percentChange = ((latestFlux - baselineFlux) / baselineFlux) * 100;

    this.addLogEntry('INFO', `[JARVIS] Analyzing NOAA GOES-16 Telemetry...`);
    this.addLogEntry('INFO', `[JARVIS] Current flux: ${latestFlux.toFixed(2)} pfu`);
    this.addLogEntry('INFO', `[JARVIS] Trend slope: ${slope.toFixed(4)} pfu/min`);
    this.addLogEntry('INFO', `[JARVIS] Percent change: ${percentChange.toFixed(2)}%`);

    // Update threat level based on trend
    this.updateThreatLevel(slope, percentChange);

    // Check for autonomous transition criteria
    this.checkAutonomousTransition(slope, percentChange);
  }

  private calculateSlope(points: ProtonFluxDataPoint[]): number {
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    points.forEach((point, i) => {
      const x = i; // time index
      const y = point.flux;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private updateThreatLevel(slope: number, percentChange: number): void {
    let newThreatLevel = 0;

    // Base threat from current flux level
    const currentFlux = this.protonFluxHistory[0]?.flux || 0;
    if (currentFlux > 1000) newThreatLevel += 40;
    else if (currentFlux > 100) newThreatLevel += 25;
    else if (currentFlux > 10) newThreatLevel += 10;

    // Add threat from increasing trend
    if (slope > 0) {
      newThreatLevel += Math.min(30, Math.abs(slope) * 2);
    }

    // Add threat from rapid percentage change
    if (percentChange > 10) newThreatLevel += 20;
    else if (percentChange > 5) newThreatLevel += 10;

    this.state.threatLevel = Math.min(100, Math.max(0, newThreatLevel));

    // Update system status based on threat level
    if (this.state.threatLevel >= 80) {
      this.state.systemStatus = 'EMERGENCY';
    } else if (this.state.threatLevel >= 60) {
      this.state.systemStatus = 'ALERT';
    } else if (this.state.threatLevel >= 30) {
      this.state.systemStatus = 'WARNING';
    } else {
      this.state.systemStatus = 'NOMINAL';
    }
  }

  private checkAutonomousTransition(slope: number, percentChange: number): void {
    // NASA shortfall logic: Autonomous decision-making to bypass 20.6min communication lag
    if (percentChange > this.emergencyThreshold && this.state.autonomousMode) {
      this.triggerEmergencyState();
      this.deployAutonomousShielding();
    }
  }

  private triggerEmergencyState(): void {
    this.state.systemStatus = 'EMERGENCY';
    this.state.lastDecisionTimestamp = new Date();
    
    this.addLogEntry('EMERGENCY', `[JARVIS] AUTONOMOUS TRANSITION TRIGGERED!`);
    this.addLogEntry('EMERGENCY', `[JARVIS] Threat escalation detected: ${this.state.threatLevel}%`);
    this.addLogEntry('EMERGENCY', `[JARVIS] Bypassing 1,240s communication delay - local decision executed`);
    this.addLogEntry('EMERGENCY', `[JARVIS] Initiating emergency protocols NOW`);
  }

  private deployAutonomousShielding(): void {
    this.state.shieldingStatus = 'DEPLOYED';
    this.addLogEntry('EMERGENCY', `[JARVIS] SHIELDING DEPLOYED - Crew protection activated`);
    this.addLogEntry('EMERGENCY', `[JARVIS] Habitat shielding protocols: ENGAGED`);
    this.addLogEntry('EMERGENCY', `[JARVIS] EVA activities: SUSPENDED`);
  }

  public getState(): JarvisState {
    return { ...this.state };
  }

  public startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performPeriodicAnalysis();
    }, 180000); // 3-minute intervals for trend analysis

    this.addLogEntry('INFO', `[JARVIS] Continuous monitoring initialized`);
    this.addLogEntry('INFO', `[JARVIS] Autonomous decision cycles: ACTIVE`);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.addLogEntry('INFO', `[JARVIS] Monitoring suspended`);
    }
  }

  private performPeriodicAnalysis(): void {
    if (this.protonFluxHistory.length >= 5) {
      this.addLogEntry('INFO', `[JARVIS] Performing scheduled system analysis...`);
      this.analyzeTrends();
    }
  }

  public resetSystem(): void {
    this.state.systemStatus = 'NOMINAL';
    this.state.threatLevel = 0;
    this.state.shieldingStatus = 'STANDBY';
    this.addLogEntry('INFO', `[JARVIS] System reset to nominal conditions`);
  }

  public setAutonomousMode(enabled: boolean): void {
    this.state.autonomousMode = enabled;
    this.addLogEntry('INFO', `[JARVIS] Autonomous mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }
}