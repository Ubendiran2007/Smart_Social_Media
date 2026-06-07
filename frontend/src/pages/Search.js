import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  CheckBadgeIcon, 
  UserPlusIcon, 
  UserMinusIcon,
  SparklesIcon,
  FireIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { GlassCard, AIBadge, NeonButton } from '../components/ui/SiliconValley';
import { usersAPI } from '../services/usersAPI';
import { searchAPI } from '../services/searchAPI';
import { hashtagAPI } from '../services/hashtagAPI';
import { useMood } from '../context/MoodContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

// Simple debounce helper
const debounceHelper = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Search = () => {
  const { activeMood } = useMood();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [globalResults, setGlobalResults] = useState({
    users: [],
    posts: [],
    reels: [],
    stories: []
  });
  const [suggestions, setSuggestions] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('Discovery');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sugRes, trendRes] = await Promise.all([
        usersAPI.searchUsers(''),
        hashtagAPI.getTrending(activeMood, 15)
      ]);
      setSuggestions(sugRes.data.suggestions || []);
      setTrendingTags(trendRes.data.trending || []);
      setMode('Discovery');
    } catch (err) {
      console.error("Initial discovery fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (searchQuery) => {
    if (!searchQuery) {
      fetchInitialData();
      return;
    }
    try {
      setLoading(true);
      const res = await searchAPI.globalSearch(searchQuery, activeMood);
      setGlobalResults(res.data.results);
      setMode('Search');
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounceHelper((nextValue) => fetchResults(nextValue), 500),
    [activeMood] // Re-memoize if mood changes
  );

  useEffect(() => {
    if (query) {
      fetchResults(query);
    } else {
      fetchInitialData();
    }
  }, [activeMood]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length === 1) {
      fetchResults(value);
    } else {
      debouncedSearch(value);
    }
  };

  // Handle ?q= URL param on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) { setQuery(q); fetchResults(q); }
    else if (!q) { fetchInitialData(); }
  }, [activeMood]);

  const handleFollowToggle = async (userId) => {
    try {
      await usersAPI.toggleFollow(userId);
      // Refresh current state
      fetchResults(query);
    } catch (err) {
      console.error("Follow action failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8 min-h-screen pb-24">
      {/* Search Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Discover
          </h1>
          <p className="text-sm text-muted-foreground">Find creators, trending topics, and inspiring content</p>
        </div>

        <div className="relative max-w-3xl">
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search by name, skills, or interests..."
              className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-10 text-foreground text-sm placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm outline-none"
            />
            {loading && (
              <div className="absolute right-4 flex gap-1">
                <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Results / Suggestions Grid */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'Discovery' ? (
            <motion.div
              key="discovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Trending Hashtags */}
              <div className="space-y-4">
                <SectionHeader icon={FireIcon} title="Trending Topics" subtitle="What's happening right now" />
                <div className="flex flex-wrap gap-2 px-1">
                  {trendingTags.map((t, i) => (
                    <motion.button
                      key={t.tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/hashtag/${encodeURIComponent(t.tag.replace('#', ''))}`)}
                      className="px-4 py-2 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-hover transition-colors flex items-center gap-2 group"
                    >
                      <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{t.tag}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-surface-hover border border-border px-1.5 py-0.5 rounded-md">{t.count}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader icon={SparklesIcon} title="Suggested Creators" subtitle="People you might find interesting" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((user, idx) => (
                    <UserCard key={user._id} user={user} index={idx} onFollow={() => handleFollowToggle(user._id)} />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Creators Results */}
              {globalResults.users?.length > 0 && (
                <div className="space-y-4">
                  <SectionHeader icon={UserGroupIcon} title="Creators" subtitle="People matching your search" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {globalResults.users.map((user, idx) => (
                      <UserCard key={user._id} user={user} index={idx} onFollow={() => handleFollowToggle(user._id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {globalResults.posts?.length > 0 && (
                <div className="space-y-4">
                  <SectionHeader icon={SparklesIcon} title="Related Posts" subtitle="Content matching your search" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {globalResults.posts.map((post, idx) => (
                      <Link key={post._id} to={`/post/${post._id}`}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="aspect-square rounded-xl overflow-hidden border border-border relative group bg-surface"
                        >
                          <img src={post.image} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">View Post</span>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reels Results */}
              {globalResults.reels?.length > 0 && (
                <div className="space-y-4">
                  <SectionHeader icon={FireIcon} title="Matching Reels" subtitle="Short-form video content" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {globalResults.reels.map((reel, idx) => (
                      <Link key={reel._id} to={`/reels`}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="aspect-[9/16] rounded-xl overflow-hidden border border-border relative group bg-surface"
                        >
                          <video src={reel.video} className="w-full h-full object-cover opacity-80" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FireIcon className="w-8 h-8 text-white/50 group-hover:text-white group-hover:scale-110 transition-all drop-shadow-md" />
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(!globalResults.users?.length && !globalResults.posts?.length && !globalResults.reels?.length) && (
                <EmptyState query={query} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 px-1 mb-2">
    <div className="p-2 rounded-lg bg-surface-hover border border-border">
      <Icon className="w-5 h-5 text-accent" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-foreground leading-tight">{title}</h2>
      <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const UserCard = ({ user, index, onFollow }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <GlassCard className="p-5 relative group h-full flex flex-col">
        <div className="relative z-10 flex flex-col items-center text-center space-y-3 flex-1">
          <Link to={`/profile/${user._id}`} className="relative group/avatar">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=27272a&color=f4f4f5`} 
              className="w-20 h-20 rounded-full border border-border group-hover/avatar:border-accent transition-colors object-cover relative z-10"
              alt=""
            />
            {user.verified && (
              <div className="absolute bottom-0 right-0 z-20 bg-surface rounded-full p-0.5">
                <CheckBadgeIcon className="w-6 h-6 text-accent bg-surface rounded-full" />
              </div>
            )}
          </Link>

          <div>
            <div className="flex items-center justify-center gap-2">
              <Link to={`/profile/${user._id}`} className="text-base font-semibold text-foreground hover:text-accent transition-colors">
                {user.fullName}
              </Link>
              {user.moodAnalytics?.currentMood && user.moodAnalytics.currentMood !== 'None' && (
                <AIBadge>{user.moodAnalytics.currentMood}</AIBadge>
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">@{user.username}</p>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
            {user.bio || 'Exploring the network.'}
          </p>

          <div className="flex flex-wrap justify-center gap-1.5">
            {(user.professionalProfile?.skills || []).slice(0, 3).map(skill => (
              <span key={skill} className="text-[10px] font-medium px-2 py-0.5 bg-surface-hover border border-border rounded-md text-muted-foreground group-hover:text-foreground transition-colors">
                {skill}
              </span>
            ))}
          </div>

          <div className="pt-4 mt-auto w-full border-t border-border flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{user.followers?.length || 0}</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Followers</p>
            </div>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                onFollow();
              }}
              className={`p-2 rounded-lg transition-colors border ${
                user.isFollowing 
                ? 'bg-surface-hover text-muted-foreground border-border hover:bg-surface hover:text-foreground' 
                : 'bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white'
              }`}
            >
              {user.isFollowing ? <UserMinusIcon className="w-4 h-4" /> : <UserPlusIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const EmptyState = ({ query }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="py-16 text-center space-y-4"
  >
    <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
      <UserGroupIcon className="w-8 h-8" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-semibold text-foreground">No results found</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        We couldn't find any matches for "{query}". Try a different search term.
      </p>
    </div>
  </motion.div>
);

export default Search;