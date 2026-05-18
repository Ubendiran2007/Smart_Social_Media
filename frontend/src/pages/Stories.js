import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { storiesAPI } from '../services/storiesAPI';
import StoryRing from '../components/stories/StoryRing';
import StoryViewer from '../components/stories/StoryViewer';
import { AIBadge, GlassCard } from '../components/ui/SiliconValley';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const res = await storiesAPI.getStories();
      setStories(res.data.stories);
    } catch (err) {
      console.error("Failed to load stories:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <AIBadge className="mx-auto">NEURAL LIVE STREAM</AIBadge>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Neural Stories</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Ephemeral cognitive fragments from the collective consciousness
        </p>
      </motion.div>

      {/* Stats / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-black text-white italic">{stories.length}</p>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Active Channels</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10">
            <UserGroupIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-xl font-black text-white italic">{stories.reduce((acc, curr) => acc + curr.stories.length, 0)}</p>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Total Fragments</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-black text-white italic">24H</p>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Persistence Window</p>
          </div>
        </GlassCard>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 animate-pulse">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/5" />
              <div className="w-12 h-2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {stories.map((userStory, idx) => (
            <motion.div
              key={userStory.user._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center"
            >
              <StoryRing 
                user={userStory.user} 
                stories={userStory.stories} 
              />
            </motion.div>
          ))}
        </div>
      )}

      {stories.length === 0 && !loading && (
        <div className="py-32 text-center space-y-6">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[3rem] flex items-center justify-center mx-auto opacity-20">
            <SparklesIcon className="w-12 h-12 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">The collective consciousness is currently silent.</p>
        </div>
      )}
    </div>
  );
};

export default Stories;