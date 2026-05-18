import React from 'react';
import { motion } from 'framer-motion';
import { useMood } from '../../context/MoodContext';
import { GlassCard } from '../ui/SiliconValley';
import { 
  SparklesIcon, 
  BeakerIcon, 
  CloudIcon, 
  AcademicCapIcon, 
  FaceSmileIcon 
} from '@heroicons/react/24/outline';

const MoodSelector = () => {
  const { activeMood, changeMood } = useMood();
  const [isProductivityMode, setIsProductivityMode] = React.useState(false);

  const moods = [
    { id: 'Productive', name: 'Productive', icon: BeakerIcon, color: 'text-purple-400' },
    { id: 'Motivational', name: 'Motivational', icon: SparklesIcon, color: 'text-orange-400' },
    { id: 'Calm', name: 'Calm', icon: CloudIcon, color: 'text-cyan-400' },
    { id: 'Learning', name: 'Learning', icon: AcademicCapIcon, color: 'text-blue-400' },
    { id: 'Funny', name: 'Funny', icon: FaceSmileIcon, color: 'text-yellow-400' }
  ];

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Mood Sync</h3>
        <button 
          onClick={() => setIsProductivityMode(!isProductivityMode)}
          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
            isProductivityMode ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/40'
          }`}
        >
          {isProductivityMode ? 'Productivity ON' : 'Productivity OFF'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeMood(mood.id)}
            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
              activeMood === mood.id ? 'bg-white/10 border-white/20' : 'hover:bg-white/5 border-transparent'
            } border`}
          >
            <mood.icon className={`w-5 h-5 ${activeMood === mood.id ? mood.color : 'text-white/20'}`} />
            <span className="text-[7px] font-black uppercase tracking-tighter text-white/30">{mood.name}</span>
          </motion.button>
        ))}
      </div>
    </GlassCard>
  );
};

export default MoodSelector;
