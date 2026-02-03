'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Magnet, Compass, Activity, TrendingUp } from 'lucide-react';

interface GeomagneticFieldMonitorProps {
  className?: string;
}

export function GeomagneticFieldMonitor({ className = '' }: GeomagneticFieldMonitorProps) {
  const [magData, setMagData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate magnetometer data
        await new Promise(resolve => setTimeout(resolve, 900));
        
        const totalField = 25 + Math.random() * 15;
        setMagData({
          total: totalField,
          bx: (Math.random() - 0.5) * 20,
          by: (Math.random() - 0.5) * 20,
          bz: (Math.random() - 0.5) * 20,
          latitude: -80 + Math.random() * 160,
          longitude: -180 + Math.random() * 360,
          kIndex: Math.floor(Math.random() * 9),
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error fetching magnetometer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!magData) return null;

  const getFieldStatus = (field: number) => {
    if (field > 40) return { color: 'text-red-400', status: 'DISTURBED' };
    if (field > 30) return { color: 'text-orange-400', status: 'ACTIVE' };
    return { color: 'text-green-400', status: 'QUIET' };
  };

  const getKIndexStatus = (k: number) => {
    if (k >= 7) return { color: 'text-red-400', status: 'SEVERE STORM' };
    if (k >= 5) return { color: 'text-orange-400', status: 'STORM' };
    if (k >= 3) return { color: 'text-yellow-400', status: 'ACTIVE' };
    return { color: 'text-green-400', status: 'QUIET' };
  };

  const fieldStatus = getFieldStatus(magData.total);
  const kStatus = getKIndexStatus(magData.kIndex);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Magnet className="w-6 h-6 text-green-400" />
          Geomagnetic Monitor
        </h2>
        <div className="text-xs text-gray-400">
          Updated: {magData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Magnet className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Total Field</span>
            </div>
            <div className={`text-xl font-bold ${fieldStatus.color}`}>
              {magData.total.toFixed(1)} nT
            </div>
          </div>
          <div className={`text-sm ${fieldStatus.color}`}>
            {fieldStatus.status}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-blue-500/10 rounded border border-blue-700/30">
            <div className="text-blue-400 mb-1">Bx</div>
            <div className="text-white font-mono">{magData.bx.toFixed(1)} nT</div>
          </div>
          <div className="p-2 bg-purple-500/10 rounded border border-purple-700/30">
            <div className="text-purple-400 mb-1">By</div>
            <div className="text-white font-mono">{magData.by.toFixed(1)} nT</div>
          </div>
          <div className="p-2 bg-yellow-500/10 rounded border border-yellow-700/30">
            <div className="text-yellow-400 mb-1">Bz</div>
            <div className="text-white font-mono">{magData.bz.toFixed(1)} nT</div>
          </div>
        </div>

        <div className="p-3 bg-red-500/10 rounded-lg border border-red-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-red-400" />
              <span className="text-gray-300">Coordinates</span>
            </div>
            <div className="text-right">
              <div className="text-red-400 font-mono">
                {magData.latitude.toFixed(1)}°, {magData.longitude.toFixed(1)}°
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-gray-300">Kp Index</span>
            </div>
            <div className={`text-xl font-bold ${kStatus.color}`}>
              {magData.kIndex}
            </div>
          </div>
          <div className={`text-sm ${kStatus.color}`}>
            {kStatus.status}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          Interplanetary Magnetic Field • Real-time Monitoring
        </div>
      </div>
    </motion.div>
  );
}