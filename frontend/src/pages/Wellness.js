import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import WellnessSettings from '../components/wellness/WellnessSettings';
import { AIBadge } from '../components/ui/SiliconValley';

const Wellness = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Neural Wellness</h1>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Guardian Protocol v1.4</p>
          </div>
        </div>
        <AIBadge>ACTIVE PROTECTION</AIBadge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <WellnessSettings />
      </motion.div>

      <div className="text-center space-y-6 pt-12 border-t border-white/5">
        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center border border-white/10">
          <SparklesIcon className="w-8 h-8 text-white/20" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-sm font-black text-white uppercase italic tracking-widest text-white/60">Digital Equilibrium</h3>
          <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] leading-relaxed">
            Your synthetic identity is synchronized with your physical state. Maintaining high neural integrity improves collective stream quality and personal growth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wellness;
