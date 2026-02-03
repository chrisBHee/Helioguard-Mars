'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut, User, Shield, Settings, Rocket } from 'lucide-react';
import { AuthService, User as UserType } from '@/services/auth-service';
import { SolarStormAlert, MissionStatus } from '@/types/solar-data';
import { NasaSuryaDataService } from '@/services/nasa-surya-api';
import { AlertCard } from '@/components/AlertCard';
import { SolarActivityDashboard } from '@/components/SolarActivityDashboard';
import { MarsWeatherDashboard } from '@/components/MarsWeatherDashboard';
import { SolarActivityChart } from '@/components/SolarActivityChart';
import { NotificationPanel } from '@/components/NotificationPanel';
import { SolarMonitor } from '@/components/SolarMonitor';
import { CommsStatusWidget } from '@/components/CommsStatusWidget';
import { AuroraForecast } from '@/components/AuroraForecast';
import { RadiationExposureTracker } from '@/components/RadiationExposureTracker';
import { SolarWindPlasmaAnalyzer } from '@/components/SolarWindPlasmaAnalyzer';
import { GeomagneticFieldMonitor } from '@/components/GeomagneticFieldMonitor';

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [alerts, setAlerts] = useState<SolarStormAlert[]>([]);
  const [predictions, setPredictions] = useState<SolarStormAlert[]>([]);
  const [missionStatus, setMissionStatus] = useState<MissionStatus>({
    crewCount: 6,
    missionPhase: 'SURFACE_OPERATIONS',
    distanceFromEarth: 78000000,
    distanceFromSun: 1.52,
    communicationDelay: 1280,
    lastContact: new Date()
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    setUser(AuthService.getCurrentUser());

    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsData, predictionsData] = await Promise.all([
          NasaSuryaDataService.getActiveAlerts(),
          NasaSuryaDataService.predictSolarStorms()
        ]);
        setAlerts(alertsData);
        setPredictions(predictionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  const getMissionPhaseColor = (phase: string) => {
    switch (phase) {
      case 'SURFACE_OPERATIONS': return 'text-green-400';
      case 'ORBIT': return 'text-blue-400';
      case 'TRANSIT': return 'text-yellow-400';
      case 'RETURN': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatDistance = (distance: number) => {
    if (distance > 1000000) {
      return `${(distance / 1000000).toFixed(1)}M km`;
    }
    return `${(distance / 1000).toFixed(0)}k km`;
  };

  const formatTimeDelay = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header with User Info */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                HELIOGUARD MARS
              </h1>
              <p className="text-gray-400 text-sm">NASA Solar Storm Early Warning System</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  user.role === 'ASTRONAUT' ? 'bg-green-500' :
                  user.role === 'MISSION_CONTROL' ? 'bg-blue-500' :
                  user.role === 'SCIENTIST' ? 'bg-purple-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-gray-400 capitalize">{user.role.replace('_', ' ').toLowerCase()}</div>
                </div>
                <User className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/helio-guard')}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                >
                  <Rocket className="w-4 h-4" />
                  HELIOGUARD
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Mission Status Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-4 border border-blue-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-300">Earth Distance</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {formatDistance(missionStatus.distanceFromEarth)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-4 border border-yellow-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-yellow-300">Sun Distance</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {missionStatus.distanceFromSun.toFixed(2)} AU
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-purple-300">Crew Status</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {missionStatus.crewCount} Active
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-4 border border-red-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-300">Last Contact</span>
            </div>
            <div className="text-lg font-bold text-red-400">
              {missionStatus.lastContact.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Grid - First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <SolarActivityDashboard />
            <SolarActivityChart />
          </div>
          <div className="space-y-6">
            <MarsWeatherDashboard />
            <SolarMonitor />
          </div>
          <CommsStatusWidget />
        </div>

        {/* Second Row - Advanced Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <AuroraForecast />
          <RadiationExposureTracker />
          <SolarWindPlasmaAnalyzer />
          <GeomagneticFieldMonitor />
        </div>

        {/* Alerts Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Alerts & Predictions</h2>
            <div className="text-sm text-gray-400">
              {alerts.length + predictions.length} active warnings
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction) => (
              <AlertCard 
                key={prediction.id} 
                alert={prediction} 
              />
            ))}
            
            {alerts.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
              />
            ))}

            {alerts.length === 0 && predictions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-400 mb-2">All Systems Nominal</h3>
                <p className="text-gray-400">No active solar storm warnings at this time</p>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Notification Panel */}
      <NotificationPanel alerts={[...alerts, ...predictions]} />

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8 border-t border-gray-800">
        <p>NASA Surya AI Integration • Real-time Solar Monitoring • Mission Critical Intelligence</p>
        <p className="mt-2">Challenger Center Space Challenge 2026 • Secure Access: {user.role}</p>
      </footer>
    </div>
  );
}