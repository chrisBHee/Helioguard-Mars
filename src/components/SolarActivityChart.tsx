'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { SolarActivityData } from '@/types/solar-data';
import { NasaSuryaDataService } from '@/services/nasa-surya-api';

interface SolarActivityChartProps {
  className?: string;
}

export function SolarActivityChart({ className = '' }: SolarActivityChartProps) {
  const [historicalData, setHistoricalData] = useState<SolarActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Generate historical data points
        const dataPoints = [];
        const now = new Date();
        
        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 3600000); // Hourly data
          const data = await NasaSuryaDataService.getCurrentSolarActivity();
          dataPoints.push({
            ...data,
            lastUpdated: timestamp
          });
        }
        
        setHistoricalData(dataPoints);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const maxValue = Math.max(...historicalData.map(d => d.solarFlux));
  const minValue = Math.min(...historicalData.map(d => d.solarFlux));
  const range = maxValue - minValue || 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-yellow-400" />
          Solar Activity Timeline
        </h2>
        <div className="text-xs text-gray-400">
          24-Hour History
        </div>
      </div>

      <div className="relative h-48 mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxValue.toFixed(0)} sfu</span>
          <span>{((maxValue + minValue) / 2).toFixed(0)} sfu</span>
          <span>{minValue.toFixed(0)} sfu</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 1, 2].map(i => (
              <div 
                key={i}
                className="absolute w-full border-t border-gray-700/30"
                style={{ top: `${(i * 50)}%` }}
              ></div>
            ))}
          </div>

          {/* Data points and connecting lines */}
          <div className="absolute inset-0">
            {historicalData.map((data, index) => {
              const normalizedValue = ((data.solarFlux - minValue) / range) * 100;
              const xPosition = (index / (historicalData.length - 1)) * 100;
              
              return (
                <div key={index}>
                  {/* Data point */}
                  <div 
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1 -translate-y-1"
                    style={{
                      left: `${xPosition}%`,
                      bottom: `${normalizedValue}%`
                    }}
                  ></div>
                  
                  {/* Connecting line to next point */}
                  {index < historicalData.length - 1 && (
                    <div 
                      className="absolute h-0.5 bg-yellow-400/60"
                      style={{
                        left: `${xPosition}%`,
                        bottom: `${normalizedValue}%`,
                        width: `${100 / (historicalData.length - 1)}%`,
                        transformOrigin: 'left center'
                      }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-12 flex justify-between text-xs text-gray-500 mt-2">
          <span>24h ago</span>
          <span>12h ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Current status indicator */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-yellow-400" />
          <span className="text-gray-300">Current Solar Flux</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-yellow-400">
            {historicalData[historicalData.length - 1]?.solarFlux.toFixed(0) || '0'} sfu
          </div>
          <div className="text-xs text-gray-400">
            {historicalData[historicalData.length - 1]?.lastUpdated.toLocaleTimeString() || ''}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-center text-sm text-gray-400">
          Historical Solar Activity • NASA Surya Data
        </div>
      </div>
    </motion.div>
  );
}