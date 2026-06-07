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
  NoSymbolIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonButton, AIBadge } from '../components/ui/SiliconValley';
import { usersAPI } from '../services/usersAPI';
import { recommendationAPI } from '../services/recommendationAPI';

const WellnessContext = createContext();

export const WellnessProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { activeMood } = useMood();
  
  // Custom Reminder Settings (intervals: 15, 30, 45, 60 mins)
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem('sentient_wellness_enabled') !== 'false';
  });
  const [reminderInterval, setReminderInterval] = useState(() => {
    return parseInt(localStorage.getItem('sentient_wellness_interval')) || 30 * 60000; 
  });
  const [focusMode, setFocusMode] = useState(false);
  
  // Tracking Metrics
  const [sessionStartTime] = useState(Date.now());
  const [reelCount, setReelCount] = useState(0);
  
  // Advanced metrics
  const [dailyScreenTime, setDailyScreenTime] = useState(0);
  const [weeklyScreenTime, setWeeklyScreenTime] = useState(0);
  const [reelsWatchTime, setReelsWatchTime] = useState(0); // tracking reels watch time locally
  const [feedScrollingTime, setFeedScrollingTime] = useState(0);
  
  const [showReminder, setShowReminder] = useState(null);
  const [burnoutScore, setBurnoutScore] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  const [focusStreaks, setFocusStreaks] = useState(0);
  const [learningStreaks, setLearningStreaks] = useState(0);
  
  const metricsInterval = useRef(null);
  const trackingInterval = useRef(null);
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

  // Local Tracking loop (increments active time)
  useEffect(() => {
    if (user && token && !isLocked) {
      trackingInterval.current = setInterval(() => {
        setDailyScreenTime(prev => prev + 1);
        setWeeklyScreenTime(prev => prev + 1);
        
        // Very basic mock of user activity routing logic: 
        // If window URL contains "reels", increment reelsWatchTime
        if (window.location.pathname.includes('/reels')) {
          setReelsWatchTime(prev => prev + 1);
        } else if (window.location.pathname === '/') {
          setFeedScrollingTime(prev => prev + 1);
        }

        calculateBurnoutScore();
      }, 60000); // every minute
    }
    return () => clearInterval(trackingInterval.current);
  }, [user, token, isLocked]);

  // Sync Metrics to backend periodically
  useEffect(() => {
    if (user && token) {
      loadInitialWellness();
      metricsInterval.current = setInterval(syncWellnessMetrics, 5 * 60 * 1000);
    }
    return () => clearInterval(metricsInterval.current);
  }, [user, token]);

  const calculateBurnoutScore = () => {
    // Burnout factors:
    // + continuous scrolling (feedScrollingTime)
    // + excessive usage (dailyScreenTime > 120 mins)
    // + rapid content consumption (reelCount)
    setBurnoutScore(prev => {
      let score = prev;
      score += 0.5; // base increase per minute
      if (window.location.pathname.includes('/reels')) score += 1; // reels drain faster
      if (activeMood === 'Productive' || activeMood === 'Learning') score -= 0.5; // learning/productive slows burnout
      if (focusMode) score -= 1; // focus mode actively recovers
      
      return Math.min(100, Math.max(0, Math.floor(score)));
    });
  };

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
    
    // Smart Interventions based on activity
    let type = 'general';
    if (reelsWatchTime > 20) type = 'eyes';
    if (feedScrollingTime > 30) type = 'scrolling';
    if (sessionTime > 60) type = 'stretch';
    if (activeMood === 'Productive' && !focusMode) type = 'focus';
    
    const messages = {
      general: {
        title: 'Hydration Check',
        message: 'Stay hydrated 💧 Your neural circuits need fluid. Take a sip of water.',
        icon: BeakerIcon,
        color: 'cyan'
      },
      eyes: {
        title: 'Optical Reset',
        message: "You've been watching reels for a while. Rest your eyes for 20 seconds.",
        icon: EyeIcon,
        color: 'purple'
      },
      scrolling: {
        title: 'Scrolling Warning',
        message: "You've been scrolling for 30+ minutes. Time for a short break?",
        icon: ClockIcon,
        color: 'rose'
      },
      stretch: {
        title: 'Physical Calibration',
        message: 'Session duration over an hour. Stretch and realign your posture.',
        icon: HandRaisedIcon,
        color: 'emerald'
      },
      focus: {
        title: 'Flow State Guard',
        message: 'You are highly productive right now. Consider a 5-minute focus reset or turning on Focus Mode.',
        icon: BoltIcon,
        color: 'orange'
      }
    };

    const selected = { ...messages[type] || messages.general };
    setShowReminder(selected);
  };

  const loadInitialWellness = async () => {
    try {
      const res = await usersAPI.getWellness();
      // Use their stored backend index initially
      setBurnoutScore(res.data.burnoutIndex || 10);
      setDailyScreenTime(res.data.dailySessions * 30 || 45); // Mock
      setWeeklyScreenTime(res.data.dailySessions * 150 || 300); // Mock
      setFocusStreaks(3);
      setLearningStreaks(5);
    } catch (err) {
      console.error("Wellness: Failed to load context", err);
    }
  };

  const syncWellnessMetrics = async () => {
    try {
      const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
      const res = await usersAPI.syncWellness({
        sessionTime: sessionMinutes,
        reelsWatched: reelCount,
        burnoutScore: burnoutScore
      });

      if (res.data.isHighRisk && !showReminder && !focusMode) {
        setShowReminder({
          title: 'Neural Overload',
          message: "Critical burnout risk detected. Please disconnect and recover.",
          type: 'burnout',
          icon: NoSymbolIcon,
          color: 'rose'
        });
        if (burnoutScore > 90) setIsLocked(true);
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

  const toggleFocusMode = () => {
    const nextVal = !focusMode;
    setFocusMode(nextVal);
    if (nextVal) {
      recommendationAPI.recordBehavior('focus', { state: 'started' }).catch(() => {});
    }
  };

  return (
    <WellnessContext.Provider value={{ 
      incrementReelCount, 
      burnoutScore,
      dailyScreenTime,
      weeklyScreenTime,
      reelsWatchTime,
      feedScrollingTime,
      focusStreaks,
      learningStreaks,
      remindersEnabled,
      setRemindersEnabled,
      reminderInterval,
      setReminderInterval,
      focusMode,
      toggleFocusMode,
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
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Burnout Prevented</h2>
              <p className="text-sm font-medium text-white/60 leading-relaxed mb-10 uppercase tracking-widest">
                Sentient AI has detected critical burnout levels ({burnoutScore}%). Access to the infinite scroll has been paused to protect your mental wellness.
              </p>
              <NeonButton variant="rose" className="px-12 py-5" onClick={() => window.location.href = 'about:blank'}>
                DISCONNECT & RECOVER
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
                    <AIBadge>WELLNESS COACH</AIBadge>
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
