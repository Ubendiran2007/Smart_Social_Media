import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useMood } from './MoodContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  BeakerIcon, 
  BoltIcon, 
  HandRaisedIcon, 
  EyeIcon, 
  BellIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonButton, AIBadge } from '../components/ui/SiliconValley';
import { usersAPI } from '../services/usersAPI';

const WellnessContext = createContext();

export const WellnessProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { activeMood } = useMood();
  
  // Settings
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem('sentient_wellness_enabled') !== 'false';
  });
  const [reminderInterval, setReminderInterval] = useState(() => {
    return parseInt(localStorage.getItem('sentient_wellness_interval')) || 30000; // Default 30s for demo
  });
  const [focusMode, setFocusMode] = useState(false);
  
  // State
  const [sessionStartTime] = useState(Date.now());
  const [reelCount, setReelCount] = useState(0);
  const [showReminder, setShowReminder] = useState(null);
  const [burnoutIndex, setBurnoutIndex] = useState(24);
  const [dailySessions, setDailySessions] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  
  const metricsInterval = useRef(null);
  const reminderTimer = useRef(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('sentient_wellness_enabled', remindersEnabled);
    localStorage.setItem('sentient_wellness_interval', reminderInterval);
  }, [remindersEnabled, reminderInterval]);

  // Periodic Reminder Timer
  useEffect(() => {
    if (remindersEnabled && !isLocked && !focusMode) {
      startReminderTimer();
    } else {
      stopReminderTimer();
    }
    return () => stopReminderTimer();
  }, [remindersEnabled, reminderInterval, isLocked, focusMode]);

  // Sync Metrics
  useEffect(() => {
    if (user && token) {
      loadInitialWellness();
      metricsInterval.current = setInterval(syncWellnessMetrics, 2 * 60 * 1000);
    }
    return () => clearInterval(metricsInterval.current);
  }, [user, token]);

  const startReminderTimer = () => {
    stopReminderTimer();
    reminderTimer.current = setInterval(() => {
      triggerSmartReminder();
    }, reminderInterval);
  };

  const stopReminderTimer = () => {
    if (reminderTimer.current) {
      clearInterval(reminderTimer.current);
    }
  };

  const triggerSmartReminder = () => {
    const sessionTime = Math.floor((Date.now() - sessionStartTime) / 60000);
    
    // Choose reminder type based on activity and mood
    let type = 'general';
    if (reelCount > 10) type = 'eyes';
    if (sessionTime > 15) type = 'stretch';
    if (activeMood === 'Productive') type = 'focus';
    
    const messages = {
      general: {
        title: 'Hydration Sync',
        message: 'Your neural circuits need fluid. Take a sip of water to maintain peak performance.',
        icon: BeakerIcon,
        color: 'cyan'
      },
      eyes: {
        title: 'Optical Reset',
        message: 'You have processed significant visual data. Rest your eyes for 20 seconds.',
        icon: EyeIcon,
        color: 'purple'
      },
      stretch: {
        title: 'Physical Calibration',
        message: 'Session duration detected. Stretch and realign your posture for better flow.',
        icon: HandRaisedIcon,
        color: 'emerald'
      },
      focus: {
        title: 'Flow State Guard',
        message: 'You are in deep productivity. Consider enabling Focus Mode to minimize interruptions.',
        icon: BoltIcon,
        color: 'orange'
      }
    };

    // Mood-specific overrides
    const selected = { ...messages[type] || messages.general };
    if (activeMood === 'Funny') {
      selected.message = "Your brain deserves a loading screen too. Take a 30-second break 💀";
    } else if (activeMood === 'Calm') {
      selected.message = "Take a deep breath and let the neural pulses settle 🌙";
    }

    setShowReminder(selected);
  };

  const loadInitialWellness = async () => {
    try {
      const res = await usersAPI.getWellness();
      setBurnoutIndex(res.data.burnoutIndex);
      setDailySessions(res.data.dailySessions);
      if (res.data.burnoutIndex > 90) setIsLocked(true);
    } catch (err) {
      console.error("Wellness: Failed to load context", err);
    }
  };

  const syncWellnessMetrics = async () => {
    try {
      const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
      const res = await usersAPI.syncWellness({
        sessionTime: sessionMinutes,
        reelsWatched: reelCount
      });

      setBurnoutIndex(res.data.burnoutIndex);
      setDailySessions(res.data.dailySessions);

      if (res.data.isHighRisk && !showReminder) {
        setShowReminder({
          title: 'Neural Overload',
          message: res.data.recommendation,
          type: 'burnout',
          icon: NoSymbolIcon,
          color: 'rose'
        });
        if (res.data.burnoutIndex > 90) setIsLocked(true);
      }
    } catch (error) {
      console.error('Wellness: Sync failure', error);
    }
  };

  const incrementReelCount = () => setReelCount(p => p + 1);

  const snoozeReminder = () => {
    setShowReminder(null);
    stopReminderTimer();
    setTimeout(() => {
      if (remindersEnabled) startReminderTimer();
    }, 5 * 60 * 1000);
  };

  return (
    <WellnessContext.Provider value={{ 
      incrementReelCount, 
      burnoutIndex, 
      dailySessions,
      remindersEnabled,
      setRemindersEnabled,
      reminderInterval,
      setReminderInterval,
      focusMode,
      setFocusMode
    }}>
      {children}
      
      {/* Neural Overload Blocker */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-8 backdrop-blur-3xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-black to-black" />
            <GlassCard className="max-w-lg p-12 text-center border-rose-500/50 shadow-[0_0_100px_rgba(225,29,72,0.2)]">
              <NoSymbolIcon className="w-20 h-20 text-rose-500 mx-auto mb-8 animate-pulse" />
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Neural Exhaustion</h2>
              <p className="text-sm font-medium text-white/60 leading-relaxed mb-10 uppercase tracking-widest">
                The Neural Guard has detected critical burnout levels ({burnoutIndex}%). Access to the collective stream has been paused. Disconnect and recover.
              </p>
              <NeonButton variant="rose" className="px-12 py-5" onClick={() => window.location.href = 'about:blank'}>
                DISCONNECT NOW
              </NeonButton>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wellness Popup */}
      <AnimatePresence>
        {showReminder && !isLocked && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto"
            >
              <GlassCard className={`max-w-md p-8 border-${showReminder.color}-500/30 shadow-[0_0_50px_rgba(255,255,255,0.05)]`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-${showReminder.color}-500/10 border border-${showReminder.color}-500/20`}>
                    <showReminder.icon className={`w-6 h-6 text-${showReminder.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">{showReminder.title}</h3>
                    <AIBadge>WELLNESS INTERFACE</AIBadge>
                  </div>
                </div>
                
                <p className="text-sm font-medium text-white/80 leading-relaxed mb-8">
                  {showReminder.message}
                </p>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowReminder(null)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Dismiss
                  </button>
                  <NeonButton 
                    variant={showReminder.color === 'rose' ? 'rose' : 'purple'} 
                    className="flex-1 py-4"
                    onClick={snoozeReminder}
                  >
                    Snooze (5m)
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) throw new Error('useWellness must be used within WellnessProvider');
  return context;
};
