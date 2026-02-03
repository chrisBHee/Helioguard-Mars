'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Shield, AlertTriangle, Activity } from 'lucide-react';

interface RadiationExposureTrackerProps {
  className?: string;
}

export function RadiationExposureTracker({ className = '' }: RadiationExposureTrackerProps) {
  const [radiationData, setRadiationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate radiation data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setRadiationData({
          currentLevel: 25 + Math.random() * 50,
          dailyLimit: 80,
          exposurePercentage: Math.floor(Math.random() * 100),
          safeUntil: new Date(Date.now() + Math.random() * 3600000),
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error fetching radiation data:', error);
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!radiationData) return null;

  const getSafetyStatus = (percentage: number) => {
    if (percentage > 80) return { color: 'text-red-400', status: 'CRITICAL', bg: 'bg-red-500/20' };
    if (percentage > 60) return { color: 'text-orange-400', status: 'WARNING', bg: 'bg-orange-500/20' };
    if (percentage > 40) return { color: 'text-yellow-400', status: 'CAUTION', bg: 'bg-yellow-500/20' };
    return { color: 'text-green-400', status: 'SAFE', bg: 'bg-green-500/20' };
  };

  const safety = getSafetyStatus(radiationData.exposurePercentage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-red-400" />
          Radiation Exposure
        </h2>
        <div className="text-xs text-gray-400">
          Updated: {radiationData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="space-y-4">
        <div className={`p-4 rounded-xl border ${safety.bg} border-gray-700/30`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${safety.color}`} />
              <span className="text-gray-300">Safety Status</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${safety.bg} ${safety.color}`}>
              {safety.status}
            </div>
          </div>
          
          <div className="w-full bg-gray-700/30 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full ${safety.color.replace('text-', 'bg-')}`}
              style={{ width: `${radiationData.exposurePercentage}%` }}
            ></div>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            {radiationData.exposurePercentage}% of daily limit
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-300">Current</span>
            </div>
            <div className="text-lg font-bold text-red-400">
              {radiationData.currentLevel.toFixed(1)} μSv/h
            </div>
          </div>

          <div className="p-3 bg-green-500/10 rounded-lg border border-green-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-300">Daily Limit</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {radiationData.dailyLimit} μSv
            </div>
          </div>
        </div>

        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Safe Until</span>
            </div>
            <div className="text-yellow-400 font-semibold">
              {radiationData.safeUntil.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          Crew Radiation Monitoring • Health & Safety Protocol
        </div>
      </div>
    </motion.div>
  );
}