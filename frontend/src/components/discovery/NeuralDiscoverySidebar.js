import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useMood } from '../../context/MoodContext';
import { useWellness } from '../../context/WellnessContext';
import { useRecommendations } from '../../context/RecommendationContext';
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  UserPlusIcon,
  BoltIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const NeuralDiscoverySidebar = () => {
  const navigate  = useNavigate();
  const { activeMood, theme } = useMood();
  const { burnoutScore } = useWellness();
  const { 
    suggestedCreators, 
    suggestedHashtags, 
    trendingHashtags,
    recommendedRoom,
    forYouReason,
    loading 
  } = useRecommendations();

  if (loading) {
    return (
      <div className="space-y-5">
        {[1,2,3].map(i => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 space-y-3 animate-pulse">
            <div className="h-3 w-28 skeleton rounded" />
            {[1,2,3].map(j => <div key={j} className="h-3 w-full skeleton rounded" />)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── AI For You Reason ──────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg shrink-0" style={{ background: `${theme.accent}18` }}>
          <BoltIcon className="w-4 h-4" style={{ color: theme.accent }} />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-0.5">AI Discovery</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{forYouReason}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Burnout: <span className={`font-bold ${burnoutScore > 70 ? 'text-rose-500' : 'text-emerald-500'}`}>{burnoutScore}%</span>
          </p>
        </div>
      </div>

      {/* ── Trending Hashtags ──────────────────────────────────────────── */}
      {suggestedHashtags.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Trending in {activeMood}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedHashtags.slice(0, 8).map((tag, i) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`/hashtag/${tag.replace('#', '')}`)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  trendingHashtags.includes(tag)
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-surface-hover border-border text-muted-foreground hover:text-foreground hover:border-accent/30'
                }`}
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
                {trendingHashtags.includes(tag) && (
                  <span className="ml-1 text-[9px] font-black opacity-60">HOT</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommended Room ──────────────────────────────────────────── */}
      {recommendedRoom && (
        <Link to="/chat">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-surface border border-border rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Recommended Room</h3>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover border border-border">
              <span className="text-2xl">{recommendedRoom.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{recommendedRoom.name}</p>
                <p className="text-xs text-muted-foreground truncate">{recommendedRoom.desc}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                {recommendedRoom.badge}
              </span>
            </div>
          </motion.div>
        </Link>
      )}

      {/* ── Suggested Creators ────────────────────────────────────────── */}
      {suggestedCreators.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Creators For You</h3>
          </div>
          <div className="space-y-3">
            {suggestedCreators.slice(0, 4).map((creator, i) => (
              <motion.div
                key={creator._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 group"
              >
                <img 
                  src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.username}&background=27272a&color=f4f4f5`}
                  className="w-9 h-9 rounded-xl object-cover border border-border shrink-0"
                  alt={creator.username}
                />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${creator._id}`)}>
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                    {creator.fullName || creator.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">@{creator.username}</p>
                </div>
                <button
                  onClick={() => navigate(`/profile/${creator._id}`)}
                  className="p-1.5 rounded-lg bg-surface-hover border border-border hover:border-accent/50 hover:bg-accent/5 transition-all shrink-0"
                >
                  <UserPlusIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralDiscoverySidebar;
