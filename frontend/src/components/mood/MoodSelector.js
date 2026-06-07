import React from 'react';
import { motion } from 'framer-motion';
import { useMood, MOODS, MOOD_THEMES } from '../../context/MoodContext';
import { SparklesIcon } from '@heroicons/react/24/outline';

const MoodSelector = () => {
  const { activeMood, changeMood, isTransitioning } = useMood();

  // Create an array of mood objects for iteration, excluding 'None' if desired, or keeping it as 'General'
  const moodList = Object.values(MOODS).map(moodKey => ({
    id: moodKey,
    ...MOOD_THEMES[moodKey]
  }));

  return (
    <div className={`bg-surface border border-border rounded-xl p-5 overflow-hidden relative transition-all duration-300 ${isTransitioning ? 'scale-[0.98] opacity-80' : ''}`}>
      {/* Dynamic Background Glow based on Active Mood */}
      <div 
        className="absolute inset-0 opacity-[0.03] transition-colors duration-500 pointer-events-none"
        style={{ background: MOOD_THEMES[activeMood]?.gradient }}
      />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-accent transition-colors duration-500" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Sentient Core</h3>
        </div>
        {/* Small active indicator dot */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-hover border border-border">
           <div className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500" style={{ backgroundColor: 'var(--accent)' }} />
           <span className="text-[9px] font-bold text-muted-foreground uppercase">{activeMood}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 relative z-10">
        {moodList.map((mood) => {
          const isActive = activeMood === mood.id;
          return (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeMood(mood.id)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-surface border-transparent shadow-lg transform -translate-y-0.5' 
                  : 'bg-transparent border-transparent hover:bg-surface-hover hover:border-border/50 text-muted-foreground'
              }`}
              style={{
                // Apply a subtle colored border and background when active
                borderColor: isActive ? `${mood.accent}50` : 'transparent',
                backgroundColor: isActive ? `${mood.accent}15` : '',
              }}
            >
              <span 
                className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'grayscale opacity-50'}`}
              >
                {mood.emoji}
              </span>
              <span 
                className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive ? 'text-foreground' : ''
                }`}
                style={{ color: isActive ? mood.accent : '' }}
              >
                {mood.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Insight Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 relative z-10">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {MOOD_THEMES[activeMood]?.description}
        </p>
      </div>
    </div>
  );
};

export default MoodSelector;
