import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { hashtagAPI } from '../services/hashtagAPI';
import { HashtagPill } from '../components/hashtags/HashtagIntelligencePanel';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';
import {
  HashtagIcon, FireIcon, SparklesIcon,
  FilmIcon, PhotoIcon, ArrowLeftIcon,
  UserGroupIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

const TABS = [
  { id: 'posts', label: 'Posts', icon: PhotoIcon },
  { id: 'reels', label: 'Reels', icon: FilmIcon },
  { id: 'stories', label: 'Stories', icon: SparklesIcon },
];

const HashtagFeed = () => {
  const { tag } = useParams();
  const navigate = useNavigate();
  const cleanTag = decodeURIComponent(tag || '').replace('#', '');

  const [data, setData] = useState({ posts: [], reels: [], stories: [], totalPosts: 0 });
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = useCallback(async (tag, pg = 1) => {
    try {
      if (pg === 1) setLoading(true);
      else setLoadingMore(true);

      const [feedRes, trendRes] = await Promise.all([
        hashtagAPI.getFeed(tag, pg, 20),
        hashtagAPI.getTrending('None', 12),
      ]);

      const feed = feedRes.data;
      if (pg === 1) {
        setData({ posts: feed.posts || [], reels: feed.reels || [], stories: feed.stories || [], totalPosts: feed.totalPosts || 0 });
      } else {
        setData(prev => ({ ...prev, posts: [...prev.posts, ...(feed.posts || [])] }));
      }
      setHasMore(feed.hasMore || false);
      setTrending(trendRes.data.trending || []);
    } catch (err) {
      console.error('HashtagFeed error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setData({ posts: [], reels: [], stories: [], totalPosts: 0 });
    fetchFeed(cleanTag, 1);
  }, [cleanTag]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(cleanTag, next);
  };

  const totalContent = data.posts.length + data.reels.length + data.stories.length;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-10 min-h-screen pb-32">
      {/* Back nav */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/30 hover:text-white transition-colors group"
      >
        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="space-y-3">
            <AIBadge>Hashtag Feed</AIBadge>
            <h1 className="text-6xl font-black text-white tracking-tighter italic drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <span className="text-white/30">#</span>
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {cleanTag}
              </span>
            </h1>
          </div>

          {/* Stats */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-6 mb-2"
            >
              <div className="text-center">
                <p className="text-3xl font-black text-white italic">{data.totalPosts}</p>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-white italic">{data.reels.length}</p>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Reels</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-white italic">{data.stories.length}</p>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Stories</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-purple-500/30 text-white'
                  : 'bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="opacity-50">
                {tab.id === 'posts' ? data.posts.length : tab.id === 'reels' ? data.reels.length : data.stories.length}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <SkeletonGrid key="skeleton" />
            ) : totalContent === 0 ? (
              <EmptyHashtag key="empty" tag={cleanTag} />
            ) : (
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {activeTab === 'posts' && (
                  <PostsGrid
                    posts={data.posts}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadMore={loadMore}
                  />
                )}
                {activeTab === 'reels' && <ReelsGrid reels={data.reels} />}
                {activeTab === 'stories' && <StoriesGrid stories={data.stories} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: related trending */}
        <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit">
          {trending.length > 0 && (
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <FireIcon className="w-5 h-5 text-orange-400" />
                <h3 className="text-xs font-black text-white uppercase italic tracking-tighter">
                  Related Trending
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending
                  .filter(t => t.tag.replace('#', '').toLowerCase() !== cleanTag.toLowerCase())
                  .slice(0, 10)
                  .map((t, i) => (
                    <motion.div
                      key={t.tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <HashtagPill tag={t.tag} count={t.count} variant="trending" />
                    </motion.div>
                  ))}
              </div>
            </GlassCard>
          )}

          {/* Pulse info card */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-black text-white uppercase italic tracking-tighter">
                Tag Intelligence
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Tag</span>
                <span className="text-[11px] font-black text-cyan-400">#{cleanTag}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Total Content</span>
                <span className="text-[11px] font-black text-white">{totalContent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Posts</span>
                <span className="text-[11px] font-black text-white">{data.totalPosts}</span>
              </div>
              <div className="h-px bg-white/5" />
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent('#' + cleanTag)}`)}
                className="w-full text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all"
              >
                Search More Results →
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const PostsGrid = ({ posts, hasMore, loadingMore, onLoadMore }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map((post, i) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ scale: 1.02, y: -4 }}
          className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
        >
          <img
            src={post.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
            <div className="flex items-center gap-2">
              <img
                src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.username}&background=9333ea&color=fff`}
                className="w-6 h-6 rounded-lg object-cover"
                alt=""
              />
              <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter truncate">
                @{post.user?.username}
              </span>
            </div>
            {post.caption && (
              <p className="text-[9px] text-white/60 mt-1 line-clamp-2">{post.caption}</p>
            )}
          </div>
          {/* Hashtag pills on post */}
          {post.aiMetadata?.hashtags?.length > 0 && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md">
                <span className="text-[8px] font-black text-cyan-400 uppercase">
                  {post.aiMetadata.emotionCategory}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
    {hasMore && (
      <div className="text-center">
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load More Posts'}
        </button>
      </div>
    )}
  </div>
);

const ReelsGrid = ({ reels }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {reels.length === 0 ? (
      <div className="col-span-3 py-20 text-center">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No reels for this tag</p>
      </div>
    ) : reels.map((reel, i) => (
      <motion.div
        key={reel._id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.05 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 bg-black cursor-pointer"
      >
        <video
          src={reel.video}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FilmIcon className="w-8 h-8 text-white/30 group-hover:text-white/60 transition-colors" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-[9px] font-black text-white/60 uppercase tracking-tighter truncate">
            @{reel.user?.username}
          </p>
        </div>
        {reel.aiMetadata?.emotionCategory && reel.aiMetadata.emotionCategory !== 'None' && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-lg bg-black/60 text-[8px] font-black text-cyan-400 uppercase">
              {reel.aiMetadata.emotionCategory}
            </span>
          </div>
        )}
      </motion.div>
    ))}
  </div>
);

const StoriesGrid = ({ stories }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {stories.length === 0 ? (
      <div className="col-span-4 py-20 text-center">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No active stories for this tag</p>
      </div>
    ) : stories.map((story, i) => (
      <motion.div
        key={story._id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.06 }}
        whileHover={{ scale: 1.04, y: -4 }}
        className="group relative aspect-[9/16] rounded-3xl overflow-hidden border-2 border-purple-500/30 cursor-pointer"
      >
        <img
          src={story.media}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        <div className="absolute top-3 left-3">
          <div className="w-8 h-8 rounded-xl border-2 border-purple-500 overflow-hidden">
            <img
              src={story.user?.avatar || `https://ui-avatars.com/api/?name=${story.user?.username}&background=9333ea&color=fff`}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[9px] font-black text-white/70 uppercase tracking-tighter">
            @{story.user?.username}
          </p>
        </div>
      </motion.div>
    ))}
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
    ))}
  </div>
);

const EmptyHashtag = ({ tag }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="py-32 text-center space-y-6"
  >
    <div className="w-24 h-24 mx-auto rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center">
      <HashtagIcon className="w-10 h-10 text-white/10" />
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
        #{tag} Not Yet Tagged
      </h3>
      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest max-w-xs mx-auto">
        Be the first to create content with this hashtag
      </p>
    </div>
    <Link
      to="/create"
      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all"
    >
      Create Content →
    </Link>
  </motion.div>
);

export default HashtagFeed;
