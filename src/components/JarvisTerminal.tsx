'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Shield, Wifi, Zap, AlertTriangle } from 'lucide-react';
import { JarvisCore, JarvisLogEntry } from '@/services/jarvis-core';
import { NasaDSNService } from '@/services/nasa-dsn-service';
import { NoaaSolarFluxService } from '@/services/noaa-solar-flux-service';
import { NasaDonkiService } from '@/services/nasa-donki-service';

export function JarvisTerminal() {
  const [logs, setLogs] = useState<JarvisLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'NOMINAL' | 'WARNING' | 'ALERT' | 'EMERGENCY'>('NOMINAL');
  const [threatLevel, setThreatLevel] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const jarvisRef = useRef<JarvisCore | null>(null);

  useEffect(() => {
    // Initialize JARVIS core
    jarvisRef.current = JarvisCore.getInstance();
    
    // Start monitoring
    jarvisRef.current.startMonitoring();
    
    // Set up periodic data fetching
    const fetchData = async () => {
      try {
        // Fetch all system data
        const [dsnStatus, solarFlux, flares] = await Promise.all([
          NasaDSNService.getDSNStatus(),
          NoaaSolarFluxService.getLatestProtonFlux(),
          NasaDonkiService.getRecentSolarFlares(1)
        ]);

        // Log system status
        jarvisRef.current?.addLogEntry('INFO', `[JARVIS] System heartbeat: All sensors nominal`);
        
        // Update connection status
        setIsConnected(dsnStatus.activeConnections > 0);
        
        // Update system status from JARVIS
        const jarvisState = jarvisRef.current?.getState();
        if (jarvisState) {
          setSystemStatus(jarvisState.systemStatus);
          setThreatLevel(jarvisState.threatLevel);
        }

      } catch (error) {
        console.error('Error in JARVIS data cycle:', error);
        jarvisRef.current?.addLogEntry('WARNING', `[JARVIS] Data acquisition cycle: PARTIAL FAILURE`);
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up intervals
    const dataInterval = setInterval(fetchData, 60000); // Every minute
    const logInterval = setInterval(() => {
      if (jarvisRef.current) {
        setLogs(jarvisRef.current.getLogHistory());
      }
    }, 1000); // Every second for log updates

    // Cleanup
    return () => {
      clearInterval(dataInterval);
      clearInterval(logInterval);
      jarvisRef.current?.stopMonitoring();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case 'EMERGENCY': return 'text-red-400';
      case 'ALERT': return 'text-orange-400';
      case 'WARNING': return 'text-yellow-400';
      case 'INFO': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'EMERGENCY': return 'text-red-400';
      case 'ALERT': return 'text-orange-400';
      case 'WARNING': return 'text-yellow-400';
      case 'NOMINAL': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toISOString().slice(11, 19); // HH:MM:SS format
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black rounded-xl border-2 border-orange-500 overflow-hidden shadow-2xl"
    >
      {/* Terminal Header */}
      <div className="bg-orange-900/30 px-4 py-3 flex items-center justify-between border-b border-orange-500/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-orange-400" />
          <h3 className="font-mono text-orange-400 font-bold">JARVIS-V1 TERMINAL</h3>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-xs text-orange-300">CONN</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-orange-400" />
            <span className={getStatusColor(systemStatus)}>STATUS: {systemStatus}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span className="text-orange-300">THREAT: {threatLevel}%</span>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 font-mono text-sm">
        {/* System Status Bar */}
        <div className="mb-4 p-2 bg-gray-900/50 rounded border border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-green-400">DSN LINKS</span>
              <span className="text-gray-300">ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">SOLAR MON</span>
              <span className="text-gray-300">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400">SHIELD SYS</span>
              <span className="text-gray-300">STANDBY</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400">AI CORE</span>
              <span className="text-gray-300">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Threat Level Indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-orange-400 text-xs">THREAT ASSESSMENT</span>
            <span className={`text-xs font-bold ${
              threatLevel >= 80 ? 'text-red-400' :
              threatLevel >= 60 ? 'text-orange-400' :
              threatLevel >= 30 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {threatLevel >= 80 ? 'CRITICAL' : 
               threatLevel >= 60 ? 'HIGH' :
               threatLevel >= 30 ? 'MODERATE' : 'LOW'}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div 
              className={`h-2 rounded-full ${
                threatLevel >= 80 ? 'bg-red-500' :
                threatLevel >= 60 ? 'bg-orange-500' :
                threatLevel >= 30 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${threatLevel}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Log Output */}
        <div 
          ref={terminalRef}
          className="bg-gray-900/80 rounded-lg p-3 h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-800"
        >
          <AnimatePresence>
            {logs.slice(0, 50).map((log, index) => (
              <motion.div
                key={`${log.timestamp.getTime()}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="mb-1"
              >
                <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>
                <span className={`ml-2 ${getLogLevelColor(log.level)}`}>
                  {log.level}:
                </span>
                <span className="text-gray-300 ml-1">{log.message}</span>
                {log.data && (
                  <span className="text-gray-500 text-xs ml-2">
                    DATA: {JSON.stringify(log.data)}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {logs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Initializing JARVIS neural network...</p>
            </div>
          )}
        </div>

        {/* Command Prompt */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">JARVIS@HELIOGUARD:~$</span>
            <span className="text-gray-300 animate-pulse">█</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            NASA shortfall compensation protocols: ACTIVE | Autonomous decision cycles: ENABLED
          </div>
        </div>
      </div>
    </motion.div>
  );
}