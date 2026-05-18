import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, EyeIcon, ShareIcon, FingerPrintIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    accountPrivate: false,
    showActivity: true,
    allowContactSync: true,
    dataAccess: false
  });

  const handleToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const config = {
    accountPrivate: { label: 'Private Account', desc: 'Only approved users can see your posts', icon: ShieldCheckIcon },
    showActivity: { label: 'Activity Status', desc: 'Allow others to see when you are online', icon: SparklesIcon },
    allowContactSync: { label: 'Sync Contacts', desc: 'Find people you know from your network', icon: FingerPrintIcon },
    dataAccess: { label: 'Export Data', desc: 'Download a copy of your personal data', icon: ShareIcon }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center mb-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
          >
            Back to Neural Feed
          </button>
        </div>
        <AIBadge className="mx-auto">SETTINGS</AIBadge>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Privacy & Security</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Manage your account visibility and data permissions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(settings).map(([key, value], idx) => {
          const item = config[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className={`p-8 group hover:border-purple-500/40 transition-all duration-500 ${value ? 'bg-white/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl glass-panel ${value ? 'text-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'text-white/20'}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">{item.label}</h3>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter max-w-[200px]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-2xl transition-all duration-500 border border-white/10 ${
                      value ? 'bg-purple-600/20' : 'bg-white/5'
                    }`}
                  >
                    <motion.span
                      animate={{ x: value ? 28 : 4 }}
                      className={`inline-block h-5 w-5 rounded-xl transition-colors ${
                        value ? 'bg-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.8)]' : 'bg-white/20'
                      }`}
                    />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-12 text-center border-dashed border-white/5 mt-12 bg-transparent">
        <div className="max-w-md mx-auto space-y-6">
          <EyeIcon className="w-12 h-12 text-white/5 mx-auto" />
          <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Privacy Policy</h4>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-loose">
            Your data is encrypted and secure. We value your privacy and never share your personal information without consent.
          </p>
          <AIBadge>PROTECTION ACTIVE</AIBadge>
        </div>
      </GlassCard>
    </div>
  );
};

export default PrivacySettings;