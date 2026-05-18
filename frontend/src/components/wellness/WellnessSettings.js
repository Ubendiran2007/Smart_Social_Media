import React from 'react';
import { motion } from 'framer-motion';
import { useWellness } from '../../context/WellnessContext';
import { GlassCard, NeonButton } from '../ui/SiliconValley';
import { 
  BellIcon, 
  ClockIcon, 
  BoltIcon, 
  CheckCircleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

const WellnessSettings = () => {
  const { 
    remindersEnabled, setRemindersEnabled,
    reminderInterval, setReminderInterval,
    focusMode, setFocusMode,
    burnoutIndex
  } = useWellness();

  const intervals = [
    { label: '30s (Demo)', value: 30000 },
    { label: '1 min', value: 60000 },
    { label: '5 min', value: 300000 },
    { label: '10 min', value: 600000 },
    { label: '30 min', value: 1800000 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Wellness Sync</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Configure your Neural Guard parameters</p>
        </div>
        <div className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3`}>
          <div className={`w-2 h-2 rounded-full ${burnoutIndex > 70 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'} `} />
          <span className="text-[10px] font-black text-white/60 uppercase">Burnout Index: {burnoutIndex}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reminder Toggle */}
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10">
              <BellIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Alerts</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Hydration, Posture & Eye Sync</p>
            </div>
            <button 
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              className={`w-12 h-6 rounded-full transition-all relative ${remindersEnabled ? 'bg-purple-500' : 'bg-white/5'}`}
            >
              <motion.div 
                animate={{ x: remindersEnabled ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sync Interval</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {intervals.map((int) => (
                <button
                  key={int.value}
                  onClick={() => setReminderInterval(int.value)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${
                    reminderInterval === int.value 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/2 border-white/5 text-white/40 hover:border-white/10'
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Focus Mode */}
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-orange-500/10">
              <BoltIcon className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Focus Mode</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Silence all neural noise</p>
            </div>
            <button 
              onClick={() => setFocusMode(!focusMode)}
              className={`w-12 h-6 rounded-full transition-all relative ${focusMode ? 'bg-orange-500' : 'bg-white/5'}`}
            >
              <motion.div 
                animate={{ x: focusMode ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/2 border border-dashed border-white/10">
            <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase tracking-widest">
              When enabled, all wellness reminders and non-critical notifications will be paused to maintain your flow state.
            </p>
          </div>
        </GlassCard>
      </div>

      <div className="p-6 rounded-[2.5rem] bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10">
            <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Active Protection</h4>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Your wellness parameters are synced across the network</p>
          </div>
        </div>
        <NeonButton variant="purple" className="px-10 py-4">
          Save Configuration
        </NeonButton>
      </div>
    </div>
  );
};

export default WellnessSettings;
