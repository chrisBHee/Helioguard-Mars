'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Zap, Wind, Magnet, Eye, TrendingUp } from 'lucide-react';
import { SolarActivityData } from '@/types/solar-data';
import { NasaSuryaDataService } from '@/services/nasa-surya-api';

interface SolarActivityDashboardProps {
  className?: string;
}

export function SolarActivityDashboard({ className = '' }: SolarActivityDashboardProps) {
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
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!solarData) return null;

  const metrics = [
    {
      icon: Sun,
      label: 'Solar Flux',
      value: `${solarData.solarFlux.toFixed(0)} sfu`,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Eye,
      label: 'Sunspots',
      value: solarData.sunspotNumber.toString(),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: Wind,
      label: 'Solar Wind',
      value: `${solarData.solarWindSpeed.toFixed(0)} km/s`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Zap,
      label: 'Proton Density',
      value: `${solarData.protonDensity.toFixed(1)} p/cm³`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Magnet,
      label: 'Mag Field',
      value: `${solarData.magneticFieldStrength.toFixed(1)} nT`,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: TrendingUp,
      label: 'Kp Index',
      value: solarData.geomagneticIndex.toString(),
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sun className="w-6 h-6 text-yellow-400" />
          Solar Activity Monitor
        </h2>
        <div className="text-xs text-gray-400">
          Last updated: {solarData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${metric.bgColor} rounded-xl p-4 border border-gray-700/30`}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className={`w-5 h-5 ${metric.color}`} />
                <span className="text-sm text-gray-300">{metric.label}</span>
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                X-Ray: {solarData.xRayClass}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Current Space Weather Conditions
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            solarData.geomagneticIndex > 5 
              ? 'bg-red-500/20 text-red-400' 
              : solarData.geomagneticIndex > 3 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-green-500/20 text-green-400'
          }`}>
            {solarData.geomagneticIndex > 5 ? 'DISTURBED' : 
             solarData.geomagneticIndex > 3 ? 'ACTIVE' : 'QUIET'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}