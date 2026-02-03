'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Wifi, Satellite, Signal, Zap } from 'lucide-react';
import { DSNTrackingData } from '@/types/solar-data';

interface CommsStatusWidgetProps {
  className?: string;
}

export function CommsStatusWidget({ className = '' }: CommsStatusWidgetProps) {
  const [trackingData, setTrackingData] = useState<DSNTrackingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate DSN data fetch
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: DSNTrackingData[] = [
          {
            spacecraft: 'MAVEN',
            antenna: 'DSS-14',
            status: 'TRACKING',
            frequency: 'X-band',
            azimuth: 45.2,
            elevation: 32.1,
            lastContact: new Date()
          },
          {
            spacecraft: 'MRO',
            antenna: 'DSS-34',
            status: 'ACQUIRED',
            frequency: 'Ka-band',
            azimuth: 120.5,
            elevation: 45.8,
            lastContact: new Date(Date.now() - 300000)
          }
        ];
        
        setTrackingData(mockData);
      } catch (error) {
        console.error('Error fetching DSN data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRACKING': return 'text-green-400';
      case 'ACQUIRED': return 'text-blue-400';
      case 'LOST_LOCK': return 'text-yellow-400';
      case 'OFFLINE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'TRACKING': return 'bg-green-500/20';
      case 'ACQUIRED': return 'bg-blue-500/20';
      case 'LOST_LOCK': return 'bg-yellow-500/20';
      case 'OFFLINE': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-blue-400" />
          DSN Tracking Status
        </h2>
        <Signal className="w-5 h-5 text-blue-400" />
      </div>

      <div className="space-y-4">
        {trackingData.map((track, index) => (
          <motion.div
            key={`${track.spacecraft}-${track.antenna}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${getStatusBg(track.status)} rounded-xl p-4 border border-gray-700/30`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Satellite className={`w-5 h-5 ${getStatusColor(track.status)}`} />
                <span className="font-semibold text-white">{track.spacecraft}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(track.status)} ${getStatusColor(track.status)}`}>
                {track.status.replace('_', ' ')}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Wifi className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">{track.antenna}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">{track.frequency}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Azimuth:</span>
                <span className="text-white">{track.azimuth.toFixed(1)}°</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Elevation:</span>
                <span className="text-white">{track.elevation.toFixed(1)}°</span>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-700/30">
              <div className="text-xs text-gray-400">
                Last contact: {track.lastContact.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          NASA Deep Space Network • Real-time Tracking
        </div>
      </div>
    </motion.div>
  );
}