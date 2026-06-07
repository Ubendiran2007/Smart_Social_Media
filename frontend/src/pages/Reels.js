import React, { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { reelsAPI } from "../services/reelsAPI";
import ReelPlayer from "../components/reels/ReelPlayer";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useMood } from "../context/MoodContext";
import { useWellness } from "../context/WellnessContext";
import { ArrowPathIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const Reels = () => {
  const { user } = useAuth();
  const { activeMood } = useMood();
  const { focusMode, toggleFocusMode } = useWellness();
  const currentMood = activeMood;
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const loadReels = async (reset = true) => {
    try {
      if (reset) setLoading(true);
      setError(false);
      
      const currentViewedIds = reset ? [] : reels.map(r => r._id);
      
      const res = await reelsAPI.getReels(5, currentMood, currentViewedIds);
      
      if (res.data?.success) {
        const fetchedReels = res.data.reels || [];
        console.log("Current Mood:", currentMood);
        console.log("Loaded Reels:", fetchedReels);
        
        setReels(prev => {
          const updated = reset ? fetchedReels : [...prev, ...fetchedReels];
          console.log("Filtered Reels (All Loaded):", updated);
          return updated;
        });
        
        setHasMore(res.data.hasMore);
      }
    } catch (err) {
      console.error("Reel Sync Interrupted", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!focusMode) loadReels(true);
  }, [currentMood, focusMode]);

  if (loading && reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black gap-6">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-xs font-semibold text-white/60 animate-pulse">Tuning to {currentMood} frequency...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-0 overflow-hidden flex justify-center">
      {focusMode ? (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-6 relative z-10 w-full bg-black/90">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Focus Mode Active</h2>
          <p className="text-sm font-medium text-white/60 max-w-sm">
            Entertainment reels are disabled while Focus Mode is active. Protect your flow state and continue building.
          </p>
          <button 
            onClick={toggleFocusMode}
            className="mt-4 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white hover:bg-white/20 transition-all"
          >
            Disable Focus Mode
          </button>
        </div>
      ) : error && reels.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <ArrowPathIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Connection Interrupted</h2>
          <button 
            onClick={() => loadReels(true)}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white hover:bg-white/20 transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div 
          id="reels-scroll-container"
          className="h-full w-full max-w-[450px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative bg-black"
        >
          <InfiniteScroll
            dataLength={reels.length}
            next={() => loadReels(false)}
            hasMore={hasMore}
            scrollableTarget="reels-scroll-container"
            loader={
              <div className="h-screen w-full flex items-center justify-center bg-black snap-start">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            }
          >
            {reels.map((reel, idx) => (
              <ReelPlayer key={`${reel._id}-${idx}`} reel={reel} />
            ))}
          </InfiniteScroll>
        </div>
      )}

      {/* Top Overlay - Mood Badge */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
          <span className="text-xs font-semibold text-white drop-shadow-md">{currentMood} Feed</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Reels;
