import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from '../components/posts/PostCard';
import StoryRing from '../components/stories/StoryRing';
import StoryViewer from '../components/stories/StoryViewer';
import NeuralDiscoverySidebar from '../components/discovery/NeuralDiscoverySidebar';
import { postsAPI } from '../services/postsAPI';
import { storiesAPI } from '../services/storiesAPI';
import { reelsAPI } from '../services/reelsAPI';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import {
  BoltIcon,
  SparklesIcon,
  FireIcon,
  PlayIcon,
  UserPlusIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// ─── Mood Config ─────────────────────────────────────────────────────────────
const MOOD_CONFIG = {
  Productive: { emoji: '⚡', color: '#f59e0b', label: 'Productive', insight: 'Coding, startup & career content curated for you.' },
  Learning:   { emoji: '📚', color: '#6366f1', label: 'Learning',   insight: 'Tutorials and deep-dives surfaced from the community.' },
  Calm:       { emoji: '🌿', color: '#10b981', label: 'Calm',       insight: 'Nature, wellness and mindfulness posts selected.' },
  Motivational:{ emoji: '🔥', color: '#ef4444', label: 'Motivational', insight: 'Success stories and discipline content ranked first.' },
  Funny:      { emoji: '😂', color: '#f97316', label: 'Funny',      insight: 'Best memes and entertainment for a quick break.' },
  None:       { emoji: '✨', color: '#8b5cf6', label: 'General',    insight: 'Your personalised AI-ranked social feed.' },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const PostSkeleton = () => (
  <div className="bg-surface border border-border rounded-xl overflow-hidden">
    <div className="p-4 flex items-center gap-3 border-b border-border">
      <div className="w-10 h-10 rounded-lg skeleton shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-28 skeleton rounded" />
        <div className="h-2 w-16 skeleton rounded" />
      </div>
    </div>
    <div className="aspect-video w-full skeleton rounded-none" />
    <div className="p-4 space-y-2">
      <div className="h-3 w-3/4 skeleton rounded" />
      <div className="h-3 w-1/2 skeleton rounded" />
    </div>
  </div>
);

// ─── Reel Preview Card ────────────────────────────────────────────────────────
const ReelPreviewCard = ({ reel }) => (
  <Link to="/reels">
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative w-28 shrink-0 aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-10" />
      <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
        <PlayIcon className="w-8 h-8 text-white/40" />
      </div>
      <div className="absolute bottom-2 left-2 right-2 z-20">
        <p className="text-[10px] text-white/90 font-medium line-clamp-2 leading-tight">
          {reel.caption || 'Reel'}
        </p>
      </div>
      {reel.mood && (
        <div className="absolute top-2 left-2 z-20">
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[9px] font-bold text-white">
            {reel.mood}
          </span>
        </div>
      )}
      <div className="absolute inset-0 z-30 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <PlayIcon className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
    </motion.div>
  </Link>
);

// ─── Suggested Creator Card ────────────────────────────────────────────────────
const SuggestedCreator = ({ creator, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07 }}
    className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all group cursor-pointer"
  >
    <img
      src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.username}&background=6366f1&color=fff&size=80`}
      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-transparent group-hover:ring-accent/40 transition-all"
      alt={creator.username}
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <p className="text-sm font-semibold text-foreground truncate">@{creator.username}</p>
        <CheckBadgeIcon className="w-3.5 h-3.5 text-accent shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground truncate">{creator.fullName || 'Sentient Creator'}</p>
    </div>
    <button className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-all shrink-0">
      <UserPlusIcon className="w-4 h-4" />
    </button>
  </motion.div>
);

// ─── Main Home Component ──────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const { activeMood } = useMood();
  const isProductivityMode = user?.moodAnalytics?.burnoutIndex > 50;

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [reelPreviews, setReelPreviews] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserStories, setSelectedUserStories] = useState(null);

  const moodCfg = MOOD_CONFIG[activeMood] || MOOD_CONFIG['None'];

  useEffect(() => {
    loadInitialData();
  }, [activeMood, isProductivityMode]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setPosts([]);
      setPage(1);

      const [postsRes, storiesRes, reelsRes] = await Promise.allSettled([
        postsAPI.getFeedPosts(1, 10, activeMood, isProductivityMode),
        storiesAPI.getStories(activeMood),
        reelsAPI.getReels(6, activeMood, []),
      ]);

      if (postsRes.status === 'fulfilled') {
        const fetchedPosts = postsRes.value.data?.posts || [];
        setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
        setHasMore(postsRes.value.data?.hasMore || false);
      }
      if (storiesRes.status === 'fulfilled') {
        setStories(Array.isArray(storiesRes.value.data?.stories) ? storiesRes.value.data.stories : []);
      }
      if (reelsRes.status === 'fulfilled') {
        setReelPreviews(reelsRes.value.data?.reels?.slice(0, 6) || []);
      }

      // Mock suggested creators from existing user data
      setSuggestedUsers([
        { username: 'arya_dev', fullName: 'Arya Stark', avatar: null },
        { username: 'neural_ninja', fullName: 'Neural Ninja', avatar: null },
        { username: 'codewizard', fullName: 'Code Wizard', avatar: null },
      ]);
    } catch (error) {
      console.error('Home load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loading) return;
    try {
      const nextPage = page + 1;
      const response = await postsAPI.getFeedPosts(nextPage, 10, activeMood, isProductivityMode);
      const newPosts = Array.isArray(response.data?.posts) ? response.data.posts : [];
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(response.data?.hasMore || false);
      setPage(nextPage);
    } catch (error) {
      console.error('Load more error:', error);
    }
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">

      {/* ── Greeting + Mood Banner ─────────────────────────────────────────── */}
      <motion.div
        key={activeMood}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {getGreeting()}, <span className="text-accent">{user?.username || 'Creator'}</span>
        </h1>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{ borderColor: moodCfg.color + '40', background: moodCfg.color + '10' }}
        >
          <span className="text-xl">{moodCfg.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{moodCfg.label} Mode Active</p>
            <p className="text-xs text-muted-foreground">{moodCfg.insight}</p>
          </div>
          <div
            className="ml-auto w-2 h-2 rounded-full animate-pulse shrink-0"
            style={{ background: moodCfg.color }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Main Feed Column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Stories Row ─────────────────────────────────────────────────── */}
          <section className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BoltIcon className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold text-foreground">Active Stories</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                LIVE
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
              <AnimatePresence>
                {stories.map((userStory, idx) => (
                  <motion.div
                    key={userStory.user._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="snap-start shrink-0"
                  >
                    <StoryRing
                      user={userStory.user}
                      stories={userStory.stories}
                      onClick={() => setSelectedUserStories(userStory)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {stories.length === 0 && !loading && (
                <div className="flex items-center gap-3 py-2 text-muted-foreground">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs">Follow creators to see their stories here.</p>
                </div>
              )}
              {loading && [1, 2, 3, 4].map(i => (
                <div key={i} className="w-14 h-14 rounded-full skeleton shrink-0" />
              ))}
            </div>
          </section>

          {/* 2. Reel Previews ────────────────────────────────────────────────── */}
          {(reelPreviews.length > 0 || loading) && (
            <section className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PlayIcon className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-semibold text-foreground">Reels For You</h2>
                </div>
                <Link to="/reels" className="flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
                  Watch all <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {loading
                  ? [1, 2, 3, 4].map(i => <div key={i} className="w-28 aspect-[9/16] rounded-xl skeleton shrink-0" />)
                  : reelPreviews.map(reel => <ReelPreviewCard key={reel._id} reel={reel} />)
                }
              </div>
            </section>
          )}

          {/* 3. Suggested Creators (mobile only — desktop in sidebar) ──────────── */}
          {suggestedUsers.length > 0 && (
            <section className="lg:hidden bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold text-foreground">Suggested Creators</h2>
              </div>
              <div className="space-y-2">
                {suggestedUsers.map((c, i) => <SuggestedCreator key={c.username} creator={c} index={i} />)}
              </div>
            </section>
          )}

          {/* 4. Mood Feed Posts ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FireIcon className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">
                {moodCfg.label} Feed
              </h2>
              <span className="text-xs text-muted-foreground">· AI-ranked</span>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
              </div>
            ) : (
              <InfiniteScroll
                dataLength={posts.length}
                next={loadMorePosts}
                hasMore={hasMore}
                loader={
                  <div className="py-6 flex justify-center">
                    <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  </div>
                }
                endMessage={
                  <div className="py-10 text-center">
                    <div className="h-px bg-border w-12 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground">You're all caught up.</p>
                  </div>
                }
                scrollThreshold={0.8}
                className="space-y-6 overflow-hidden"
              >
                {posts.map((post, idx) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx < 3 ? idx * 0.08 : 0 }}
                  >
                    <PostCard
                      post={post}
                      onUpdate={handleUpdatePost}
                      onDelete={handleDeletePost}
                    />
                  </motion.div>
                ))}

                {posts.length === 0 && (
                  <NoContentFallback mood={moodCfg} onRefresh={loadInitialData} />
                )}
              </InfiniteScroll>
            )}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-20 space-y-5">

            {/* Suggested Creators */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold text-foreground">Suggested for You</h2>
              </div>
              <div className="space-y-2">
                {suggestedUsers.map((c, i) => <SuggestedCreator key={c.username} creator={c} index={i} />)}
              </div>
            </div>

            <NeuralDiscoverySidebar />
          </div>
        </div>
      </div>

      {/* Story Viewer Overlay */}
      {selectedUserStories && (
        <StoryViewer
          user={selectedUserStories.user}
          stories={selectedUserStories.stories}
          onClose={() => setSelectedUserStories(null)}
        />
      )}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const NoContentFallback = ({ mood, onRefresh }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="py-16 text-center flex flex-col items-center gap-4"
  >
    <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-3xl">
      {mood.emoji}
    </div>
    <div>
      <h3 className="text-base font-semibold text-foreground mb-1">Loading {mood.label} content…</h3>
      <p className="text-xs text-muted-foreground max-w-xs">
        The AI is curating your personalised feed. Try refreshing or switching your mood.
      </p>
    </div>
    <button
      onClick={onRefresh}
      className="mt-2 px-5 py-2 text-xs font-semibold rounded-xl bg-accent text-white hover:bg-accent/80 transition-all"
    >
      Refresh Feed
    </button>
  </motion.div>
);

export default Home;