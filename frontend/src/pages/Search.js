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
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 min-h-screen pb-24">
      {/* Neural Search Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-8"
      >
        <div className="text-center space-y-4">
          <AIBadge className="mx-auto">NEURAL DISCOVERY ENGINE</AIBadge>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Explore the Network
          </h1>
        </div>

        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-50" />
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className="absolute left-6 w-6 h-6 text-white/40 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search by name, skills, or interests (e.g. MERN, AI, Design)..."
              className="w-full bg-black/40 border-white/10 border-2 rounded-[2rem] py-6 pl-16 pr-8 text-white font-bold placeholder:text-white/20 focus:border-purple-500/50 focus:ring-0 transition-all text-lg shadow-2xl backdrop-blur-xl"
            />
            {loading && (
              <div className="absolute right-6 flex gap-1">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
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
              <div className="space-y-8">
                <SectionHeader icon={FireIcon} title="Trending Neural Pulse" subtitle="Real-time hashtag synchronization" />
                <div className="flex flex-wrap gap-4 px-4">
                  {trendingTags.map((t, i) => (
                    <motion.button
                      key={t.tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => navigate(`/hashtag/${encodeURIComponent(t.tag.replace('#', ''))}`)}
                      className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-400/30 hover:bg-white/10 transition-all flex items-center gap-3 group"
                    >
                      <span className="text-cyan-400 font-bold group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{t.tag}</span>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{t.count} Syncs</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <SectionHeader icon={SparklesIcon} title="Suggested for You" subtitle="Based on your neural profile" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="space-y-8">
                  <SectionHeader icon={UserGroupIcon} title="Creators Found" subtitle={`Neural matches for "${query}"`} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {globalResults.users.map((user, idx) => (
                      <UserCard key={user._id} user={user} index={idx} onFollow={() => handleFollowToggle(user._id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {globalResults.posts?.length > 0 && (
                <div className="space-y-8">
                  <SectionHeader icon={SparklesIcon} title="Related Posts" subtitle="Top collective transmissions" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {globalResults.posts.map((post, idx) => (
                      <Link key={post._id} to={`/post/${post._id}`}>
                        <motion.div
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative group"
                        >
                          <img src={post.image} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">View Post</span>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reels Results */}
              {globalResults.reels?.length > 0 && (
                <div className="space-y-8">
                  <SectionHeader icon={FireIcon} title="Matching Reels" subtitle="Short-form neural frequency" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {globalResults.reels.map((reel, idx) => (
                      <Link key={reel._id} to={`/reels`}>
                        <motion.div
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 relative group bg-black"
                        >
                          <video src={reel.video} className="w-full h-full object-cover opacity-60" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FireIcon className="w-8 h-8 text-white/40 group-hover:text-white group-hover:scale-110 transition-all" />
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
  <div className="flex items-center gap-4 px-4">
    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
      <Icon className="w-6 h-6 text-purple-400" />
    </div>
    <div>
      <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{title}</h2>
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{subtitle}</p>
    </div>
  </div>
);

const UserCard = ({ user, index, onFollow }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <GlassCard className="p-6 relative group overflow-hidden h-full flex flex-col">
        {/* Glow Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-all duration-500" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 flex-1">
          <Link to={`/profile/${user._id}`} className="relative group/avatar">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-cyan-400 rounded-full blur-md opacity-0 group-hover/avatar:opacity-50 transition-opacity" />
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=9333ea&color=fff`} 
              className="w-24 h-24 rounded-full border-2 border-white/10 group-hover/avatar:border-purple-500 transition-all object-cover relative z-10"
              alt=""
            />
            {user.verified && (
              <div className="absolute bottom-0 right-0 z-20">
                <CheckBadgeIcon className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] bg-black rounded-full" />
              </div>
            )}
          </Link>

          <div>
            <div className="flex items-center justify-center gap-2">
              <Link to={`/profile/${user._id}`} className="text-lg font-black text-white uppercase italic tracking-tighter hover:text-purple-400 transition-colors">
                {user.fullName}
              </Link>
              {user.moodAnalytics?.currentMood && user.moodAnalytics.currentMood !== 'None' && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-widest border border-cyan-500/20">
                  {user.moodAnalytics.currentMood}
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">@{user.username}</p>
          </div>

          <p className="text-xs text-white/60 line-clamp-2 min-h-[2.5rem]">
            {user.bio || 'Neural pioneer exploring the Sentient network.'}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {(user.professionalProfile?.skills || []).slice(0, 3).map(skill => (
              <span key={skill} className="text-[8px] font-black uppercase tracking-tighter px-2 py-1 bg-white/5 border border-white/10 rounded-md text-white/40 group-hover:text-cyan-400 group-hover:border-cyan-400/20 transition-all">
                {skill}
              </span>
            ))}
          </div>

          <div className="pt-4 mt-auto w-full border-t border-white/5 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[14px] font-black text-white italic">{user.followers?.length || 0}</p>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Followers</p>
            </div>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                onFollow();
              }}
              className={`p-3 rounded-2xl transition-all ${
                user.isFollowing 
                ? 'bg-white/5 text-white/40 border border-white/10' 
                : 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
              }`}
            >
              {user.isFollowing ? <UserMinusIcon className="w-5 h-5" /> : <UserPlusIcon className="w-5 h-5" />}
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
    className="py-20 text-center space-y-6"
  >
    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto">
      <UserGroupIcon className="w-10 h-10 text-white/20" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">No Neural Links Found</h3>
      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest max-w-xs mx-auto">
        Your search for "{query}" yielded no matching synthetic identities.
      </p>
    </div>
  </motion.div>
);

export default Search;