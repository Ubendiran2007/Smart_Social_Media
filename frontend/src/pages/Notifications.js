import React, { useState, useEffect, useMemo } from 'react';
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
  BoltIcon,
  UsersIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';
import { useMood } from '../context/MoodContext';

// Helper for date grouping
const categorizeDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'This Week';
  
  return 'Earlier';
};

const ActivityCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('All Activity');
  const { socket } = useSocket();
  const { activeMood, theme } = useMood();

  const tabs = ['All Activity', 'Social Activity', 'AI Insights', 'Productivity', 'Collaboration'];

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
      let data = response.data.notifications || [];
      setNotifications(data);
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
      case 'like': return { icon: HeartIcon, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Reaction' };
      case 'comment': return { icon: ChatBubbleOvalLeftIcon, color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Comment' };
      case 'follow': return { icon: UserPlusIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Follow' };
      case 'mention': return { icon: AtSymbolIcon, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Mention' };
      case 'ai_insight': return { icon: SparklesIcon, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'AI Insight' };
      case 'productivity': return { icon: BoltIcon, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Productivity' };
      case 'collaboration': return { icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Collaboration' };
      default: return { icon: BellIcon, color: 'text-muted-foreground', bg: 'bg-surface-hover', label: 'Alert' };
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeTab === 'All Activity') return true;
      if (activeTab === 'Social Activity') return ['like', 'comment', 'follow', 'mention'].includes(n.type);
      if (activeTab === 'AI Insights') return n.type === 'ai_insight';
      if (activeTab === 'Productivity') return n.type === 'productivity';
      if (activeTab === 'Collaboration') return ['collaboration', 'message'].includes(n.type);
      return true;
    });
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    const groups = { 'Today': [], 'Yesterday': [], 'This Week': [], 'Earlier': [] };
    filteredNotifications.forEach(n => {
      const cat = categorizeDate(n.createdAt || new Date());
      groups[cat].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-10 h-10 border-2 border-muted border-t-accent rounded-full animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing Activity...</p>
      </div>
    );
  }

  // Summary Metrics (Mocking missing data types to make it feel alive, gracefully falling back to real data if available)
  const todayReactions = notifications.filter(n => ['like', 'comment'].includes(n.type) && categorizeDate(n.createdAt || new Date()) === 'Today').length;
  const newFollowers = notifications.filter(n => n.type === 'follow' && categorizeDate(n.createdAt || new Date()) === 'Today').length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 min-h-screen pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Activity Center</h1>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-semibold text-accent">{unreadCount} Live</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Your real-time stream of network interactions and AI insights.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-accent hover:bg-surface-hover transition-all"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Activity Summary Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <GlassCard className="p-4 bg-surface border border-border">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-accent/10">
                 <SparklesIcon className="w-4 h-4 text-accent" />
               </div>
               <span className="text-xs font-semibold text-muted-foreground">Today</span>
             </div>
             <p className="text-xl font-bold text-foreground">Active</p>
           </GlassCard>
           <GlassCard className="p-4 bg-surface border border-border">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-pink-500/10">
                 <HeartIcon className="w-4 h-4 text-pink-500" />
               </div>
               <span className="text-xs font-semibold text-muted-foreground">Reactions</span>
             </div>
             <p className="text-xl font-bold text-foreground">{todayReactions}</p>
           </GlassCard>
           <GlassCard className="p-4 bg-surface border border-border">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-emerald-500/10">
                 <UserPlusIcon className="w-4 h-4 text-emerald-500" />
               </div>
               <span className="text-xs font-semibold text-muted-foreground">New Followers</span>
             </div>
             <p className="text-xl font-bold text-foreground">{newFollowers}</p>
           </GlassCard>
           <GlassCard className="p-4 bg-surface border border-border relative overflow-hidden group cursor-pointer hover:border-accent transition-colors">
             <div className="flex items-center gap-3 mb-2 relative z-10">
               <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.accent}15` }}>
                 <LightBulbIcon className="w-4 h-4" style={{ color: theme.accent }} />
               </div>
               <span className="text-xs font-semibold transition-colors" style={{ color: theme.accent }}>{theme.name} AI Action</span>
             </div>
             <p className="text-xs font-medium text-foreground relative z-10 leading-snug">
               {theme.activityLabel} increased by 12%. Join {theme.chatRoom}?
             </p>
             <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: theme.gradient }} />
           </GlassCard>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap border ${
              activeTab === tab 
                ? 'bg-surface border-accent text-accent shadow-sm' 
                : 'bg-surface border-transparent text-muted-foreground hover:bg-surface-hover hover:border-border hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            Object.entries(groupedNotifications).map(([groupName, items]) => {
              if (items.length === 0) return null;
              
              return (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-border">
                    {groupName}
                  </h3>
                  
                  <div className="space-y-3">
                    {items.map((notif, idx) => {
                      const theme = getNotificationTheme(notif.type);
                      return (
                        <motion.div
                          key={notif._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <GlassCard 
                            className={`p-4 transition-all duration-300 hover:border-accent/50 relative group flex items-start gap-4 ${
                              !notif.isRead ? 'bg-surface shadow-sm border-l-2 border-l-accent border-y-border border-r-border' : 'bg-surface-hover border-border'
                            }`}
                          >
                            <div className="relative shrink-0">
                              <img
                                src={notif.sender?.avatar || `https://ui-avatars.com/api/?name=${notif.sender?.username || 'System'}&background=27272a&color=fff`}
                                alt=""
                                className={`w-12 h-12 rounded-full object-cover transition-transform group-hover:scale-105 ${
                                  !notif.isRead ? 'border-2 border-accent/30' : 'border border-border opacity-80 group-hover:opacity-100'
                                }`}
                              />
                              <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border border-surface bg-surface ${theme.bg}`}>
                                <theme.icon className={`w-3.5 h-3.5 ${theme.color}`} />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-surface border border-border text-muted-foreground">
                                  {theme.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notif.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {!notif.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent ml-auto animate-pulse" />
                                )}
                              </div>
                              
                              <p className="text-sm text-foreground leading-snug">
                                {notif.sender && (
                                  <span className="font-semibold text-foreground mr-1 cursor-pointer hover:text-accent transition-colors">
                                    {notif.sender.username}
                                  </span>
                                )}
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{notif.message}</span>
                              </p>

                              {/* Related Content Preview */}
                              {(notif.postId || notif.reelId) && (
                                <div className="mt-3 p-2.5 rounded-lg bg-surface border border-border flex items-center gap-3 hover:border-accent transition-colors cursor-pointer w-fit pr-4">
                                  <div className="w-8 h-8 rounded-md bg-surface-hover flex items-center justify-center overflow-hidden shrink-0">
                                    {notif.postId ? (
                                      <img src={notif.postId.image || notif.postId} alt="Post" className="w-full h-full object-cover" />
                                    ) : (
                                      <VideoCameraIcon className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                    View Related {notif.postId ? 'Post' : 'Reel'}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                  className="p-1.5 rounded-md bg-surface hover:bg-surface-hover border border-border text-muted-foreground hover:text-emerald-500 transition-colors"
                                  title="Mark as Read"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                className="p-1.5 rounded-md bg-surface hover:bg-surface-hover border border-border text-muted-foreground hover:text-red-500 transition-colors"
                                title="Remove"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </GlassCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-surface border border-dashed border-border rounded-2xl space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto text-muted-foreground">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">You're all caught up</p>
                <p className="text-sm text-muted-foreground mt-1">No new activity in {activeTab}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityCenter;