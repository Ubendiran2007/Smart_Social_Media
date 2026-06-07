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
  ExclamationTriangleIcon,
  TrashIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard, AIBadge, NeonButton } from '../ui/SiliconValley';
import { toast } from 'react-hot-toast';
import { aiAPI } from '../../services/aiAPI';
import { ClickableHashtags, HashtagPill } from '../hashtags/HashtagIntelligencePanel';

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
      onUpdate({ ...post, likes: res.data.likes });
    } catch (err) {
      console.error('Error toggling like:', err);
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
      const res = await postsAPI.addComment(post._id, comment);
      
      if (res.data.success) {
        onUpdate({ ...post, comments: res.data.comments });
        setComment('');
        setShowComments(true);
        toast.success('Comment posted');
      }
    } catch (err) {
      console.error('Comment failed:', err);
      const errorMsg = err.response?.data?.message || '';
      
      if (errorMsg.includes('toxic') || err.response?.data?.isToxic) {
        setToxicityWarning(errorMsg || 'Comment flagged by community guidelines.');
        setToxicitySuggestions(err.response?.data?.suggestions || [
          "I really appreciate this perspective!",
          "This is fascinating architecture.",
          "Great contribution."
        ]);
        toast.error('Action Blocked: Content Warning');
      } else {
        toast.error('Connection lost');
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
        toast.success('Link copied to clipboard!');
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
    <GlassCard className="mb-8">
      {/* Post Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <img
            src={getImageUrl(post.user?.avatar) || `https://ui-avatars.com/api/?name=${post.user?.username}&background=27272a&color=f4f4f5`}
            alt=""
            className="w-10 h-10 rounded-lg object-cover cursor-pointer border border-border hover:border-accent transition-colors"
            onClick={() => post.user?._id && navigate(`/profile/${post.user._id}`)}
          />
          <div>
            <div className="flex items-center gap-2">
              <p 
                className="font-semibold text-foreground cursor-pointer hover:text-accent transition-colors text-sm"
                onClick={() => post.user?._id && navigate(`/profile/${post.user._id}`)}
              >
                {post.user?.username}
              </p>
              {post.user?.isPro && <AIBadge>PRO</AIBadge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        {post.user?._id === currentUserId && (
          <button onClick={() => onDelete(post._id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="relative aspect-[4/3] sm:aspect-video bg-[#0a0a0c] overflow-hidden">
        <img
          src={getImageUrl(post.image)}
          alt="Post content"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80';
          }}
        />
      </div>

      {/* Actions and Meta */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onMouseEnter={() => setShowEmotions(true)}
                onClick={() => handleReaction()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                  isLiked 
                    ? 'bg-accent/10 border-accent/30 text-accent' 
                    : 'bg-surface-hover border-transparent hover:border-border-strong text-muted-foreground hover:text-foreground'
                }`}
              >
                <HeartIcon className="w-5 h-5" />
                {post.likes?.length > 0 && <span className="text-xs font-semibold">{post.likes.length}</span>}
              </button>
              
              <AnimatePresence>
                {showEmotions && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    onMouseLeave={() => setShowEmotions(false)}
                    className="absolute bottom-full left-0 mb-2 p-2 bg-surface border border-border rounded-xl flex gap-1 z-50 shadow-lg"
                  >
                    {emotions.map((emo) => (
                      <button
                        key={emo.name}
                        onClick={() => handleReaction(emo.name)}
                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                        title={emo.label}
                      >
                        <emo.icon className={`w-5 h-5 ${emo.color}`} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                showComments 
                  ? 'bg-surface-hover border-border-strong text-foreground' 
                  : 'bg-surface-hover border-transparent hover:border-border-strong text-muted-foreground hover:text-foreground'
              }`}
            >
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
              {comments.length > 0 && <span className="text-xs font-semibold">{comments.length}</span>}
            </button>
          </div>

          <button 
            onClick={handleShare}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
            title="Share post"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-6">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              <span className="font-semibold text-foreground mr-2 cursor-pointer hover:underline" onClick={() => post.user?._id && navigate(`/profile/${post.user._id}`)}>
                {post.user?.username}
              </span>
              <ClickableHashtags text={post.caption} />
            </p>
          </div>
        )}

        {/* AI Metadata */}
        {post.aiMetadata && post.aiMetadata.hashtags?.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-surface-hover border border-border">
            <div className="flex items-center justify-between mb-3">
              <AIBadge>AI Analysis</AIBadge>
              <div className="text-[10px] font-medium text-muted-foreground">Auto-generated tags</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.aiMetadata.hashtags.map(tag => (
                <HashtagPill key={tag} tag={tag} variant="default" />
              ))}
              {post.aiMetadata.emotionCategory && (
                <div className="ml-auto">
                  <span className="text-[10px] bg-accent/10 px-2 py-1 rounded-md text-accent font-semibold border border-accent/20">
                    {post.aiMetadata.emotionCategory}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Toxicity Warning */}
        <AnimatePresence>
          {toxicityWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 overflow-hidden"
            >
              <div className="flex items-start gap-3 mb-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-1">Content Warning</p>
                  <p className="text-sm text-red-400/90">{toxicityWarning}</p>
                </div>
              </div>

              {toxicitySuggestions.length > 0 && (
                <div className="pt-3 border-t border-red-500/20">
                  <p className="text-xs font-medium text-red-400/70 mb-2">Suggested alternatives:</p>
                  <div className="flex flex-col gap-1.5">
                    {toxicitySuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setComment(suggestion);
                          setToxicityWarning('');
                          setToxicitySuggestions([]);
                        }}
                        className="text-sm px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-foreground transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} className="relative mt-2">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${analysisLoading ? 'bg-yellow-500 animate-pulse' : isSafe ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {analysisLoading ? 'Analyzing...' : isSafe ? 'Safe to post' : 'Flagged content'}
            </span>
          </div>
          
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full bg-surface-hover border rounded-lg pl-4 pr-12 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none transition-colors ${
                !isSafe ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
              }`}
            />
            <button 
              type="submit" 
              disabled={loading || !isSafe || !comment.trim()}
              className="absolute right-2 p-1.5 text-muted-foreground hover:text-accent disabled:opacity-50 transition-colors"
            >
              {loading ? <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
            </button>
          </div>
        </form>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 space-y-4 overflow-hidden"
            >
              {comments.map((c, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.username}&background=27272a&color=f4f4f5`} className="w-7 h-7 rounded-md object-cover border border-border" alt="" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-0.5">
                      {c.user?.username}
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-muted-foreground leading-snug">{c.text}</p>
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