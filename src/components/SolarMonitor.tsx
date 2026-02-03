'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Thermometer, Gauge, Zap, Eye } from 'lucide-react';
import { SolarActivityData } from '@/types/solar-data';
import { NasaSuryaDataService } from '@/services/nasa-surya-api';

interface SolarMonitorProps {
  className?: string;
}

export function SolarMonitor({ className = '' }: SolarMonitorProps) {
  const [solarData, setSolarData] = useState<SolarActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await NasaSuryaDataService.getCurrentSolarActivity();
        setSolarData(data);
      } catch (error) {
        console.error('Error fetching solar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!solarData) return null;

  const getSolarFluxStatus = (flux: number) => {
    if (flux > 200) return { color: 'text-red-400', status: 'EXTREME' };
    if (flux > 150) return { color: 'text-orange-400', status: 'HIGH' };
    if (flux > 100) return { color: 'text-yellow-400', status: 'MODERATE' };
    return { color: 'text-green-400', status: 'NORMAL' };
  };

  const getXRayStatus = (xray: string) => {
    if (xray.startsWith('X')) return { color: 'text-red-400', status: 'EXTREME' };
    if (xray.startsWith('M')) return { color: 'text-orange-400', status: 'HIGH' };
    if (xray.startsWith('C')) return { color: 'text-yellow-400', status: 'MODERATE' };
    return { color: 'text-green-400', status: 'LOW' };
  };

  const fluxStatus = getSolarFluxStatus(solarData.solarFlux);
  const xrayStatus = getXRayStatus(solarData.xRayClass);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sun className="w-6 h-6 text-yellow-400" />
          Solar Monitor
        </h2>
        <div className="text-xs text-gray-400">
          Updated: {solarData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-700/30">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Solar Flux</span>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${fluxStatus.color}`}>
              {solarData.solarFlux.toFixed(0)} sfu
            </div>
            <div className={`text-xs ${fluxStatus.color}`}>
              {fluxStatus.status}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-700/30">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <span className="text-gray-300">Sunspots</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-orange-400">
              {solarData.sunspotNumber}
            </div>
            <div className="text-xs text-orange-400">
              Active Regions
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-700/30">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">Solar Wind</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-400">
              {solarData.solarWindSpeed.toFixed(0)} km/s
            </div>
            <div className="text-xs text-blue-400">
              Velocity
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-700/30">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">X-Ray Class</span>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${xrayStatus.color}`}>
              {solarData.xRayClass}
            </div>
            <div className={`text-xs ${xrayStatus.color}`}>
              {xrayStatus.status}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          Real-time Solar Observations • NASA Surya Integration
        </div>
      </div>
    </motion.div>
  );
}