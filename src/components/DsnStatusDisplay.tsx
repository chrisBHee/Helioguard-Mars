'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Satellite, Activity, Clock, Signal } from 'lucide-react';
import { NasaDSNService, DSNAntenna, MarsAsset } from '@/services/nasa-dsn-service';

interface DsnStatusData {
  timestamp: Date;
  activeLinks: number;
  totalExpected: number;
  assets: MarsAsset[];
  antennas: DSNAntenna[];
}

export function DsnStatusDisplay() {
  const [dsnData, setDsnData] = useState<DsnStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const expectedConnections = 2; // MAVEN and MRO

  useEffect(() => {
    const fetchDsnStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const status = await NasaDSNService.getDSNStatus();
        
        const dsnData: DsnStatusData = {
          timestamp: status.timestamp,
          activeLinks: status.activeConnections,
          totalExpected: expectedConnections,
          assets: status.marsAssets,
          antennas: status.antennas
        };
        
        setDsnData(dsnData);
      } catch (err) {
        console.error('Error fetching DSN status:', err);
        setError(err instanceof Error ? err.message : 'Failed to load DSN data');
        // Set default data to prevent UI breaking
        setDsnData({
          timestamp: new Date(),
          activeLinks: 0,
          totalExpected: expectedConnections,
          assets: [],
          antennas: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDsnStatus();
    const interval = setInterval(fetchDsnStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'TRACKING': return 'text-green-400';
      case 'ACQUIRED': return 'text-yellow-400';
      case 'LOST_LOCK': return 'text-orange-400';
      case 'OFFLINE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TRACKING': return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
      case 'ACQUIRED': return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'LOST_LOCK': return <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>;
      case 'OFFLINE': return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      default: return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getSignalQualityColor = (signalStrength: number): string => {
    if (signalStrength >= 80) return 'text-green-400';
    if (signalStrength >= 60) return 'text-yellow-400';
    if (signalStrength >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatLastContact = (lastContact: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - lastContact.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-700/30">
        <div className="animate-pulse">
          <div className="h-6 bg-blue-700/50 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-blue-700/30 rounded"></div>
            <div className="h-16 bg-blue-700/30 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-700/30">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">DSN Network Status</h3>
        </div>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <p className="text-orange-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 backdrop-blur-sm border border-blue-700/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-400" />
          DSN Network Status
        </h3>
        <span className="text-xs text-blue-300">
          {dsnData?.timestamp.toLocaleTimeString()}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-blue-300">Active Links</span>
          <span className="font-bold text-lg">
            <span className={
              dsnData?.activeLinks === dsnData?.totalExpected ? 'text-green-400' :
              dsnData?.activeLinks ? 'text-yellow-400' : 'text-red-400'
            }>
              {dsnData?.activeLinks}
            </span>
            <span className="text-blue-300">/{dsnData?.totalExpected}</span>
          </span>
        </div>
        
        <div className="w-full bg-blue-900/30 rounded-full h-2">
          <motion.div 
            className={`h-2 rounded-full ${
              dsnData?.activeLinks === dsnData?.totalExpected ? 'bg-green-500' :
              dsnData?.activeLinks ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${dsnData ? (dsnData.activeLinks / dsnData.totalExpected) * 100 : 0}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {dsnData?.assets && dsnData.assets.length > 0 ? (
          dsnData.assets.map((asset, index) => (
            <motion.div
              key={asset.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-blue-800/20 rounded-lg p-4 border border-blue-700/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">{asset.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(asset.status)}
                  <span className={`text-xs font-medium ${getStatusColor(asset.status)}`}>
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-blue-300">Antenna:</span>
                  <div className="font-mono text-blue-400">{asset.antenna}</div>
                </div>
                <div>
                  <span className="text-blue-300">Signal:</span>
                  <div className={`font-mono ${getSignalQualityColor(asset.signalStrength)}`}>
                    {asset.signalStrength} dB
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-700/30">
                <div className="flex items-center gap-1">
                  <Signal className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300">Data Rate:</span>
                  <span className="text-xs text-blue-400 font-mono">{asset.dataRate} kbps</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300">
                    {formatLastContact(asset.lastContact)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6">
            <Wifi className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
            <p className="text-blue-300">No active Mars communication links</p>
            <p className="text-sm text-blue-400/70 mt-1">
              Expected connections: {expectedConnections}
            </p>
          </div>
        )}
      </div>

      {/* Offline spacecraft indicator */}
      {dsnData && dsnData.assets.length < expectedConnections && (
        <div className="mt-4 pt-3 border-t border-blue-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Offline Assets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['MAVEN', 'MRO'].filter(name => 
              !dsnData.assets.some(asset => asset.name === name)
            ).map(name => (
              <span 
                key={name} 
                className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs"
              >
                {name} OFFLINE
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}