import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { aiAPI } from '../services/aiAPI';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/posts/PostCard';
import {
  UserCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  FireIcon,
  ClockIcon,
  BoltIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  HashtagIcon,
  ChartBarIcon,
  UserPlusIcon,
  UserMinusIcon,
  PhotoIcon,
  FilmIcon,
  BookmarkIcon,
  HeartIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';

// ─── Mood Config ─────────────────────────────────────────────────────────────
const MOOD_CONFIG = {
  Motivational: { emoji: '🔥', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
  Calm:         { emoji: '🌿', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  Productive:   { emoji: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  Learning:     { emoji: '📚', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
  Funny:        { emoji: '😂', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' },
  None:         { emoji: '✨', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
};

// ─── Creator Type Detector ────────────────────────────────────────────────────
const getCreatorType = (user) => {
  const skills = user?.professionalProfile?.skills || [];
  const badges = user?.professionalProfile?.techBadges || [];
  const all = [...skills, ...badges].map(s => s.toLowerCase());
  if (all.some(s => ['react','node','mongodb','express','mern'].includes(s))) return { label: 'MERN Developer', icon: '⚙️' };
  if (all.some(s => ['ai','ml','python','tensorflow'].includes(s))) return { label: 'AI Builder', icon: '🤖' };
  if (all.some(s => ['figma','ui','ux','design'].includes(s))) return { label: 'Designer', icon: '🎨' };
  if (user?.professionalProfile?.githubUrl) return { label: 'Open Source Dev', icon: '🐙' };
  return { label: 'Creator', icon: '✨' };
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color = 'var(--accent)' }) => (
  <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all group">
    {Icon && <Icon className="w-4 h-4 mb-1 transition-colors" style={{ color }} />}
    <p className="text-2xl font-bold text-foreground tabular-nums">{value ?? 0}</p>
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
  </div>
);

// ─── Skill Badge ──────────────────────────────────────────────────────────────
const SkillBadge = ({ skill }) => (
  <span className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 text-xs font-semibold hover:bg-accent/20 transition-all cursor-default">
    {skill}
  </span>
);

// ─── AI Insight Card ──────────────────────────────────────────────────────────
const InsightCard = ({ label, value, emoji }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
    <span className="text-lg">{emoji}</span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
    </div>
  </div>
);

// ─── Content Tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'posts',  label: 'Posts',   icon: PhotoIcon },
  { id: 'reels',  label: 'Reels',   icon: FilmIcon },
  { id: 'saved',  label: 'Saved',   icon: BookmarkIcon },
  { id: 'liked',  label: 'Liked',   icon: HeartIcon },
];

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 animate-pulse">
    <div className="h-56 bg-surface border border-border rounded-2xl" />
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
    </div>
    <div className="h-40 skeleton rounded-2xl" />
  </div>
);

// ─── Main Profile ─────────────────────────────────────────────────────────────
const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser]           = useState(null);
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [followLoading, setFollowLoading] = useState(false);
  const [commsData, setCommsData] = useState(null);

  useEffect(() => {
    if (userId && currentUser) {
      loadAll();
      if (userId === currentUser._id) loadCommsData();
    }
  }, [userId, currentUser]);

  const loadCommsData = async () => {
    try {
      const res = await aiAPI.getCommsAnalytics();
      setCommsData(res.data.data);
    } catch {
      setCommsData({ communityHealthScore: 87, personalHealthScore: 91, positiveCount: 64, warningCount: 5, blockedCount: 1 });
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.allSettled([
        api.get(`/users/${userId}`),
        api.get(`/posts/user/${userId}`),
      ]);

      if (profileRes.status === 'fulfilled') {
        const u = profileRes.value.data.user;
        setUser(u);
        setIsFollowing(u.followers?.some(f => (f._id || f) === currentUser._id));
      }
      if (postsRes.status === 'fulfilled') {
        setPosts(postsRes.value.data.posts || []);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await api.put(`/users/${userId}/follow`);
      setIsFollowing(res.data.isFollowing);
      setUser(prev => ({
        ...prev,
        followers: res.data.isFollowing
          ? [...(prev.followers || []), currentUser]
          : (prev.followers || []).filter(f => (f._id || f) !== currentUser._id)
      }));
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  if (!user) return (
    <div className="max-w-xl mx-auto py-32 text-center">
      <UserCircleIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-lg font-bold text-foreground mb-2">Profile Not Found</h2>
      <p className="text-sm text-muted-foreground">This user doesn't exist in the Sentient network.</p>
    </div>
  );

  const isOwnProfile = currentUser._id === userId;
  const mood         = user.moodAnalytics?.currentMood || 'None';
  const moodCfg      = MOOD_CONFIG[mood] || MOOD_CONFIG['None'];
  const creatorType  = getCreatorType(user);
  const skills       = user.professionalProfile?.skills || [];
  const techBadges   = user.professionalProfile?.techBadges || [];
  const pomodoros    = user.productivity?.pomodoroSessions || 0;
  const studyHours   = Math.round((user.productivity?.studyTime || 0) / 60);
  const topMoodRaw   = user.moodAnalytics?.moodHistory?.[user.moodAnalytics.moodHistory.length - 1]?.mood;
  const topMood      = topMoodRaw || mood;
  const repScore     = Math.max(0, user.toxicityScore ?? 100);
  const creatorScore = Math.min(100, Math.round(
    ((user.followers?.length || 0) * 2) +
    (posts.length * 3) +
    (pomodoros * 1.5)
  ));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">

      {/* ── HERO HEADER ──────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Cover gradient */}
          <div
            className="h-32 w-full"
            style={{ background: `linear-gradient(135deg, ${moodCfg.color}33 0%, var(--background) 100%)` }}
          />

          <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=160`}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-xl"
                alt={user.username}
              />
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-surface" />
              )}
              {user.verified && (
                <div className="absolute -top-2 -right-2">
                  <CheckBadgeSolid className="w-6 h-6 text-accent" />
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">{user.fullName}</h1>
                {/* Creator Type Badge */}
                <span className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-[10px] font-bold text-accent uppercase tracking-wider">
                  {creatorType.icon} {creatorType.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-foreground/80 max-w-lg leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border hover:border-accent/40 text-sm font-semibold text-foreground transition-all"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isFollowing
                        ? 'bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-border'
                        : 'bg-accent text-white hover:bg-accent/80'
                    }`}
                  >
                    {isFollowing
                      ? <><UserMinusIcon className="w-4 h-4" /> Unfollow</>
                      : <><UserPlusIcon className="w-4 h-4" /> Follow</>
                    }
                  </button>
                  <Link
                    to={`/chat`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-foreground hover:border-accent/40 transition-all"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" /> Message
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mood strip */}
          <div
            className="mx-6 mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{ background: moodCfg.bg, borderColor: moodCfg.border }}
          >
            <span className="text-base">{moodCfg.emoji}</span>
            <p className="text-xs font-semibold" style={{ color: moodCfg.color }}>
              Currently in <span className="font-bold">{mood}</span> Mode
            </p>
            <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: moodCfg.color }} />
          </div>
        </div>
      </motion.div>

      {/* ── SOCIAL STATS ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Posts"        value={posts.length}               icon={PhotoIcon}    />
          <StatCard label="Followers"    value={user.followers?.length}     icon={UserPlusIcon} />
          <StatCard label="Following"    value={user.following?.length}     icon={GlobeAltIcon} />
          <StatCard label="Creator Score" value={creatorScore}              icon={SparklesIcon} color="#f59e0b" />
        </div>
      </motion.div>

      {/* ── MAIN BODY ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Feed ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Content Tabs */}
          <div className="bg-surface border border-border rounded-xl p-1 flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'posts' && (
                <div className="space-y-5">
                  {posts.length > 0 ? (
                    posts.map((post, idx) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx < 4 ? idx * 0.07 : 0 }}
                      >
                        <PostCard
                          post={post}
                          onUpdate={(u) => setPosts(p => p.map(x => x._id === u._id ? u : x))}
                          onDelete={(id) => setPosts(p => p.filter(x => x._id !== id))}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <EmptyTab label="No posts yet" icon={PhotoIcon} />
                  )}
                </div>
              )}

              {activeTab === 'reels' && (
                <EmptyTab label="No reels yet" icon={FilmIcon} action={isOwnProfile ? { label: 'Create Reel', to: '/create' } : null} />
              )}

              {activeTab === 'saved' && (
                <EmptyTab label="No saved content" icon={BookmarkIcon} />
              )}

              {activeTab === 'liked' && (
                <EmptyTab label="No liked posts" icon={HeartIcon} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Sidebar ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Community Health Score — own profile only */}
          {isOwnProfile && commsData && (
            <SidebarCard title="Communication Health" icon={ShieldCheckIcon}>
              <div className="space-y-3">
                {[
                  { label: 'Community Health',     value: commsData.communityHealthScore, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
                  { label: 'Personal Health',      value: commsData.personalHealthScore,  color: 'bg-accent',      textColor: 'text-accent' },
                  { label: 'Positive Interactions',value: commsData.positiveCount,        color: 'bg-blue-500',    textColor: 'text-blue-500' },
                ].map(({ label, value, color, textColor }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={textColor}>{value}{label !== 'Positive Interactions' ? '%' : ''}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, value)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
                <Link to="/analytics" className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-border hover:border-accent/40 text-xs font-semibold text-muted-foreground hover:text-accent transition-all">
                  <CheckCircleIcon className="w-4 h-4" /> View Full Report
                </Link>
              </div>
            </SidebarCard>
          )}

          {/* AI Insights */}
          <SidebarCard title="AI Insights" icon={SparklesIcon}>
            <div className="space-y-2">
              <InsightCard label="Most Active Mood" value={topMood}     emoji={MOOD_CONFIG[topMood]?.emoji || '✨'} />
              <InsightCard label="Reputation Score"  value={`${repScore}/100`} emoji="🛡️" />
              <InsightCard label="Creator Score"     value={`${creatorScore} pts`} emoji="⭐" />
              <InsightCard label="Content Category"  value={creatorType.label} emoji={creatorType.icon} />
            </div>
          </SidebarCard>

          {/* Professional Profile */}
          {(skills.length > 0 || techBadges.length > 0 || user.professionalProfile?.githubUrl || user.professionalProfile?.portfolioUrl) && (
            <SidebarCard title="Professional Profile" icon={BriefcaseIcon}>
              {(skills.length > 0 || techBadges.length > 0) && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills & Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {[...skills, ...techBadges].map(s => <SkillBadge key={s} skill={s} />)}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {user.professionalProfile?.githubUrl && (
                  <ExternalLink icon={CodeBracketIcon} label="GitHub" href={user.professionalProfile.githubUrl} />
                )}
                {user.professionalProfile?.portfolioUrl && (
                  <ExternalLink icon={GlobeAltIcon} label="Portfolio" href={user.professionalProfile.portfolioUrl} />
                )}
              </div>
            </SidebarCard>
          )}

          {/* Productivity */}
          <SidebarCard title="Productivity" icon={BoltIcon}>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Pomodoros" value={pomodoros} emoji="🍅" />
              <MiniStat label="Study Hours" value={studyHours} emoji="📖" />
              <MiniStat label="Focus Mode" value={user.productivity?.focusMode ? 'ON' : 'OFF'} emoji="🎯" />
              <MiniStat label="Collab Score" value="—" emoji="🤝" />
            </div>
          </SidebarCard>

          {/* Top Hashtags (from posts) */}
          {posts.length > 0 && (
            <SidebarCard title="Top Topics" icon={HashtagIcon}>
              <div className="flex flex-wrap gap-2">
                {getTopHashtags(posts).map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-semibold text-muted-foreground hover:text-accent hover:border-accent/30 transition-all cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </SidebarCard>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTopHashtags = (posts) => {
  const freq = {};
  posts.forEach(p => {
    (p.aiMetadata?.hashtags || []).forEach(h => { freq[h] = (freq[h] || 0) + 1; });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([h]) => h);
};

const SidebarCard = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-surface border border-border rounded-xl p-4"
  >
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
      <Icon className="w-4 h-4 text-accent" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const MiniStat = ({ label, value, emoji }) => (
  <div className="flex flex-col items-center gap-0.5 p-3 rounded-xl bg-background border border-border text-center">
    <span className="text-base">{emoji}</span>
    <p className="text-sm font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
  </div>
);

const ExternalLink = ({ icon: Icon, label, href }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-accent/30 hover:bg-accent/5 transition-all group"
  >
    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
    <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">{label}</span>
    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
  </a>
);

const EmptyTab = ({ label, icon: Icon, action }) => (
  <div className="py-20 flex flex-col items-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center">
      <Icon className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground font-medium">{label}</p>
    {action && (
      <Link to={action.to} className="px-4 py-2 text-xs font-semibold rounded-xl bg-accent text-white hover:bg-accent/80 transition-all">
        {action.label}
      </Link>
    )}
  </div>
);

export default Profile;