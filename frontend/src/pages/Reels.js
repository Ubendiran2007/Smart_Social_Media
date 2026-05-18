import React, { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { reelsAPI } from "../services/reelsAPI";
import ReelPlayer from "../components/reels/ReelPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useMood } from "../context/MoodContext";
import { SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const Reels = () => {
  const { user } = useAuth();
  const { activeMood } = useMood();
  const currentMood = activeMood;
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const loadReels = async (reset = true) => {
    try {
      if (reset) setLoading(true);
      setError(false);
      
      const targetPage = reset ? 1 : page + 1;
      console.log(`Neural Sync: Fetching reels for ${currentMood}, page ${targetPage}`);
      
      const res = await reelsAPI.getReels(targetPage, 10, currentMood);
      
      if (res.data?.success) {
        const fetchedReels = res.data.reels || [];
        setReels(prev => reset ? fetchedReels : [...prev, ...fetchedReels]);
        setHasMore(res.data.hasMore);
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Neural Stream Interrupted", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReels(true);
  }, [currentMood]);

  if (loading && reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black gap-6">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
            borderColor: ["#8b5cf6", "#06b6d4", "#8b5cf6"]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-20 h-20 rounded-full border-4 border-t-transparent flex items-center justify-center"
        >
          <SparklesIcon className="w-8 h-8 text-white/40" />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Syncing Neural Stream...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020205] z-0 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {error && reels.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-[3rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <ArrowPathIcon className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Transmission Failed</h2>
          <p className="text-xs text-white/40 uppercase font-bold tracking-widest max-w-xs">
            The neural link was interrupted by external interference.
          </p>
          <button 
            onClick={() => loadReels(true)}
            className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Reconnect Stream
          </button>
        </div>
      ) : reels.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center mb-4 opacity-20">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white/20 uppercase italic tracking-tighter">Empty Frequency</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/10">
            No transmissions detected in the {currentMood} spectrum yet.
          </p>
        </div>
      ) : (
        <div 
          id="reels-scroll-container"
          className="reels-container h-full w-full"
        >
          <InfiniteScroll
            dataLength={reels.length}
            next={() => loadReels(false)}
            hasMore={hasMore}
            scrollableTarget="reels-scroll-container"
            loader={
              <div className="h-screen flex items-center justify-center bg-black">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Next Wave...</p>
              </div>
            }
          >
            {reels.map((reel, idx) => (
              <div key={`${reel._id}-${idx}`} className="reel-item">
                <ReelPlayer reel={reel} />
              </div>
            ))}
          </InfiniteScroll>
        </div>
      )}

      {/* Mood Badge Overlay (Top Right) */}
      <div className="fixed top-24 right-8 z-50">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-3 shadow-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{currentMood} Feed</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Reels;

