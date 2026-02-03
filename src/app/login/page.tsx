'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Rocket, AlertCircle } from 'lucide-react';
import { AuthService, LoginCredentials } from '@/services/auth-service';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    missionCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await AuthService.login(credentials);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { username: 'astro.commander', role: 'Astronaut', password: 'nasa2026' },
    { username: 'mission.control', role: 'Mission Control', password: 'nasa2026' },
    { username: 'science.team', role: 'Scientist', password: 'nasa2026' },
    { username: 'admin.nasa', role: 'Administrator', password: 'nasa2026' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              HELIOGUARD MARS
            </h1>
          </div>
          <p className="text-gray-400">NASA Solar Storm Early Warning System</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your NASA username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mission Code (Optional)
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={credentials.missionCode}
                  onChange={(e) => setCredentials({...credentials, missionCode: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MARS-2026-A"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </div>
              ) : (
                'Access Mission Control'
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700/30">
            <p className="text-sm text-gray-400 text-center mb-4">Demo Credentials:</p>
            <div className="grid grid-cols-1 gap-2">
              {demoUsers.map((user, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => setCredentials({
                    username: user.username,
                    password: user.password,
                    missionCode: 'MARS-2026-A'
                  })}
                  className="text-left p-3 bg-gray-900/30 rounded-lg border border-gray-700/20 hover:border-blue-500/50 transition-colors"
                >
                  <div className="text-sm font-medium text-white">{user.username}</div>
                  <div className="text-xs text-gray-400">{user.role} • Pass: {user.password}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>Challenger Center Space Challenge 2026</p>
          <p className="mt-1">Secure NASA Authentication System</p>
        </motion.div>
      </div>
    </div>
  );
}