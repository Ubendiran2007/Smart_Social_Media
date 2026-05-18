import React, { createContext, useContext, useState, useEffect } from 'react';

const MoodContext = createContext();

export const MOODS = {
  NONE: 'None',
  PRODUCTIVE: 'Productive',
  MOTIVATIONAL: 'Motivational',
  CALM: 'Calm',
  LEARNING: 'Learning',
  FUNNY: 'Funny'
};

export const MOOD_THEMES = {
  [MOODS.NONE]: {
    name: 'Neural',
    color: 'purple',
    accent: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.5)',
    gradient: 'from-purple-600 to-indigo-600'
  },
  [MOODS.PRODUCTIVE]: {
    name: 'Pro',
    color: 'cyan',
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.5)',
    gradient: 'from-cyan-600 to-blue-600'
  },
  [MOODS.MOTIVATIONAL]: {
    name: 'Hustle',
    color: 'orange',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.5)',
    gradient: 'from-orange-500 to-red-600'
  },
  [MOODS.CALM]: {
    name: 'Zen',
    color: 'emerald',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.5)',
    gradient: 'from-emerald-500 to-teal-600'
  },
  [MOODS.LEARNING]: {
    name: 'Brain',
    color: 'blue',
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.5)',
    gradient: 'from-blue-600 to-indigo-700'
  },
  [MOODS.FUNNY]: {
    name: 'Vibe',
    color: 'pink',
    accent: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.5)',
    gradient: 'from-pink-500 to-purple-600'
  }
};

export const MoodProvider = ({ children }) => {
  const [activeMood, setActiveMood] = useState(() => {
    return localStorage.getItem('sentient_mood') || MOODS.NONE;
  });

  const [theme, setTheme] = useState(MOOD_THEMES[activeMood]);

  useEffect(() => {
    localStorage.setItem('sentient_mood', activeMood);
    setTheme(MOOD_THEMES[activeMood]);
    
    // Update body data-theme for global CSS variables if needed
    document.body.setAttribute('data-mood', activeMood.toLowerCase());
  }, [activeMood]);

  const changeMood = (mood) => {
    if (Object.values(MOODS).includes(mood)) {
      setActiveMood(mood);
    }
  };

  return (
    <MoodContext.Provider value={{ activeMood, changeMood, theme }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
