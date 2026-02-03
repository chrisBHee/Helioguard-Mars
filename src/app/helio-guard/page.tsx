'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Wifi, Zap, AlertTriangle, Satellite, Radio, Thermometer } from 'lucide-react';
import { HelioTerminal } from '@/components/HelioTerminal';
import { DsnStatusDisplay } from '@/components/DsnStatusDisplay';
import { NasaDSNService, DSNAntenna, MarsAsset } from '@/services/nasa-dsn-service';
import { NoaaSolarFluxService, SolarFluxReading, SolarFluxSummary } from '@/services/noaa-solar-flux-service';
import { NasaDonkiService, SolarFlareEvent } from '@/services/nasa-donki-service';
import { JarvisCore } from '@/services/jarvis-core';

export default function HelioGuardDashboard() {
  const [dsnStatus, setDsnStatus] = useState<{antennas: DSNAntenna[], assets: MarsAsset[]}>({antennas: [], assets: []});
  const [solarFlux, setSolarFlux] = useState<SolarFluxReading | null>(null);
  const [fluxSummary, setFluxSummary] = useState<SolarFluxSummary | null>(null);
  const [solarFlares, setSolarFlares] = useState<SolarFlareEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all HELIOGUARD system data
        const [dsnData, fluxData, summaryData, flareData] = await Promise.all([
          NasaDSNService.getDSNStatus(),
          NoaaSolarFluxService.getLatestProtonFlux(),
          NoaaSolarFluxService.getFluxSummary(),
          NasaDonkiService.getRecentSolarFlares(3)
        ]);

        setDsnStatus({
          antennas: dsnData.antennas,
          assets: dsnData.marsAssets
        });
        setSolarFlux(fluxData);
        setFluxSummary(summaryData);
        setSolarFlares(flareData);
        setLastUpdate(new Date());

      } catch (error) {
        console.error('Error fetching HELIOGUARD data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getSystemStatus = () => {
    const jarvis = JarvisCore.getInstance();
    return jarvis.getState();
  };

  const systemStatus = getSystemStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-orange-400 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">INITIALIZING HELIOGUARD SYSTEMS</h1>
            <p className="text-orange-300">Connecting to NASA deep space networks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-orange-400 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            HELIOGUARD
          </h1>
          <p className="text-xl text-orange-300">Autonomous Mars Defense Console - XTerm.js Terminal</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.systemStatus === 'EMERGENCY' ? 'bg-red-500' :
                systemStatus.systemStatus === 'ALERT' ? 'bg-orange-500' :
                systemStatus.systemStatus === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'
              } animate-pulse`}></div>
              <span>STATUS: {systemStatus.systemStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>THREAT: {systemStatus.threatLevel}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>LAST UPDATE: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </motion.header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* HELIOGUARD Terminal - Center Column */}
          <div className="lg:col-span-2">
            <HelioTerminal />
          </div>

          {/* System Status Panel - Right Column */}
          <div className="space-y-6">
            {/* DSN Status Card */}
            <DsnStatusDisplay />

            {/* Solar Monitoring Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-xl p-4 border border-orange-500/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold">SOLAR ACTIVITY</h3>
              </div>
              
              {solarFlux && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-orange-300">Proton Flux:</span>
                    <span className={`font-mono ${
                      solarFlux.protonFlux >= 1000 ? 'text-red-400' :
                      solarFlux.protonFlux >= 100 ? 'text-orange-400' :
                      solarFlux.protonFlux >= 10 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {solarFlux.protonFlux.toFixed(1)} pfu
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-orange-300">Satellite:</span>
                    <span className="text-gray-300">{solarFlux.satellite}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-orange-300">Energy:</span>
                    <span className="text-gray-300">{solarFlux.energy}</span>
                  </div>
                  
                  {fluxSummary && (
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-300">24hr Max:</span>
                        <span className="text-gray-300">{fluxSummary.last24HoursMax.toFixed(1)} pfu</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-300">Trend:</span>
                        <span className={
                          fluxSummary.trend === 'INCREASING' ? 'text-red-400' :
                          fluxSummary.trend === 'DECREASING' ? 'text-green-400' : 'text-gray-300'
                        }>
                          {fluxSummary.trend}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Recent Solar Events */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-xl p-4 border border-orange-500/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold">RECENT SOLAR EVENTS</h3>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {solarFlares.slice(0, 5).map((flare, index) => (
                  <div key={index} className="text-sm border-b border-gray-700 pb-2 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold ${NasaDonkiService.getClassColor(flare.classType)}`}>
                        {flare.classType}{flare.magnitude}
                      </span>
                      <span className="text-xs text-gray-400">
                        {flare.startTime.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300">
                      AR{flare.activeRegion} | {flare.sourceLocation}
                    </div>
                  </div>
                ))}
                
                {solarFlares.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <Radio className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent solar events</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 pt-4 border-t border-orange-500/30 text-center text-sm text-orange-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-2">
              <Thermometer className="w-4 h-4" />
              <span>NASA STRATEGIC SHORTFALL COMPENSATION: ACTIVE</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              <span>AUTONOMOUS DECISION CYCLES: ENABLED</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>COMMUNICATION DELAY BYPASS: 1,240s</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Satellite className="w-4 h-4" />
              <span>MARS ASSETS: {dsnStatus.assets.length} TRACKING</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}