import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/notificationsAPI';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  UserPlusIcon, 
  BellIcon, 
  SparklesIcon, 
  TrashIcon, 
  CheckCircleIcon,
  AtSymbolIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('All');
  const { socket } = useSocket();

  const tabs = ['All', 'Social', 'AI Insights', 'Mentions', 'Productivity'];

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    return () => socket?.off('newNotification');
  }, [socket]);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationTheme = (type) => {
    switch (type) {
      case 'like': return { icon: HeartIcon, color: 'text-pink-500', bg: 'bg-pink-500/10', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', label: 'Reaction' };
      case 'comment': return { icon: ChatBubbleOvalLeftIcon, color: 'text-cyan-400', bg: 'bg-cyan-400/10', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]', label: 'Comment' };
      case 'follow': return { icon: UserPlusIcon, color: 'text-purple-400', bg: 'bg-purple-400/10', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', label: 'Follow' };
      case 'mention': return { icon: AtSymbolIcon, color: 'text-amber-400', bg: 'bg-amber-400/10', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]', label: 'Mention' };
      case 'ai_insight': return { icon: LightBulbIcon, color: 'text-indigo-400', bg: 'bg-indigo-400/10', glow: 'shadow-[0_0_20px_rgba(129,140,248,0.3)]', label: 'AI Insight' };
      case 'productivity': return { icon: BoltIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]', label: 'System' };
      default: return { icon: BellIcon, color: 'text-white/40', bg: 'bg-white/5', glow: '', label: 'Alert' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Social') return ['like', 'comment', 'follow', 'message'].includes(n.type);
    if (activeTab === 'AI Insights') return n.type === 'ai_insight';
    if (activeTab === 'Mentions') return n.type === 'mention';
    if (activeTab === 'Productivity') return n.type === 'productivity';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-white/5 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Syncing Neural Alerts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <div className="space-y-4">
          <AIBadge>NEURAL INTERFACE</AIBadge>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Notifications</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(139,92,246,1)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{unreadCount} Pending Syncs</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeTab === tab 
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' 
                : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif, idx) => {
              const theme = getNotificationTheme(notif.type);
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <GlassCard 
                    className={`p-6 transition-all duration-500 hover:border-white/20 relative group overflow-hidden ${
                      !notif.isRead ? 'bg-white/5 border-purple-500/20' : ''
                    }`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                    )}
                    
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-6 flex-1">
                        <div className="relative flex-shrink-0">
                          <img
                            src={notif.sender?.avatar || `https://ui-avatars.com/api/?name=${notif.sender?.username || 'S'}&background=random&color=fff`}
                            alt=""
                            className={`w-14 h-14 rounded-2xl object-cover border-2 transition-all group-hover:scale-105 ${
                              !notif.isRead ? 'border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'border-white/5 grayscale group-hover:grayscale-0'
                            }`}
                          />
                          <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl backdrop-blur-xl border border-white/10 ${theme.bg} ${theme.glow}`}>
                            <theme.icon className={`w-4 h-4 ${theme.color}`} />
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg bg-white/5 text-white/30">
                              {theme.label}
                            </span>
                            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em]">
                              {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <p className="text-sm font-bold leading-relaxed">
                            {notif.sender && (
                              <span className="font-black italic uppercase text-white tracking-tighter mr-2 cursor-pointer hover:text-purple-400 transition-colors">
                                @{notif.sender.username}
                              </span>
                            )}
                            <span className="text-white/80">{notif.message}</span>
                          </p>

                          {/* Related Content Preview */}
                          {(notif.postId || notif.reelId) && (
                            <div className="mt-4 p-3 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-4 group/preview hover:bg-white/5 transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                                  {notif.postId ? (
                                    <img src={notif.postId.image} alt="Post" className="w-full h-full object-cover" />
                                  ) : (
                                    <BoltIcon className="w-4 h-4 text-purple-400" />
                                  )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover/preview:text-white/40 transition-colors">
                                  View Related {notif.postId ? 'Post' : 'Reel'}
                                </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-emerald-400 transition-all"
                            title="Acknowledge Sync"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif._id)}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-red-400 transition-all"
                          title="Purge Data"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 glass-panel border-dashed border-white/5 rounded-[4rem] space-y-6"
            >
              <div className="w-24 h-24 rounded-[3rem] bg-white/5 flex items-center justify-center mx-auto relative">
                <SparklesIcon className="w-10 h-10 text-white/10" />
                <div className="absolute inset-0 rounded-[3rem] border-2 border-white/5 animate-ping opacity-20" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-white/10 uppercase tracking-tighter italic">Void Detected</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/5">No neural alerts in the {activeTab} frequency</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;