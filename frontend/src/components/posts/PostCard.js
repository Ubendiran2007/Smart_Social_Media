import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/postsAPI';
import { 
  ChatBubbleBottomCenterTextIcon, 
  ShareIcon,
  FaceSmileIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  RocketLaunchIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard, AIBadge, NeonButton } from '../ui/SiliconValley';
import { toast } from 'react-hot-toast';
import { aiAPI } from '../../services/aiAPI';

const HashtagText = ({ text, onHashtagClick }) => {
  if (!text) return null;
  const parts = text.split(/(#\w+)/g);
  return (
    <>
      {parts.map((part, i) => 
        part.startsWith('#') ? (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onHashtagClick(part);
            }}
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all font-bold"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showEmotions, setShowEmotions] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [toxicityWarning, setToxicityWarning] = useState('');
  const [toxicitySuggestions, setToxicitySuggestions] = useState([]);
  const [liveToxicity, setLiveToxicity] = useState(0);
  const [isSafe, setIsSafe] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Real-time analysis logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (comment.trim().length > 3) {
        setAnalysisLoading(true);
        try {
          const res = await aiAPI.analyzeText(comment);
          const tox = res.data.data.toxicity;
          setLiveToxicity(tox.score);
          setIsSafe(!tox.isToxic);
          if (tox.isToxic) {
            setToxicityWarning(tox.recommendation);
            setToxicitySuggestions(tox.suggestions || []);
          } else {
            setToxicityWarning('');
          }
        } catch (err) {
          console.error('Real-time analysis failed:', err);
        } finally {
          setAnalysisLoading(false);
        }
      } else {
        setLiveToxicity(0);
        setIsSafe(true);
        setToxicityWarning('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [comment]);

  const currentUserId = user?._id;
  const reactions = post?.emotionReactions || {};
  const comments = post?.comments || [];

  const emotions = [
    { name: 'inspired', icon: SparklesIcon, label: 'Inspired', color: 'text-purple-400' },
    { name: 'helpful', icon: WrenchScrewdriverIcon, label: 'Helpful', color: 'text-blue-400' },
    { name: 'funny', icon: FaceSmileIcon, label: 'Funny', color: 'text-yellow-400' },
    { name: 'deep', icon: LightBulbIcon, label: 'Deep', color: 'text-cyan-400' },
    { name: 'motivating', icon: RocketLaunchIcon, label: 'Motivating', color: 'text-orange-400' },
    { name: 'creative', icon: TrophyIcon, label: 'Creative', color: 'text-pink-400' },
  ];

  const isLiked = post.likes?.some(like => (like.user?._id || like.user) === currentUserId);

  const handleReaction = async (emotion) => {
    // Optimistic Update
    const originalLikes = [...(post.likes || [])];
    let newLikes;
    
    if (isLiked) {
      newLikes = originalLikes.filter(like => (like.user?._id || like.user) !== currentUserId);
    } else {
      newLikes = [...originalLikes, { user: currentUserId }];
    }

    onUpdate({ ...post, likes: newLikes });
    setShowEmotions(false);

    try {
      const res = await postsAPI.toggleLike(post._id);
      // Update with real data from server (handles populated user data)
      onUpdate({ ...post, likes: res.data.likes });
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert on error
      onUpdate({ ...post, likes: originalLikes });
      toast.error('Failed to sync reaction');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || loading) return;

    setLoading(true);
    setToxicityWarning('');

    try {
      // 1. Send to API (Backend handles toxicity check)
      const res = await postsAPI.addComment(post._id, comment);
      
      if (res.data.success) {
        onUpdate({ ...post, comments: res.data.comments });
        setComment('');
        setShowComments(true);
        toast.success('Neural sync complete');
      }
    } catch (err) {
      console.error('Comment failed:', err);
      const errorMsg = err.response?.data?.message || '';
      
      if (errorMsg.includes('toxic') || err.response?.data?.isToxic) {
        setToxicityWarning(errorMsg || 'Neural guard detected high toxicity in this transmission.');
        setToxicitySuggestions(err.response?.data?.suggestions || [
          "I really appreciate this perspective!",
          "This is fascinating technical architecture.",
          "Great contribution to the collective."
        ]);
        toast.error('Sync Blocked: Toxicity Detected');
      } else {
        toast.error('Neural connection lost');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Sentient Post',
      text: post.caption,
      url: `${window.location.origin}/post/${post._id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to neural clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <GlassCard className="mb-12 group">
      {/* Post Header */}
      <div className="flex items-center justify-between p-6 bg-white/5 border-b border-white/5">
        <div className="flex items-center space-x-4">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="h-12 w-12 rounded-2xl border-2 border-purple-500/50 p-1 bg-black/20"
          >
            <img
              src={getImageUrl(post.user?.avatar) || `https://ui-avatars.com/api/?name=${post.user?.username}&background=9333ea&color=fff`}
              alt=""
              className="w-full h-full rounded-xl object-cover cursor-pointer"
              onClick={() => post.user?._id && navigate(`/profile/${post.user._id}`)}
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p 
                className="font-black text-white cursor-pointer hover:text-purple-400 transition tracking-tighter"
                onClick={() => post.user?._id && navigate(`/profile/${post.user._id}`)}
              >
                {post.user?.username}
              </p>
              {post.user?.isPro && <AIBadge className="scale-75 origin-left">PRO</AIBadge>}
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
              {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        {post.user?._id === currentUserId && (
          <button onClick={() => onDelete(post._id)} className="text-white/10 hover:text-red-500 transition px-3 py-1 rounded-lg hover:bg-red-500/10">
            <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="relative aspect-video bg-black/40 overflow-hidden">
        <motion.img
          layoutId={`post-image-${post._id}`}
          src={getImageUrl(post.image)}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80'; // Fallback abstract art
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      </div>

      {/* Post Actions */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <motion.button
                onMouseEnter={() => setShowEmotions(true)}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleReaction()}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all group/btn ${
                  isLiked ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/10 hover:border-purple-500/50'
                }`}
              >
                <SparklesIcon className={`w-5 h-5 ${isLiked ? 'text-purple-400' : 'text-white/40'}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${isLiked ? 'text-white' : 'text-white/80'}`}>
                  {isLiked ? 'Liked' : 'React'}
                </span>
                {post.likes?.length > 0 && <span className="text-xs font-bold text-purple-400">{post.likes.length}</span>}
              </motion.button>
              
              <AnimatePresence>
                {showEmotions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    onMouseLeave={() => setShowEmotions(false)}
                    className="absolute bottom-full left-0 mb-6 p-3 glass-card flex gap-3 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/20"
                  >
                    {emotions.map((emo) => (
                      <motion.button
                        key={emo.name}
                        whileHover={{ scale: 1.2, y: -5 }}
                        onClick={() => handleReaction(emo.name)}
                        className="p-3 hover:bg-white/10 rounded-2xl transition-all"
                        title={emo.label}
                      >
                        <emo.icon className={`w-6 h-6 ${emo.color}`} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
                showComments ? 'bg-cyan-600/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/10 hover:border-cyan-500/50'
              }`}
            >
              <ChatBubbleBottomCenterTextIcon className={`w-5 h-5 ${showComments ? 'text-cyan-400' : 'text-white/40'}`} />
              <span className="text-xs font-black text-white/80">{comments.length}</span>
            </button>
          </div>

          <motion.button 
            whileHover={{ rotate: 15 }}
            onClick={handleShare}
            className="p-3 text-white/20 hover:text-white transition"
            title="Copy link"
          >
            <ShareIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-8">
            <p className="text-base text-white/90 leading-relaxed font-medium">
              <span className="font-black text-purple-400 mr-3 uppercase tracking-tighter italic">@{post.user?.username}</span>
              <HashtagText text={post.caption} onHashtagClick={(tag) => navigate(`/search?q=${encodeURIComponent(tag)}`)} />
            </p>
          </div>
        )}

        {/* AI Insights Layer */}
        {post.aiMetadata && (
          <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AIBadge>AI Analysis</AIBadge>
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Confidence 98.4%</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.aiMetadata.hashtags?.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="text-[10px] font-bold bg-white/5 px-3 py-1.5 rounded-xl text-white/40 border border-white/5 hover:border-purple-500/30 hover:text-purple-400 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                <span className="text-[10px] bg-cyan-500/10 px-3 py-1.5 rounded-xl text-cyan-400 font-black uppercase tracking-widest border border-cyan-500/20">
                  {post.aiMetadata.emotionCategory}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Toxicity Warning */}
        <AnimatePresence>
          {toxicityWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(239,68,68,0.1)]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-1">Neural Guard: Blocked</p>
                  <p className="text-sm font-medium text-white/80 leading-relaxed">{toxicityWarning}</p>
                </div>
              </div>

              {toxicitySuggestions.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Suggested Syncs:</p>
                  <div className="flex flex-wrap gap-2">
                    {toxicitySuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setComment(suggestion);
                          setToxicityWarning('');
                          setToxicitySuggestions([]);
                        }}
                        className="text-[10px] font-bold px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-purple-500/30 hover:text-purple-400 transition-all text-left"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isSafe ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
              {analysisLoading ? 'Syncing...' : isSafe ? 'Frequency Harmonized' : 'Neural Interference'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Resonance Index</span>
            <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${liveToxicity * 100}%` }}
                className={`h-full ${liveToxicity > 0.6 ? 'bg-red-500' : liveToxicity > 0.3 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleCommentSubmit} className="relative group/input">
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            className={`w-full glass-input pr-16 py-4 rounded-2xl text-sm transition-all placeholder:text-white/20 ${
              !isSafe 
                ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:border-red-500' 
                : 'border-white/5 focus:border-emerald-500/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)]'
            }`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <NeonButton 
              variant={!isSafe ? "red" : "purple"} 
              className="px-4 py-2" 
              type="submit" 
              disabled={loading || !isSafe}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RocketLaunchIcon className="w-5 h-5" />}
            </NeonButton>
          </div>
        </form>

        {/* Expanded Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 space-y-4 overflow-hidden"
            >
              {comments.map((c, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/2 border border-white/5">
                  <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.username}`} className="w-8 h-8 rounded-xl object-cover" alt="" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-purple-400">@{c.user?.username}</p>
                    <p className="text-sm text-white/80">{c.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default PostCard;