'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Wind, Radiation, Cloud, Eye } from 'lucide-react';
import { MarsWeatherData } from '@/types/solar-data';
import { NasaSuryaDataService } from '@/services/nasa-surya-api';

interface MarsWeatherDashboardProps {
  className?: string;
}

export function MarsWeatherDashboard({ className = '' }: MarsWeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<MarsWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await NasaSuryaDataService.getMarsWeather();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching Mars weather data:', error);
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
          <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const getTemperatureStatus = (temp: number) => {
    if (temp > -20) return { color: 'text-red-400', status: 'WARM' };
    if (temp > -60) return { color: 'text-yellow-400', status: 'MODERATE' };
    return { color: 'text-blue-400', status: 'COLD' };
  };

  const getDustStormRisk = (probability: number) => {
    if (probability > 70) return { color: 'text-red-400', status: 'HIGH RISK' };
    if (probability > 40) return { color: 'text-yellow-400', status: 'MODERATE RISK' };
    return { color: 'text-green-400', status: 'LOW RISK' };
  };

  const tempStatus = getTemperatureStatus(weatherData.temperature);
  const dustRisk = getDustStormRisk(weatherData.dustStormProbability);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Eye className="w-6 h-6 text-red-400" />
          Mars Weather
        </h2>
        <div className="text-xs text-gray-400">
          Updated: {weatherData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg border border-red-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-300">Temperature</span>
          </div>
          <div className={`text-2xl font-bold ${tempStatus.color}`}>
            {weatherData.temperature.toFixed(1)}°C
          </div>
          <div className={`text-xs ${tempStatus.color}`}>
            {tempStatus.status}
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Pressure</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {(weatherData.atmosphericPressure / 100).toFixed(1)} hPa
          </div>
          <div className="text-xs text-blue-400">
            Atmospheric
          </div>
        </div>

        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Radiation className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">Radiation</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {weatherData.radiationLevel.toFixed(0)} μSv/h
          </div>
          <div className="text-xs text-purple-400">
            Background
          </div>
        </div>

        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">Dust Risk</span>
          </div>
          <div className={`text-2xl font-bold ${dustRisk.color}`}>
            {weatherData.dustStormProbability}%
          </div>
          <div className={`text-xs ${dustRisk.color}`}>
            {dustRisk.status}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          Martian Environmental Conditions • Real-time Monitoring
        </div>
      </div>
    </motion.div>
  );
}