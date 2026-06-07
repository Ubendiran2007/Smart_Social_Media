import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  HeartIcon, 
  SparklesIcon,
  BoltIcon,
  ClockIcon,
  FireIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useWellness } from '../context/WellnessContext';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';

const StatCard = ({ title, value, icon: Icon, trend, color, description }) => {
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:border-border-strong transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
            {isPositive ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { theme, activeMood } = useMood();
  const { 
    burnoutScore, 
    dailyScreenTime, 
    weeklyScreenTime, 
    focusStreaks, 
    learningStreaks,
    remindersEnabled,
    setRemindersEnabled,
    reminderInterval,
    setReminderInterval,
    focusMode,
    toggleFocusMode
  } = useWellness();

  const focusScore = Math.max(0, 100 - burnoutScore + (focusStreaks * 2));

  const stats = [
    { 
      title: 'Burnout Score', 
      value: `${burnoutScore}%`, 
      icon: FireIcon, 
      trend: burnoutScore > 50 ? 15 : -5, 
      color: burnoutScore > 70 ? 'rose' : 'emerald',
      description: burnoutScore > 70 ? 'High risk of fatigue' : 'Healthy usage'
    },
    { 
      title: 'Focus Score', 
      value: `${focusScore}%`, 
      icon: ShieldCheckIcon, 
      color: focusScore > 70 ? 'cyan' : 'orange',
      description: 'Your ability to sustain deep work'
    },
    { 
      title: 'Daily Screen Time', 
      value: `${dailyScreenTime}m`, 
      icon: ClockIcon, 
      trend: 5, 
      color: 'purple',
      description: 'Total active minutes today'
    },
    { 
      title: 'Weekly Average', 
      value: `${Math.floor(weeklyScreenTime / 7)}m/day`, 
      icon: ArrowTrendingUpIcon, 
      color: 'blue',
      description: 'Consistent with last week'
    },
  ];

  const aiSuggestion = useMemo(() => {
    if (burnoutScore > 80) return "You've been active for a while and your burnout risk is high. Step away for 30 minutes.";
    if (activeMood === 'Productive') return "You spend 45% more time in Productive Mode. Keep utilizing the Focus Room!";
    return "Learning content receives your highest engagement. We suggest taking a quick 5-minute stretch.";
  }, [burnoutScore, activeMood]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">AI Wellness Center</h1>
            {focusMode && (
              <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent animate-pulse">
                FOCUS MODE ACTIVE
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Your digital companion for mental wellbeing and productivity.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFocusMode}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
              focusMode 
                ? 'bg-accent text-white hover:bg-accent-hover' 
                : 'bg-surface hover:bg-surface-hover border border-border text-foreground'
            }`}
          >
            <BoltIcon className={`w-5 h-5 ${focusMode ? 'text-white' : 'text-accent'}`} /> 
            {focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-foreground">Usage Timeline</h3>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent" /> Productivity
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" /> Scrolling
                </span>
              </div>
            </div>
            
            <div className="h-[240px] w-full relative">
              <svg viewBox="0 0 1000 300" className="w-full h-full preserve-aspect-ratio-none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--mood-primary)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--mood-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d={`M0 250 Q 150 ${250 - dailyScreenTime}, 300 180 T 600 ${250 - (burnoutScore * 2)} T 1000 150`}
                  fill="none"
                  stroke="var(--mood-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  d={`M0 250 Q 150 ${250 - dailyScreenTime}, 300 180 T 600 ${250 - (burnoutScore * 2)} T 1000 150 L 1000 300 L 0 300 Z`}
                  fill="url(#chartGradient)"
                />
              </svg>
              
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full border-t border-border opacity-50" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Focus Streaks</p>
                <p className="text-3xl font-black text-emerald-500 flex items-center gap-2">
                  {focusStreaks} <FireIcon className="w-6 h-6" />
                </p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Learning Streaks</p>
                <p className="text-3xl font-black text-blue-500 flex items-center gap-2">
                  {learningStreaks} <SparklesIcon className="w-6 h-6" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-6">
          {/* AI Coach Insights */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-accent" /> Wellness Coach
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {aiSuggestion}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-surface-hover border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-widest">Most Active Mood</p>
                <p className="text-lg font-bold" style={{ color: theme.accent }}>{activeMood}</p>
                <p className="text-[10px] text-muted-foreground mt-2">You are most productive between 6 PM and 9 PM.</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5 text-muted-foreground" /> Reminder System
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Smart Interventions</p>
                  <p className="text-xs text-muted-foreground">AI prompts for breaks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={remindersEnabled} onChange={(e) => setRemindersEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">Intervention Frequency</p>
                <div className="grid grid-cols-2 gap-2">
                  {[15, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setReminderInterval(mins * 60000)}
                      disabled={!remindersEnabled}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        reminderInterval === mins * 60000 
                          ? 'bg-accent/10 border-accent text-accent' 
                          : 'bg-surface hover:bg-surface-hover border-border text-muted-foreground'
                      } ${!remindersEnabled && 'opacity-50 cursor-not-allowed'}`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
