import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  LinkIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon,
  ShareIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { GlassCard, AIBadge, NeonButton } from '../components/ui/SiliconValley';
import { motion, AnimatePresence } from 'framer-motion';

const MyAccount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const settingsCategories = [
    {
      title: 'Neural Identity',
      items: [
        { icon: UserIcon, label: 'Persona Matrix', action: () => navigate('/edit-profile'), description: 'Update your synthetic identity' },
        { icon: KeyIcon, label: 'Access Keys', action: () => navigate('/reset-password'), description: 'Modify neural security codes' },
        { icon: LinkIcon, label: 'Neural Links', action: () => navigate('/linked-accounts'), description: 'Manage external data nodes' }
      ]
    },
    {
      title: 'Transmissions',
      items: [
        { icon: BellIcon, label: 'Neural Alerts', action: () => navigate('/notification-settings'), description: 'Configure real-time sync alerts' },
        { icon: EnvelopeIcon, label: 'Relay Nodes', action: () => navigate('/notification-settings'), description: 'Manage email data streams' }
      ]
    },
    {
      title: 'Guardian Protocols',
      items: [
        { icon: SparklesIcon, label: 'Neural Wellness', action: () => navigate('/wellness'), description: 'Configure AI wellness synchronization' },
        { icon: EyeIcon, label: 'Cloaking Mode', action: () => navigate('/privacy-settings'), description: 'Manage visibility across the network' },
        { icon: ShieldCheckIcon, label: 'Data Sovereignty', action: () => navigate('/privacy-settings'), description: 'Manage your synthetic data access' }
      ]
    }
  ];

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-12 pb-32">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Neural Command</h1>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Account Control Center v2.0</p>
        </div>
      </div>

      <GlassCard className="p-8">
        <div onClick={() => navigate('/edit-profile')} className="flex items-center gap-6 cursor-pointer group">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`} className="w-20 h-20 rounded-[2.5rem] object-cover border-2 border-white/10 group-hover:border-purple-500 transition-all relative z-10" alt="" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{user?.fullName}</h2>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mt-1">@{user?.username}</p>
          </div>
          <ChevronRightIcon className="w-6 h-6 text-white/20 group-hover:text-white transition-all" />
        </div>
      </GlassCard>

      <div className="space-y-10">
        {settingsCategories.map((cat, i) => (
          <div key={i} className="space-y-4">
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">{cat.title}</h2>
            <div className="grid grid-cols-1 gap-3">
              {cat.items.map((item, idx) => (
                <motion.div key={idx} whileHover={{ x: 5 }} onClick={item.action} className="group cursor-pointer">
                  <GlassCard className="p-5 flex items-center gap-5 border-white/5 group-hover:border-white/20 transition-all">
                    <div className="p-3 rounded-2xl bg-white/5 text-white/40 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white uppercase italic tracking-widest">{item.label}</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">{item.description}</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-white/10 group-hover:text-white transition-all" />
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8">
        <NeonButton variant="rose" className="w-full py-5 text-sm" onClick={() => setShowLogoutConfirm(true)}>
          <div className="flex items-center justify-center gap-3">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            DISCONNECT FROM MATRIX
          </div>
        </NeonButton>
      </div>

      <div className="text-center space-y-2 opacity-20">
        <SparklesIcon className="w-6 h-6 mx-auto text-white" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Sentient OS • Silicon Valley Edition</p>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm">
              <GlassCard className="p-8 border-rose-500/30">
                <h3 className="text-xl font-black text-white uppercase italic mb-4 text-center">Terminate Session?</h3>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center mb-8 leading-relaxed">Your neural link will be severed. All active synchronizations will pause.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">Abort</button>
                  <button onClick={handleLogout} className="flex-1 py-4 rounded-2xl bg-rose-600 text-[10px] font-black text-white uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.3)]">Disconnect</button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyAccount;