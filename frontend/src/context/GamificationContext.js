import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { gamificationAPI } from '../services/gamificationAPI';
import GamificationToasts from '../components/gamification/GamificationToasts';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [profile, setProfile] = useState(null);
  const [leaderboards, setLeaderboards] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notification queue for toasts
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notif) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await gamificationAPI.getProfile();
      if (res.data?.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch gamification profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeaderboards = useCallback(async () => {
    try {
      const res = await gamificationAPI.getLeaderboards();
      if (res.data?.success) {
        setLeaderboards(res.data.leaderboards);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (user && token) {
      fetchProfile();
      fetchLeaderboards();
    }
  }, [user, token, fetchProfile, fetchLeaderboards]);

  // Real-time socket listeners for gamification events
  useEffect(() => {
    if (!socket) return;

    const handleXpGained = (data) => {
      addNotification({ type: 'xp', message: `+${data.gained} XP — ${data.reason}`, icon: '⚡' });
      setProfile(prev => prev ? { ...prev, xp: data.xp, level: data.level } : prev);
    };

    const handleLevelUp = (data) => {
      addNotification({ type: 'levelUp', message: `Level Up! You are now Level ${data.level}: ${data.title}`, icon: '🎉' });
      setProfile(prev => prev ? { ...prev, level: data.level, title: data.title } : prev);
    };

    const handleAchievement = (data) => {
      addNotification({ type: 'achievement', message: `Achievement Unlocked: ${data.achievement.name}`, icon: data.achievement.icon });
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, achievements: [...(prev.achievements || []), data.achievement] };
      });
    };

    const handleBadge = (data) => {
      addNotification({ type: 'badge', message: `Badge Earned: ${data.badge.name}`, icon: data.badge.icon });
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, badges: [...(prev.badges || []), data.badge] };
      });
    };

    socket.on('xpGained', handleXpGained);
    socket.on('levelUp', handleLevelUp);
    socket.on('achievementUnlocked', handleAchievement);
    socket.on('badgeUnlocked', handleBadge);

    return () => {
      socket.off('xpGained', handleXpGained);
      socket.off('levelUp', handleLevelUp);
      socket.off('achievementUnlocked', handleAchievement);
      socket.off('badgeUnlocked', handleBadge);
    };
  }, [socket, addNotification]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <GamificationContext.Provider value={{
      profile,
      leaderboards,
      loading,
      notifications,
      dismissNotification,
      refreshProfile: fetchProfile,
      refreshLeaderboards: fetchLeaderboards
    }}>
      {children}
      <GamificationToasts />
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within GamificationProvider');
  return context;
};
