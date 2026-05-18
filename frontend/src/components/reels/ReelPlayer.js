import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ShareIcon, 
  MusicalNoteIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { AIBadge, NeonButton } from '../ui/SiliconValley';
import { useWellness } from '../../context/WellnessContext';
import { useAuth } from '../../context/AuthContext';
import { reelsAPI } from '../../services/reelsAPI';
import { aiAPI } from '../../services/aiAPI';
import { toast } from 'react-hot-toast';

const ReelPlayer = ({ reel: initialReel }) => {
  const { incrementReelCount } = useWellness();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [reel, setReel] = useState(initialReel);
  const [showHeart, setShowHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [progress, setProgress] = useState(0);

  // Moderation State
  const [toxicityWarning, setToxicityWarning] = useState('');
  const [toxicitySuggestions, setToxicitySuggestions] = useState([]);
  const [liveToxicity, setLiveToxicity] = useState(0);
  const [isSafe, setIsSafe] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Real-time analysis logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (newComment.trim().length > 3) {
        setAnalysisLoading(true);
        try {
          const res = await aiAPI.analyzeText(newComment);
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
  }, [newComment]);

  const isLiked = reel.likes?.some(like => (like.user?._id || like.user) === user?._id);

  useEffect(() => {
    const options = { threshold: 0.7 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().then(() => {
            incrementReelCount();
            reelsAPI.incrementView(reel._id);
          }).catch(e => console.error("Playback interrupted:", e));
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
      });
    }, options);

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [reel._id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleLike = async () => {
    const originalLikes = [...(reel.likes || [])];
    let newLikes;
    if (isLiked) {
      newLikes = originalLikes.filter(like => (like.user?._id || like.user) !== user?._id);
    } else {
      newLikes = [...originalLikes, { user: user?._id }];
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }

    setReel({ ...reel, likes: newLikes });
    try {
      const res = await reelsAPI.toggleLike(reel._id);
      setReel({ ...reel, likes: res.data.likes });
    } catch (err) {
      setReel({ ...reel, likes: originalLikes });
      toast.error('Sync failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || loadingComment) return;

    setLoadingComment(true);
    try {
      const res = await reelsAPI.addComment(reel._id, newComment);
      setReel({ ...reel, comments: res.data.comments });
      setNewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Neural guard blocked comment');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/reel/${reel._id}`;
      if (navigator.share) {
        await navigator.share({ title: 'Sentient Reel', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link synced to clipboard!');
      }
    } catch (err) { console.error(err); }
  };

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="reel-item relative h-screen w-full bg-black snap-start overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-cyan-900/10 opacity-30 blur-3xl scale-125" />

      {videoError ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl p-10 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500/20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-2">Neural Stream Interrupted</p>
          <p className="text-[8px] text-white/20 break-all max-w-xs">{reel.video}</p>
          <button 
            onClick={() => setVideoError(false)}
            className="mt-6 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white hover:bg-white/10"
          >
            Retry Sync
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={getFullUrl(reel.video)}
          className="h-full w-full object-contain relative z-10 cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onError={(e) => {
            console.error("Video Load Error:", reel.video);
            setVideoError(true);
          }}
          onClick={() => setIsMuted(!isMuted)}
          onDoubleClick={handleLike}
        />
      )}

      {/* Heart Pop */}
      <AnimatePresence>
        {showHeart && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <HeartIconSolid className="w-40 h-40 text-white/80 drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Actions */}
      <div className="absolute right-6 bottom-40 flex flex-col items-center gap-10 z-30">
        <div className="flex flex-col items-center gap-3">
          <motion.button whileHover={{ scale: 1.1 }} onClick={handleLike} className={`p-4 rounded-full border transition-all ${isLiked ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'bg-white/5 border-white/10'}`}>
            {isLiked ? <HeartIconSolid className="w-8 h-8 text-purple-400" /> : <HeartIcon className="w-8 h-8 text-white" />}
          </motion.button>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{reel.likes?.length || 0}</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowComments(true)} className="p-4 rounded-full bg-white/5 border border-white/10 transition-all hover:border-cyan-500/50">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-white" />
          </motion.button>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{reel.comments?.length || 0}</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.button whileHover={{ scale: 1.1 }} onClick={handleShare} className="p-4 rounded-full bg-white/5 border border-white/10 transition-all hover:border-white/30">
            <ShareIcon className="w-8 h-8 text-white" />
          </motion.button>
        </div>

        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="w-14 h-14 rounded-full border-2 border-purple-500/30 p-1 bg-black/40 backdrop-blur-md">
          <img src={getFullUrl(reel.user?.avatar) || `https://ui-avatars.com/api/?name=${reel.user?.username}`} className="w-full h-full rounded-full object-cover" alt="" />
        </motion.div>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-10 pt-32 bg-gradient-to-t from-black via-black/60 to-transparent z-20">
        <div className="max-w-lg space-y-5">
          <div className="flex items-center gap-4">
            <h3 className="font-black text-white tracking-tighter text-xl uppercase italic">@{reel.user?.username}</h3>
            <AIBadge>{reel.aiMetadata?.emotionCategory || 'NEURAL CORE'}</AIBadge>
          </div>
          <p className="text-base text-white/90 font-medium leading-relaxed line-clamp-3">
            {reel.caption}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {reel.aiMetadata?.hashtags?.map(tag => (
              <span key={tag} className="text-[8px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded-lg border border-cyan-400/20">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-cyan-400">
            <MusicalNoteIcon className="w-5 h-5 animate-pulse" />
            <div className="overflow-hidden w-64">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap animate-[marquee_15s_linear_infinite]">
                Neural Sync Vol. 4 • Deep Productive Frequency 432Hz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-cyan-400 to-purple-600 z-40 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-100" style={{ width: `${progress}%` }} />

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowComments(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md z-[60]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute bottom-0 left-0 right-0 h-[70vh] bg-neutral-950 rounded-t-[3rem] border-t border-white/10 z-[70] flex flex-col p-8 pb-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Neural Feedback</h3>
                <button onClick={() => setShowComments(false)} className="p-2 rounded-full hover:bg-white/5 transition-all">
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
                {/* Toxicity Warning Popup */}
                <AnimatePresence>
                  {!isSafe && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl mb-6">
                      <div className="flex items-start gap-4 mb-4">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Neural Guard: Interference</p>
                          <p className="text-sm font-medium text-white/80">{toxicityWarning}</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Suggested Synthesis:</p>
                        <div className="flex flex-col gap-2">
                          {toxicitySuggestions.map((suggestion, idx) => (
                            <button key={idx} onClick={() => { setNewComment(suggestion); setIsSafe(true); setToxicityWarning(''); }} className="text-left text-[10px] font-bold px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-purple-500/30 transition-all">
                              "{suggestion}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {reel.comments?.length > 0 ? (
                  reel.comments.map((c, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/5">
                      <img src={getFullUrl(c.user?.avatar) || `https://ui-avatars.com/api/?name=${c.user?.username}`} className="w-10 h-10 rounded-2xl object-cover" alt="" />
                      <div>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 italic">@{c.user?.username}</p>
                        <p className="text-sm text-white/80 font-medium">{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-20">
                    <ChatBubbleBottomCenterTextIcon className="w-12 h-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No neural synchronization yet</p>
                  </div>
                )}
              </div>

              {/* Neural Harmony Meter */}
              <div className="flex items-center justify-between mb-4 px-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    {analysisLoading ? 'Syncing...' : isSafe ? 'Frequency Harmonized' : 'Neural Interference'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Resonance Index</span>
                  <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${liveToxicity * 100}%` }} className={`h-full ${liveToxicity > 0.6 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddComment} className="mt-2 relative">
                <input 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Submit to matrix..." 
                  className={`w-full glass-input pr-16 py-5 rounded-[2rem] text-sm transition-all ${
                    !isSafe ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/5'
                  }`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <NeonButton 
                    variant={!isSafe ? "red" : "cyan"} 
                    className="p-3" 
                    type="submit" 
                    disabled={loadingComment || !isSafe}
                  >
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                  </NeonButton>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelPlayer;
