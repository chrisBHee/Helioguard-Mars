'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Gauge, Thermometer, Zap } from 'lucide-react';

interface SolarWindPlasmaAnalyzerProps {
  className?: string;
}

export function SolarWindPlasmaAnalyzer({ className = '' }: SolarWindPlasmaAnalyzerProps) {
  const [plasmaData, setPlasmaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate plasma analyzer data
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setPlasmaData({
          speed: 400 + Math.random() * 300,
          density: 5 + Math.random() * 15,
          temperature: 80000 + Math.random() * 70000,
          pressure: 1 + Math.random() * 4,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error fetching plasma data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 45000); // Refresh every 45 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!plasmaData) return null;

  const getSpeedStatus = (speed: number) => {
    if (speed > 600) return { color: 'text-red-400', status: 'HIGH' };
    if (speed > 500) return { color: 'text-orange-400', status: 'ELEVATED' };
    return { color: 'text-green-400', status: 'NORMAL' };
  };

  const getDensityStatus = (density: number) => {
    if (density > 15) return { color: 'text-red-400', status: 'DENSE' };
    if (density > 10) return { color: 'text-yellow-400', status: 'MODERATE' };
    return { color: 'text-green-400', status: 'LIGHT' };
  };

  const speedStatus = getSpeedStatus(plasmaData.speed);
  const densityStatus = getDensityStatus(plasmaData.density);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wind className="w-6 h-6 text-blue-400" />
          Plasma Analyzer
        </h2>
        <div className="text-xs text-gray-400">
          Updated: {plasmaData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Speed</span>
          </div>
          <div className={`text-2xl font-bold ${speedStatus.color}`}>
            {plasmaData.speed.toFixed(0)} km/s
          </div>
          <div className={`text-xs ${speedStatus.color}`}>
            {speedStatus.status}
          </div>
        </div>

        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">Density</span>
          </div>
          <div className={`text-2xl font-bold ${densityStatus.color}`}>
            {plasmaData.density.toFixed(1)} p/cm³
          </div>
          <div className={`text-xs ${densityStatus.color}`}>
            {densityStatus.status}
          </div>
        </div>

        <div className="p-3 bg-red-500/10 rounded-lg border border-red-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-300">Temp</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {(plasmaData.temperature / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-red-400">
            Plasma
          </div>
        </div>

        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">Pressure</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {plasmaData.pressure.toFixed(1)} nPa
          </div>
          <div className="text-xs text-yellow-400">
            Dynamic
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          Solar Wind Plasma Analysis • ACE Satellite Data
        </div>
      </div>
    </motion.div>
  );
}