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
import { useWellness } from '../../context/WellnessContext';
import { useAuth } from '../../context/AuthContext';
import { reelsAPI } from '../../services/reelsAPI';
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
  const [isVideoReady, setIsVideoReady] = useState(false);

  const isLiked = reel.likes?.some(like => (like.user?._id || like.user) === user?._id);

  // Validate URL immediately
  useEffect(() => {
    console.log("Reel:", reel);
    console.log("Video URL:", reel.video);
    if (!reel.video || typeof reel.video !== 'string' || !reel.video.startsWith('http')) {
      setVideoError(true);
    }
  }, [reel.video]);

  useEffect(() => {
    const options = { threshold: 0.7 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().then(() => {
            incrementReelCount();
            reelsAPI.incrementView(reel._id).catch(() => {});
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
      toast.error(err.response?.data?.message || 'Failed to post comment');
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
        toast.success('Link copied to clipboard!');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="relative h-screen w-full bg-black snap-start overflow-hidden flex items-center justify-center group">
      {(!reel.video || videoError) ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-white/50 mb-4 opacity-80" />
          <p className="text-sm font-bold text-white mb-2">Video Unavailable</p>
          <p className="text-xs text-white/50 max-w-xs leading-relaxed">This reel is unavailable.</p>
        </div>
      ) : (
        <>
          {!isVideoReady && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
               <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <video
            src={reel.video}
            controls
            muted
            playsInline
            preload="metadata"
            autoPlay
            onLoadedData={() => console.log("Video loaded")}
            onCanPlay={() => console.log("Video can play")}
            onError={(e) => {
                console.error("VIDEO ERROR", reel.video, e);
                setVideoError(true);
            }}
            className="h-full w-full object-cover relative z-10"
          />
        </>
      )}

      {/* Like Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1.2, opacity: 1 }} 
            exit={{ scale: 1.5, opacity: 0 }} 
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <HeartIconSolid className="w-32 h-32 text-red-500 drop-shadow-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30 pb-4">
        {/* Profile */}
        <div className="relative mb-2">
          <img 
            src={reel.user?.avatar || `https://ui-avatars.com/api/?name=${reel.user?.username || 'U'}&background=333&color=fff`} 
            className="w-12 h-12 rounded-full border-2 border-white object-cover" 
            alt="Creator" 
          />
        </div>

        <div className="flex flex-col items-center gap-1 group">
          <button onClick={handleLike} className="p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all hover:bg-black/40">
            {isLiked ? <HeartIconSolid className="w-7 h-7 text-red-500" /> : <HeartIcon className="w-7 h-7 text-white" />}
          </button>
          <span className="text-xs font-semibold text-white drop-shadow-md">{reel.likes?.length || 0}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={() => setShowComments(true)} className="p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all hover:bg-black/40">
            <ChatBubbleBottomCenterTextIcon className="w-7 h-7 text-white" />
          </button>
          <span className="text-xs font-semibold text-white drop-shadow-md">{reel.comments?.length || 0}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={handleShare} className="p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all hover:bg-black/40">
            <ShareIcon className="w-7 h-7 text-white" />
          </button>
          <span className="text-xs font-semibold text-white drop-shadow-md">Share</span>
        </div>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-20 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 pr-20">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">@{reel.user?.username || 'creator'}</h3>
            {reel.mood && reel.mood !== 'None' && (
               <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold text-white border border-white/20">
                 {reel.mood}
               </span>
            )}
          </div>
          
          <p className="text-sm text-white/90 font-medium leading-snug line-clamp-2">
            {reel.caption}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mt-1">
            {reel.hashtags?.map(tag => (
              <span key={tag} className="text-xs font-semibold text-white/80 hover:text-white cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-white/80 mt-2">
            <MusicalNoteIcon className="w-4 h-4 animate-bounce" />
            <p className="text-xs font-medium truncate">Original Audio - @{reel.user?.username || 'creator'}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-40">
        <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowComments(false)} className="absolute inset-0 bg-black/50 z-[60]" />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="absolute bottom-0 left-0 right-0 h-[60vh] bg-neutral-900 rounded-t-2xl z-[70] flex flex-col p-4 pb-safe"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Comments ({reel.comments?.length || 0})</h3>
                <button onClick={() => setShowComments(false)} className="p-2 rounded-full hover:bg-white/10 transition-all">
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                {reel.comments?.length > 0 ? (
                  reel.comments.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.username || 'U'}&background=333&color=fff`} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                      <div>
                        <p className="text-xs font-bold text-white/60 mb-0.5">@{c.user?.username}</p>
                        <p className="text-sm text-white/90">{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <ChatBubbleBottomCenterTextIcon className="w-8 h-8 mb-2 text-white" />
                    <p className="text-xs font-semibold text-white">Be the first to comment!</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                <input 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Add a comment..." 
                  className="flex-1 bg-white/10 border border-white/10 px-4 py-2.5 rounded-full text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={loadingComment || !newComment.trim()}
                  className="p-2.5 rounded-full bg-white text-black disabled:opacity-50 transition-all hover:bg-white/90"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelPlayer;
