'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { SolarStormAlert } from '@/types/solar-data';

interface NotificationPanelProps {
  alerts: SolarStormAlert[];
}

export function NotificationPanel({ alerts }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Convert alerts to notifications
    const newNotifications = alerts.map(alert => ({
      id: alert.id,
      type: alert.severity === 'HIGH' || alert.severity === 'SEVERE' || alert.severity === 'EXTREME' 
        ? 'warning' 
        : alert.severity === 'MODERATE' 
          ? 'info' 
          : 'success',
      title: alert.type,
      message: `Solar event detected with ${alert.severity.toLowerCase()} severity. Impact probability: ${alert.impactProbability}%`,
      timestamp: alert.timestamp,
      read: false
    }));

    setNotifications(prev => {
      // Only add new notifications that don't already exist
      const existingIds = prev.map(n => n.id);
      const trulyNew = newNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...trulyNew];
    });
  }, [alerts]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-700/50 bg-yellow-900/20';
      case 'info': return 'border-blue-700/50 bg-blue-900/20';
      case 'success': return 'border-green-700/50 bg-green-900/20';
      default: return 'border-gray-700/50 bg-gray-900/20';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-full w-96 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700/50 z-50 shadow-2xl"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bell className="w-6 h-6 text-blue-400" />
                    Notifications
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  <AnimatePresence>
                    {notifications.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-400 mb-2">No notifications</h3>
                        <p className="text-gray-500 text-sm">System alerts will appear here</p>
                      </motion.div>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`p-4 rounded-xl border backdrop-blur-sm ${getNotificationColor(notification.type)} ${
                            !notification.read ? 'ring-2 ring-blue-500/30' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-white">{notification.title}</h3>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                              <div className="text-xs text-gray-500">
                                {notification.timestamp.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="pt-4 border-t border-gray-700/30">
                    <button
                      onClick={() => setNotifications([])}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Clear All Notifications
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}