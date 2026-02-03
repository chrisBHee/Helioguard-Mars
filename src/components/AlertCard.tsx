'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, Shield } from 'lucide-react';
import { SolarStormAlert } from '@/types/solar-data';

interface AlertCardProps {
  alert: SolarStormAlert;
  onClick?: () => void;
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500/20 border-green-500';
      case 'MODERATE': return 'bg-yellow-500/20 border-yellow-500';
      case 'HIGH': return 'bg-orange-500/20 border-orange-500';
      case 'SEVERE': return 'bg-red-500/20 border-red-500';
      case 'EXTREME': return 'bg-purple-500/20 border-purple-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-green-400';
      case 'MODERATE': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'SEVERE': return 'text-red-400';
      case 'EXTREME': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg backdrop-blur-sm ${getSeverityColor(alert.severity)}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${getSeverityTextColor(alert.severity)}`} />
          <span className={`font-bold ${getSeverityTextColor(alert.severity)}`}>
            {alert.severity}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          {formatDate(alert.timestamp)}
        </div>
      </div>

      <h3 className="font-semibold text-white mb-2">{alert.type}</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Intensity: {alert.intensity}/10</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-purple-400" />
          <span>{alert.duration}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">Affected Regions:</div>
        <div className="flex flex-wrap gap-1">
          {alert.affectedRegions.map((region, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-black/30 rounded-full text-xs"
            >
              {region}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-white/10">
        <div className="text-xs text-gray-400 mb-2">Recommendations:</div>
        <ul className="text-xs space-y-1">
          {alert.recommendations.slice(0, 2).map((rec, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-blue-400 mt-1">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}