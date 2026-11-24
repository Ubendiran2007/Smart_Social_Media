import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '../context/GamificationContext';
import { useMood } from '../context/MoodContext';
import { useAuth } from '../context/AuthContext';
import {
  TrophyIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// ─── Level Title Config ────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
  'New Explorer':      { color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', emoji: '🌱' },
  'Active Creator':    { color: '#22d3ee', glow: 'rgba(34,211,238,0.3)',  emoji: '🚀' },
  'Community Builder': { color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', emoji: '🏗️' },
  'Thought Leader':    { color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  emoji: '🧠' },
  'Sentient Master':   { color: '#f43f5e', glow: 'rgba(244,63,94,0.3)',   emoji: '👑' }
};

// ─── XP Progress Ring ──────────────────────────────────────────────────────────

const XPRing = ({ xp, nextLevelXp, level, title }) => {
  const progress = nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0;
  const cfg = LEVEL_CONFIG[title] || LEVEL_CONFIG['New Explorer'];
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="transform -rotate-90">
        <circle cx="90" cy="90" r="70" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
        <motion.circle
          cx="90" cy="90" r="70" fill="none"
          stroke={cfg.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl mb-1">{cfg.emoji}</span>
        <span className="text-2xl font-black text-foreground">{level}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
      </div>
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color = 'accent' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-accent/30 transition-all"
  >
    <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center shrink-0`}
      style={{ backgroundColor: `var(--color-${color}, rgba(139,92,246,0.1))` }}
    >
      <Icon className="w-5 h-5" style={{ color: `var(--color-${color}, #8b5cf6)` }} />
    </div>
    <div>
      <p className="text-lg font-black text-foreground">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  </motion.div>
);

// ─── Achievement Card ──────────────────────────────────────────────────────────

const AchievementCard = ({ achievement, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.08 }}
    className="bg-surface border border-border rounded-xl p-4 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all group"
  >
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
        {achievement.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-foreground truncate">{achievement.name}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{achievement.description}</p>
        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">
          {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  </motion.div>
);

// ─── Badge Card ────────────────────────────────────────────────────────────────

const BADGE_COLORS = {
  Wellness: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', text: '#22c55e' },
  Collaboration: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', text: '#3b82f6' },
  Activity: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  Learning: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#8b5cf6' },
  Productivity: { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)', text: '#ec4899' }
};

const BadgeCard = ({ badge, index }) => {
  const colors = BADGE_COLORS[badge.category] || BADGE_COLORS.Activity;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="bg-surface border rounded-xl p-4 hover:shadow-lg transition-all group"
      style={{ borderColor: colors.border }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        >
          {badge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-foreground truncate">{badge.name}</h4>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
            >
              {badge.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Leaderboard Tab ───────────────────────────────────────────────────────────

const LEADERBOARD_TABS = [
  { key: 'learners',      label: 'Top Learners',      icon: AcademicCapIcon,     statLabel: 'Reels Learned' },
  { key: 'contributors',  label: 'Top Contributors',  icon: SparklesIcon,        statLabel: 'Posts Created' },
  { key: 'collaborators', label: 'Top Collaborators',  icon: UserGroupIcon,       statLabel: 'Rooms Joined' },
  { key: 'creators',      label: 'Top Creators',       icon: StarIcon,            statLabel: 'Level' }
];

const LeaderboardPanel = ({ leaderboards }) => {
  const [activeTab, setActiveTab] = useState('learners');
  const currentTab = LEADERBOARD_TABS.find(t => t.key === activeTab);
  const data = leaderboards?.[activeTab] || [];

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Tab headers */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
        {LEADERBOARD_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[120px] px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard entries */}
      <div className="p-4 space-y-2">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No data yet. Start contributing to claim your spot!</p>
          </div>
        ) : (
          data.map((entry, i) => (
            <motion.div
              key={entry.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors"
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                i === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
                i === 1 ? 'bg-slate-300/10 text-slate-400 border border-slate-400/30' :
                i === 2 ? 'bg-orange-600/10 text-orange-500 border border-orange-500/30' :
                'bg-surface-hover text-muted-foreground border border-border'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>

              {/* Avatar */}
              <img
                src={entry.avatar || `https://ui-avatars.com/api/?name=${entry.username}&background=27272a&color=fff`}
                alt=""
                className="w-9 h-9 rounded-xl border border-border object-cover shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">@{entry.username}</p>
                <p className="text-[10px] text-muted-foreground truncate">{entry.fullName}</p>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-accent">
                  {activeTab === 'creators' ? `Lvl ${entry.level}` : entry.score}
                </p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{currentTab.statLabel}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── AI Insights Card ──────────────────────────────────────────────────────────

const AIInsightsCard = ({ insights }) => {
  if (!insights || insights.length === 0) return null;
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Sentient AI Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-surface-hover/50 border border-border"
          >
            <LightBulbIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Streak Display ────────────────────────────────────────────────────────────

const StreakDisplay = ({ streaks }) => {
  if (!streaks) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-surface border border-border rounded-xl p-4 text-center group hover:border-orange-500/30 transition-all">
        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          🔥
        </div>
        <p className="text-2xl font-black text-foreground">{streaks.learning || 0}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Learning Streak</p>
      </div>
      <div className="bg-surface border border-border rounded-xl p-4 text-center group hover:border-emerald-500/30 transition-all">
        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          ⚡
        </div>
        <p className="text-2xl font-black text-foreground">{streaks.focus || 0}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Focus Streak</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ACHIEVEMENTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const Achievements = () => {
  const { profile, leaderboards, loading } = useGamification();
  const { theme } = useMood();
  const { user } = useAuth();

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-accent border-border animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Achievement Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* ─── Hero / Level Card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl p-8 relative overflow-hidden"
      >
        {/* Subtle background gradient */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${LEVEL_CONFIG[profile.title]?.color || '#8b5cf6'}, transparent 70%)` }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          {/* XP Ring */}
          <XPRing xp={profile.xp} nextLevelXp={profile.nextLevelXp} level={profile.level} title={profile.title} />

          {/* Level Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {user?.fullName || user?.username}
              </h1>
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                style={{
                  color: LEVEL_CONFIG[profile.title]?.color,
                  borderColor: LEVEL_CONFIG[profile.title]?.glow,
                  backgroundColor: `${LEVEL_CONFIG[profile.title]?.color}15`
                }}
              >
                {profile.title}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-bold text-foreground">{profile.xp}</span> / {profile.nextLevelXp} XP to Level {profile.level + 1}
            </p>

            {/* XP Bar */}
            <div className="w-full max-w-md mx-auto lg:mx-0 h-3 bg-surface-hover rounded-full border border-border overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${LEVEL_CONFIG[profile.title]?.color || '#8b5cf6'}, ${LEVEL_CONFIG[profile.title]?.color || '#8b5cf6'}aa)`,
                  boxShadow: `0 0 12px ${LEVEL_CONFIG[profile.title]?.glow || 'rgba(139,92,246,0.3)'}`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((profile.xp / profile.nextLevelXp) * 100, 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>

            {/* Level Milestone Dots */}
            <div className="flex items-center gap-3 mt-5 justify-center lg:justify-start">
              {[1, 5, 10, 20, 50].map(lvl => (
                <div key={lvl} className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                    profile.level >= lvl
                      ? 'border-accent bg-accent shadow-[0_0_8px_rgba(139,92,246,0.4)]'
                      : 'border-border bg-surface-hover'
                  }`} />
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold">{lvl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={SparklesIcon} label="Posts Created" value={profile.stats?.postsCreated || 0} />
        <StatCard icon={BoltIcon} label="Focus Sessions" value={profile.stats?.focusSessionsCompleted || 0} />
        <StatCard icon={UserGroupIcon} label="Rooms Joined" value={profile.stats?.roomsJoined || 0} />
        <StatCard icon={ShieldCheckIcon} label="Positive Comments" value={profile.stats?.positiveCommentsCount || 0} />
        <StatCard icon={AcademicCapIcon} label="Edu Reels Watched" value={profile.stats?.educationalReelsWatched || 0} />
      </div>

      {/* ─── Two-Column Layout ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Achievements Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrophyIcon className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Achievements</h2>
              <span className="ml-auto text-xs font-bold text-muted-foreground bg-surface-hover border border-border px-2 py-0.5 rounded-lg">
                {profile.achievements?.length || 0} Unlocked
              </span>
            </div>
            {profile.achievements?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.achievements.map((ach, i) => (
                  <AchievementCard key={ach.id} achievement={ach} index={i} />
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <TrophyIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">No achievements unlocked yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Keep learning, creating, and collaborating to unlock achievements!</p>
              </div>
            )}
          </div>

          {/* Badges Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Badges</h2>
              <span className="ml-auto text-xs font-bold text-muted-foreground bg-surface-hover border border-border px-2 py-0.5 rounded-lg">
                {profile.badges?.length || 0} Earned
              </span>
            </div>
            {profile.badges?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.badges.map((badge, i) => (
                  <BadgeCard key={badge.id} badge={badge} index={i} />
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <ShieldCheckIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">No badges earned yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Complete focus sessions, maintain low burnout, and collaborate to earn badges!</p>
              </div>
            )}
          </div>

          {/* Leaderboards */}
          {leaderboards && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Leaderboards</h2>
              </div>
              <LeaderboardPanel leaderboards={leaderboards} />
            </div>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Streaks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FireIcon className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Streaks</h2>
            </div>
            <StreakDisplay streaks={profile.streaks} />
          </div>

          {/* AI Insights */}
          <AIInsightsCard insights={profile.aiInsights} />

          {/* Quick Level Reference */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowTrendingUpIcon className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Level Milestones</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { lvl: 1, title: 'New Explorer', emoji: '🌱' },
                { lvl: 5, title: 'Active Creator', emoji: '🚀' },
                { lvl: 10, title: 'Community Builder', emoji: '🏗️' },
                { lvl: 20, title: 'Thought Leader', emoji: '🧠' },
                { lvl: 50, title: 'Sentient Master', emoji: '👑' }
              ].map(m => (
                <div key={m.lvl} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                  profile.level >= m.lvl ? 'bg-accent/5 border border-accent/20' : 'border border-transparent'
                }`}>
                  <span className="text-lg">{m.emoji}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${profile.level >= m.lvl ? 'text-accent' : 'text-muted-foreground'}`}>
                      Level {m.lvl}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{m.title}</p>
                  </div>
                  {profile.level >= m.lvl && (
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-[10px]">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
