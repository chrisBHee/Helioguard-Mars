'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Eye, Clock } from 'lucide-react';

interface AuroraForecastProps {
  className?: string;
}

export function AuroraForecast({ className = '' }: AuroraForecastProps) {
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate aurora forecast data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setForecastData({
          kpIndex: Math.floor(Math.random() * 9),
          visibility: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)],
          peakTime: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'PM' : 'AM'}`,
          confidence: Math.floor(Math.random() * 40) + 60,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error fetching aurora data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1800000); // Refresh every 30 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!forecastData) return null;

  const getKpColor = (kp: number) => {
    if (kp >= 7) return 'text-purple-400';
    if (kp >= 5) return 'text-red-400';
    if (kp >= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      case 'Poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Aurora Forecast
        </h2>
        <div className="text-xs text-gray-400">
          Updated: {forecastData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Kp Index</span>
            </div>
            <div className={`text-2xl font-bold ${getKpColor(forecastData.kpIndex)}`}>
              {forecastData.kpIndex}
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Visibility</span>
            </div>
            <div className={`text-lg font-semibold ${getVisibilityColor(forecastData.visibility)}`}>
              {forecastData.visibility}
            </div>
          </div>
        </div>

        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Peak Time</span>
            </div>
            <div className="text-lg font-semibold text-yellow-400">
              {forecastData.peakTime}
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-500/10 rounded-lg border border-green-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Confidence</span>
            </div>
            <div className="text-lg font-semibold text-green-400">
              {forecastData.confidence}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          Geomagnetic Activity Forecast • Earth-based Monitoring
        </div>
      </div>
    </motion.div>
  );
}