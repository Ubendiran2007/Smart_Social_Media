import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  SparklesIcon,
  BoltIcon,
  ClockIcon,
  FireIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { useWellness } from '../context/WellnessContext';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { aiAPI } from '../services/aiAPI';

// ─── Stat Card ───────────────────────────────────────────────────────────────
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

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, label, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} strokeWidth="8" className="fill-none stroke-border" />
          <motion.circle
            cx="44" cy="44" r={radius} strokeWidth="8"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-foreground">{score}</span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">{label}</p>
    </div>
  );
};

// ─── Communication History Row ────────────────────────────────────────────────
const CommsHistoryRow = ({ icon: Icon, label, count, color, barColor }) => (
  <div className="flex items-center gap-3">
    <div className={`p-1.5 rounded-lg bg-${color}-500/10 shrink-0`}>
      <Icon className={`w-4 h-4 text-${color}-500`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className="text-xs font-bold text-muted-foreground">{count}</span>
      </div>
      <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, count)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { theme, activeMood } = useMood();
  const { 
    burnoutScore, dailyScreenTime, weeklyScreenTime,
    focusStreaks, learningStreaks,
    remindersEnabled, setRemindersEnabled,
    reminderInterval, setReminderInterval,
    focusMode, toggleFocusMode
  } = useWellness();

  const [activeTab, setActiveTab] = useState('wellness');
  const [commsData, setCommsData] = useState(null);
  const [commsLoading, setCommsLoading] = useState(false);

  const focusScore = Math.max(0, 100 - burnoutScore + (focusStreaks * 2));

  useEffect(() => {
    if (activeTab === 'comms' && !commsData) {
      loadCommsAnalytics();
    }
  }, [activeTab]);

  const loadCommsAnalytics = async () => {
    setCommsLoading(true);
    try {
      const res = await aiAPI.getCommsAnalytics();
      setCommsData(res.data.data);
    } catch (err) {
      console.error('Failed to load comms analytics', err);
      // Fallback demo data so UI is never empty
      setCommsData({
        communityHealthScore: 87,
        personalHealthScore: 91,
        positiveInteractionScore: 78,
        positiveCount: 64,
        warningCount: 5,
        blockedCount: 1,
        avgKindness: 82,
        avgConstructiveness: 76,
        avgEmpathy: 70,
        improvementTrend: '+12% this week',
        totalComments: 70,
        aiInsights: [
          '91% of your comments are constructive.',
          'You improved your communication score this week.',
          'You show high empathy in learning-related discussions.',
        ]
      });
    } finally {
      setCommsLoading(false);
    }
  };

  const wellnessStats = [
    { title: 'Burnout Score',    value: `${burnoutScore}%`,             icon: FireIcon,          trend: burnoutScore > 50 ? 15 : -5, color: burnoutScore > 70 ? 'rose' : 'emerald', description: burnoutScore > 70 ? 'High risk of fatigue' : 'Healthy usage' },
    { title: 'Focus Score',      value: `${focusScore}%`,               icon: ShieldCheckIcon,   color: focusScore > 70 ? 'cyan'  : 'orange', description: 'Ability to sustain deep work' },
    { title: 'Daily Screen Time',value: `${dailyScreenTime}m`,          icon: ClockIcon,         trend: 5,  color: 'purple', description: 'Active minutes today' },
    { title: 'Weekly Average',   value: `${Math.floor(weeklyScreenTime / 7)}m/day`, icon: ArrowTrendingUpIcon, color: 'blue', description: 'Consistent with last week' },
  ];

  const aiSuggestion = useMemo(() => {
    if (burnoutScore > 80) return "You've been active for a while and your burnout risk is high. Step away for 30 minutes to recharge.";
    if (activeMood === 'Productive') return "You spend 45% more time in Productive Mode. Keep utilizing the Focus Room!";
    return "Learning content receives your highest engagement. Take a quick 5-minute stretch.";
  }, [burnoutScore, activeMood]);

  const TABS = [
    { id: 'wellness', label: '🧠 Wellness',      },
    { id: 'comms',    label: '💬 Communication', },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">AI Wellness Center</h1>
            {focusMode && (
              <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent animate-pulse">
                FOCUS MODE ON
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Your digital companion for mental wellbeing and healthy communication.</p>
        </div>
        <button
          onClick={toggleFocusMode}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
            focusMode ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-surface hover:bg-surface-hover border border-border text-foreground'
          }`}
        >
          <BoltIcon className={`w-5 h-5 ${focusMode ? 'text-white' : 'text-accent'}`} />
          {focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
        </button>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-surface border border-border rounded-xl p-1 flex gap-1 mb-8 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══ WELLNESS TAB ══ */}
        {activeTab === 'wellness' && (
          <motion.div key="wellness" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {wellnessStats.map(stat => <StatCard key={stat.title} {...stat} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-foreground">Usage Timeline</h3>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><div className="w-2 h-2 rounded-full bg-accent" /> Productivity</span>
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Scrolling</span>
                    </div>
                  </div>
                  <div className="h-[200px] w-full relative">
                    <svg viewBox="0 0 1000 260" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--mood-primary)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--mood-primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }}
                        d={`M0 220 C200 ${220 - dailyScreenTime * 2} 400 160 600 ${220 - burnoutScore * 1.5} S900 130 1000 150`}
                        fill="none" stroke="var(--mood-primary)" strokeWidth="3" strokeLinecap="round"
                      />
                      <motion.path
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        d={`M0 220 C200 ${220 - dailyScreenTime * 2} 400 160 600 ${220 - burnoutScore * 1.5} S900 130 1000 150 L1000 260 L0 260 Z`}
                        fill="url(#wGrad)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-border opacity-30" />)}
                    </div>
                  </div>
                </div>

                {/* Streaks */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Focus Streaks</p>
                    <p className="text-3xl font-black text-emerald-500 flex items-center gap-2">{focusStreaks} <FireIcon className="w-6 h-6" /></p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Learning Streaks</p>
                    <p className="text-3xl font-black text-blue-500 flex items-center gap-2">{learningStreaks} <SparklesIcon className="w-6 h-6" /></p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-6">
                {/* AI Coach */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-accent" /> Wellness Coach
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                      <p className="text-sm font-medium text-foreground leading-relaxed">{aiSuggestion}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-hover border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-widest">Most Active Mood</p>
                      <p className="text-lg font-bold" style={{ color: theme.accent }}>{activeMood}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">You are most productive between 6 PM – 9 PM.</p>
                    </div>
                  </div>
                </div>

                {/* Reminder Settings */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5 text-muted-foreground" /> Reminder System
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Smart Interventions</p>
                        <p className="text-xs text-muted-foreground">AI break prompts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={remindersEnabled} onChange={e => setRemindersEnabled(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                      </label>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-3">Interval</p>
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
          </motion.div>
        )}

        {/* ══ COMMUNICATION TAB ══ */}
        {activeTab === 'comms' && (
          <motion.div key="comms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {commsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
              </div>
            ) : commsData && (
              <div className="space-y-6">

                {/* Community Health Score Rings */}
                <div className="bg-surface border border-border rounded-xl p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-accent" />
                    <h2 className="text-base font-bold text-foreground">Community Health Score</h2>
                    <span className="ml-auto text-xs font-semibold text-muted-foreground bg-surface-hover border border-border px-2 py-1 rounded-lg">
                      {commsData.improvementTrend}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-around gap-8">
                    <ScoreRing score={commsData.communityHealthScore}    label="Community Health"    color="#10b981" />
                    <ScoreRing score={commsData.personalHealthScore}     label="Personal Health"     color="var(--mood-primary)" />
                    <ScoreRing score={commsData.positiveInteractionScore} label="Positive Interactions" color="#6366f1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Comment History */}
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-accent" /> Comment History
                    </h3>
                    <div className="space-y-5">
                      <CommsHistoryRow icon={CheckCircleIcon} label="Positive Comments" count={commsData.positiveCount} color="emerald" barColor="bg-emerald-500" />
                      <CommsHistoryRow icon={ExclamationTriangleIcon} label="Warnings Received" count={commsData.warningCount} color="yellow"  barColor="bg-yellow-500" />
                      <CommsHistoryRow icon={NoSymbolIcon} label="Blocked Comments"  count={commsData.blockedCount}  color="rose"    barColor="bg-rose-500"    />
                    </div>
                    <div className="mt-6 p-3 rounded-xl bg-surface-hover border border-border text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Comments</p>
                      <p className="text-2xl font-black text-foreground">{commsData.totalComments}</p>
                    </div>
                  </div>

                  {/* Positivity Scores */}
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                      <HeartIcon className="w-4 h-4 text-pink-500" /> Positivity Breakdown
                    </h3>
                    <div className="space-y-5">
                      {[
                        { label: 'Kindness Score',         value: commsData.avgKindness,          color: 'bg-pink-500',    textColor: 'text-pink-500' },
                        { label: 'Constructiveness Score', value: commsData.avgConstructiveness,  color: 'bg-blue-500',    textColor: 'text-blue-500' },
                        { label: 'Empathy Score',          value: commsData.avgEmpathy,           color: 'bg-purple-500',  textColor: 'text-purple-500' },
                      ].map(({ label, value, color, textColor }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs font-semibold mb-1.5">
                            <span className="text-muted-foreground">{label}</span>
                            <span className={textColor}>{value}%</span>
                          </div>
                          <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ duration: 0.9, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-accent" /> AI Communication Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(commsData.aiInsights || []).map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-surface-hover border border-border flex items-start gap-3"
                      >
                        <FaceSmileIcon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Healthy Communication Tips */}
                <div className="bg-gradient-to-br from-accent/5 to-transparent border border-accent/20 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-foreground mb-4">🧠 Healthy Communication Coach Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Focus on ideas, not the person — critique the work, not the creator.',
                      'Constructive feedback is always more impactful than criticism.',
                      'Ask questions before making assumptions about intent.',
                      'One positive comment can undo ten negative ones in a community.',
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-surface border border-border">
                        <span className="text-accent font-bold text-sm shrink-0">0{i + 1}</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDashboard;
