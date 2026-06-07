import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const MoodContext = createContext();

export const MOODS = {
  NONE: 'None',
  PRODUCTIVE:   'Productive',
  MOTIVATIONAL: 'Motivational',
  CALM:         'Calm',
  LEARNING:     'Learning',
  FUNNY:        'Funny',
};

export const MOOD_THEMES = {
  [MOODS.NONE]: {
    name: 'General',
    emoji: '✨',
    accent: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    chatRoom: 'General Lounge',
    captionHint: 'creative, expressive content',
    activityLabel: 'Engagement Score',
    description: 'Personalised AI feed — best of everything.',
  },
  [MOODS.PRODUCTIVE]: {
    name: 'Productive',
    emoji: '⚡',
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    chatRoom: 'Coding Room',
    captionHint: 'focus, productivity, and tech content',
    activityLabel: 'Focus Score',
    description: 'Coding, startup & career content curated for deep work.',
  },
  [MOODS.MOTIVATIONAL]: {
    name: 'Motivational',
    emoji: '🔥',
    accent: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    chatRoom: 'Hustle Room',
    captionHint: 'inspiring, achievement-driven content',
    activityLabel: 'Drive Score',
    description: 'Success stories and discipline content ranked first.',
  },
  [MOODS.CALM]: {
    name: 'Calm',
    emoji: '🌿',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    chatRoom: 'Wellness Room',
    captionHint: 'mindful, peaceful content',
    activityLabel: 'Wellness Score',
    description: 'Nature, wellness and mindfulness posts selected for you.',
  },
  [MOODS.LEARNING]: {
    name: 'Learning',
    emoji: '📚',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    chatRoom: 'Study Room',
    captionHint: 'educational and tutorial content',
    activityLabel: 'Learning Progress',
    description: 'Tutorials and deep-dives surfaced from the community.',
  },
  [MOODS.FUNNY]: {
    name: 'Funny',
    emoji: '😂',
    accent: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f97316)',
    chatRoom: 'Meme Lounge',
    captionHint: 'humorous, playful content',
    activityLabel: 'Vibe Score',
    description: 'Best memes and entertainment for a quick break.',
  },
};

export const MoodProvider = ({ children }) => {
  const [activeMood, setActiveMood] = useState(() => {
    return localStorage.getItem('sentient_mood') || MOODS.NONE;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const overlayRef = useRef(null);

  const theme = MOOD_THEMES[activeMood] || MOOD_THEMES[MOODS.NONE];

  // Apply CSS custom properties + data attribute on every mood change
  useEffect(() => {
    const moodKey = activeMood.toLowerCase();
    document.body.setAttribute('data-mood', moodKey);
    localStorage.setItem('sentient_mood', activeMood);

    // Update Toaster colors dynamically (picked up via CSS var)
    document.documentElement.style.setProperty('--current-accent', theme.accent);
  }, [activeMood, theme.accent]);

  const changeMood = useCallback((mood) => {
    if (!Object.values(MOODS).includes(mood) || mood === activeMood) return;

    // Flash overlay for premium transition feel
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveMood(mood);
      setIsTransitioning(false);
    }, 280);
  }, [activeMood]);

  return (
    <MoodContext.Provider value={{ activeMood, changeMood, theme, isTransitioning, MOOD_THEMES, MOODS }}>
      {/* Global mood transition overlay */}
      <div
        className="mood-transition-overlay"
        style={{
          opacity: isTransitioning ? 0.1 : 0,
          background: theme.gradient,
          pointerEvents: 'none',
        }}
      />
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) throw new Error('useMood must be used within a MoodProvider');
  return context;
};
