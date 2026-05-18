import React, { useState, useEffect } from 'react';
import { postsAPI } from '../../services/postsAPI';
import { aiAPI } from '../../services/aiAPI';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, SparklesIcon, RocketLaunchIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { GlassCard, AIBadge, NeonButton } from '../ui/SiliconValley';

const CreatePost = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeMood, setActiveMood] = useState(user?.moodAnalytics?.currentMood || 'Productive');

  const moods = [
    { id: 'Productive', label: 'Work', emoji: '💻' },
    { id: 'Motivational', label: 'Push', emoji: '🔥' },
    { id: 'Funny', label: 'Lmao', emoji: '💀' },
    { id: 'Calm', label: 'Zen', emoji: '🌙' },
    { id: 'Learning', label: 'Grow', emoji: '📚' }
  ];

  const fetchAiSuggestions = async (moodId) => {
    try {
      setAiLoading(true);
      const res = await aiAPI.getSuggestions(moodId);
      setSuggestions(res.data.suggestions.captions || []);
    } catch (err) {
      console.error("AI Sync Failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiSuggestions(activeMood);
  }, [activeMood]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      const response = await postsAPI.createPost(formData);
      onPostCreated(response.data.post);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020205]/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl" // Wider for AI assist
      >
        <GlassCard className="p-8 relative overflow-hidden flex gap-8 flex-col md:flex-row">
          {/* Left Side: Create Form */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Create Post</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing to collective</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <textarea
                  placeholder="What's on your mind?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full min-h-[120px] rounded-3xl bg-white/5 border border-white/5 text-white p-6 font-bold placeholder:text-white/20 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none outline-none"
                />
              </div>

              <div className="space-y-4">
                {!preview ? (
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    <div className="p-12 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/2 group-hover:bg-white/5 group-hover:border-purple-500/30 transition-all flex flex-col items-center gap-4 text-center">
                      <PhotoIcon className="w-8 h-8 text-white/20" />
                      <p className="text-xs font-black text-white uppercase tracking-widest">Select Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-[2rem] overflow-hidden border border-white/10 aspect-video">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => { setImage(null); setPreview(null); }}
                      className="absolute top-4 right-4 p-2 bg-red-500 rounded-lg text-white"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !image}
                  className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-purple-600 to-cyan-500 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:opacity-50"
                >
                  {loading ? 'Syncing...' : 'Post Now'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: AI Assist */}
          <div className="w-full md:w-80 space-y-6 border-l border-white/5 pl-8">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Neural Assist</p>
              <button 
                onClick={() => fetchAiSuggestions(activeMood)}
                className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all ${aiLoading ? 'animate-spin' : ''}`}
              >
                <ArrowPathIcon className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Mood Chips */}
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveMood(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                    activeMood === m.id 
                    ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            {/* Suggestion List */}
            <div className="space-y-3">
              {aiLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                ))
              ) : (
                suggestions.map((s, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setCaption(s)}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-400/30 hover:bg-white/10 transition-all group"
                  >
                    <p className="text-[10px] font-medium text-white/60 leading-relaxed group-hover:text-white">
                      {s}
                    </p>
                  </motion.button>
                ))
              )}
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
              <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest leading-relaxed">
                Tip: Select a neural state above to regenerate humanized captions matching your current frequency.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CreatePost;

export default CreatePost;