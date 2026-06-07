import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  FaceSmileIcon,
  PowerIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useMood } from '../../context/MoodContext';
import AIAssistant from './AIAssistant';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const { activeMood, changeMood } = useMood();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const moods = [
    { id: 'Productive', name: 'Productive', icon: AcademicCapIcon },
    { id: 'Motivational', name: 'Motivate', icon: RocketLaunchIcon },
    { id: 'Calm', name: 'Calm', icon: FaceSmileIcon },
    { id: 'Learning', name: 'Learn', icon: SparklesIcon },
    { id: 'Funny', name: 'Playful', icon: FaceSmileIcon },
  ];

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon, current: location.pathname === '/' },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon, current: location.pathname === '/search' },
    { name: 'Create', href: '/create', icon: PlusCircleIcon, current: location.pathname === '/create' },
    { name: 'Stories', href: '/stories', icon: ClockIcon, current: location.pathname === '/stories' },
    { name: 'Reels', href: '/reels', icon: VideoCameraIcon, current: location.pathname === '/reels' },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, current: location.pathname === '/chat' },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: HeartIcon, 
      current: location.pathname === '/notifications',
      badge: notifications.filter(n => !n.isRead).length
    },
    { name: 'Wellness', href: '/wellness', icon: SparklesIcon, current: location.pathname === '/wellness' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: location.pathname === '/analytics' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      <AIAssistant />

      {/* Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? '260px' : '72px' }}
        className="flex-shrink-0 bg-surface border-r border-border h-screen flex flex-col transition-all duration-300 relative z-30"
      >
        <div className="flex items-center gap-3 px-5 py-6 h-20">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap"
            >
              Sentient
            </motion.h1>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                item.current 
                  ? 'bg-surface-hover text-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-surface-hover/50 hover:text-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${item.current ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {isSidebarOpen && (
                <span className="text-sm whitespace-nowrap">{item.name}</span>
              )}
              {item.badge > 0 && isSidebarOpen && (
                <span className="ml-auto bg-accent text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mood/Theme Selector */}
        <div className="px-3 py-4 border-t border-border">
          {isSidebarOpen && (
            <p className="px-3 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Workspace Mode</p>
          )}
          <div className={`grid ${isSidebarOpen ? 'grid-cols-5 gap-1' : 'grid-cols-1 gap-2'}`}>
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => changeMood(mood.id)}
                title={mood.name}
                className={`flex justify-center items-center p-2 rounded-md transition-colors ${
                  activeMood === mood.id 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                <mood.icon className="w-5 h-5 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors z-40"
        >
          {isSidebarOpen ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md border-b border-border z-20">
          <div className="flex-1" />
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
              <Link to="/privacy-settings" className="hover:text-foreground transition-colors">Security</Link>
              <Link to="/analytics" className="hover:text-foreground transition-colors">Portal</Link>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=27272a&color=f4f4f5`} 
                  alt="" 
                  className="w-7 h-7 rounded-md object-cover border border-border"
                />
                <span className="text-sm font-medium text-foreground">{user?.username}</span>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-2 z-50"
                  >
                    <Link to={`/profile/${user?._id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-hover text-sm font-medium text-foreground transition-colors">
                      <UserIcon className="w-4 h-4 text-muted-foreground" /> Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-sm font-medium text-red-500 transition-colors"
                    >
                      <PowerIcon className="w-4 h-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;