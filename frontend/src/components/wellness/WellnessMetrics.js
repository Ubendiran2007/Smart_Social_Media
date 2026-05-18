import React from 'react';
import { motion } from 'framer-motion';
import { useWellness } from '../../context/WellnessContext';
import { GlassCard, AIBadge } from '../ui/SiliconValley';
import { 
  HeartIcon, 
  BoltIcon, 
  UserCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const WellnessMetrics = () => {
  const { burnoutIndex, dailySessions } = useWellness();

  const metrics = [
    { 
      label: 'Cognitive Load', 
      value: `${burnoutIndex}%`, 
      icon: BoltIcon, 
      color: burnoutIndex > 70 ? 'text-rose-500' : 'text-cyan-400',
      progress: burnoutIndex
    },
    { 
      label: 'Daily Sessions', 
      value: dailySessions, 
      icon: UserCircleIcon, 
      color: 'text-purple-400',
      progress: (dailySessions / 10) * 100
    }
  ];

  return (
    <GlassCard className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Wellness Sync</h3>
        </div>
        <AIBadge>OPTIMIZED</AIBadge>
      </div>

      <div className="space-y-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{metric.label}</span>
              </div>
              <span className={`text-sm font-black italic ${metric.color}`}>{metric.value}</span>
            </div>
            
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metric.progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  metric.label === 'Cognitive Load' 
                  ? 'from-cyan-500 to-purple-600' 
                  : 'from-purple-500 to-pink-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 opacity-30">
          <HeartIcon className="w-4 h-4 text-rose-500" />
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Neural Guard Active</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default WellnessMetrics;
