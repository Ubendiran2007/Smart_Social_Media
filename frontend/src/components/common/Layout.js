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
  UserIcon
} from '@heroicons/react/24/outline';
import { useMood } from '../../context/MoodContext';
import AIAssistant from './AIAssistant';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const { activeMood, changeMood, theme } = useMood();
  const [isProductivityMode, setIsProductivityMode] = useState(false);
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const moods = [
    { id: 'Productive', name: 'Prod', icon: AcademicCapIcon, color: 'text-cyan-400' },
    { id: 'Motivational', name: 'Moti', icon: RocketLaunchIcon, color: 'text-orange-400' },
    { id: 'Calm', name: 'Calm', icon: FaceSmileIcon, color: 'text-purple-400' },
    { id: 'Learning', name: 'Learn', icon: SparklesIcon, color: 'text-emerald-400' },
    { id: 'Funny', name: 'Funny', icon: FaceSmileIcon, color: 'text-pink-400' },
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
    <div className="min-h-screen relative overflow-hidden bg-[#020205]">
      {/* Cinematic Background Blobs */}
      <div className="bg-blob blob-primary" />
      <div className="bg-blob blob-secondary" />
      
      <AIAssistant />

      {/* Floating Glass Navigation Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? '280px' : '80px' }}
        className="fixed left-0 top-0 h-full z-50 glass-panel border-r border-white/5 flex flex-col p-4 m-0 transition-all duration-700"
      >
        <div className="flex items-center gap-4 px-4 py-8 mb-8">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center`}
            style={{ boxShadow: `0 0 20px ${theme.glow}` }}
          >
            <SparklesIcon className="w-6 h-6 text-white" />
          </motion.div>
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-black text-white tracking-tighter"
            >
              SENTIENT
            </motion.h1>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide pr-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                item.current 
                  ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-6 h-6 transition-transform duration-500 group-hover:scale-110 ${item.current ? 'text-white' : ''}`} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-black uppercase tracking-widest"
                >
                  {item.name}
                </motion.span>
              )}
              {item.badge > 0 && isSidebarOpen && (
                <span className="ml-auto bg-red-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
          {isSidebarOpen && (
            <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Neural Sync</p>
              <div 
                onClick={() => setIsProductivityMode(!isProductivityMode)}
                className={`w-6 h-3 rounded-full cursor-pointer transition-all duration-500 relative ${
                  isProductivityMode ? 'bg-cyan-400/20' : 'bg-white/5'
                }`}
              >
                <motion.div 
                  animate={{ x: isProductivityMode ? 12 : 0 }}
                  className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full ${
                    isProductivityMode ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-white/20'
                  }`}
                />
              </div>
            </div>
          )}
 
          <div className={`grid ${isSidebarOpen ? 'grid-cols-5' : 'grid-cols-1'} gap-2 px-2 pb-4`}>
            {moods.map((mood) => (
              <motion.button
                key={mood.id}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => changeMood(mood.id)}
                className={`flex flex-col items-center gap-2 py-3 rounded-2xl transition-all duration-500 ${
                  activeMood === mood.id 
                    ? 'bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' 
                    : 'hover:bg-white/5 opacity-40 hover:opacity-100 border border-transparent'
                }`}
                title={mood.name}
              >
                <mood.icon className={`w-5 h-5 ${activeMood === mood.id ? mood.color : 'text-white'}`} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[6px] font-black uppercase tracking-tighter text-white/40"
                  >
                    {mood.name}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className="transition-all duration-700"
        style={{ paddingLeft: isSidebarOpen ? '300px' : '100px' }}
      >
        <header className="fixed top-0 right-0 left-0 h-24 z-40 glass-nav flex items-center justify-between px-12 pointer-events-none">
          <div className="flex-1" />
          <div className="flex items-center gap-8 pointer-events-auto">
            <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/40">
              <Link to="/docs" className="hover:text-white cursor-pointer transition">Docs</Link>
              <Link to="/privacy-settings" className="hover:text-white cursor-pointer transition">Security</Link>
              <Link to="/analytics" className="hover:text-white cursor-pointer transition">Portal</Link>
            </div>
            
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 glass-panel border-white/10 px-4 py-2 rounded-2xl"
              >
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=9333ea&color=fff`} 
                  alt="" 
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <span className="text-xs font-black text-white">{user?.username}</span>
              </motion.button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    className="absolute right-0 mt-4 w-56 glass-panel border-white/10 rounded-3xl p-3 z-50 overflow-hidden"
                  >
                    <Link to={`/profile/${user?._id}`} className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl text-xs font-bold text-white transition">
                      <UserIcon className="w-5 h-5 text-purple-400" /> My Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-2xl text-xs font-bold text-red-400 transition"
                    >
                      <PowerIcon className="w-5 h-5" /> Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="pt-32 px-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;