import React, { useState, useCallback } from 'react';
import { postsAPI } from '../services/postsAPI';
import { reelsAPI } from '../services/reelsAPI';
import { storiesAPI } from '../services/storiesAPI';
import { hashtagAPI } from '../services/hashtagAPI';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon, FilmIcon, PhotoIcon, SparklesIcon,
  XMarkIcon, CpuChipIcon, CheckIcon
} from '@heroicons/react/24/outline';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';
import HashtagIntelligencePanel, { HashtagAutocomplete } from '../components/hashtags/HashtagIntelligencePanel';
import { useMood } from '../context/MoodContext';
import { generateImageCaptions } from '../utils/imageCaptionEngine';

const MOOD_GRADIENT = {
  Productive: 'from-blue-600 to-cyan-500',
  Motivational: 'from-orange-500 to-red-500',
  Calm: 'from-emerald-600 to-teal-500',
  Learning: 'from-purple-600 to-violet-500',
  Funny: 'from-yellow-500 to-amber-400',
  None: 'from-purple-600 to-cyan-500',
};

const Create = () => {
  const { activeMood } = useMood();
  const [activeTab, setActiveTab] = useState('post');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Caption AI state
  const [captionSuggestions, setCaptionSuggestions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [sceneLabel, setSceneLabel] = useState('');
  const [captionsReady, setCaptionsReady] = useState(false);

  // Insert hashtag into caption
  const handleInsertHashtag = useCallback((tag) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    setCaption(prev => {
      if (!prev || prev.endsWith(' ')) return prev + cleanTag + ' ';
      return prev + ' ' + cleanTag + ' ';
    });
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setCaptionSuggestions([]);
    setCaptionsReady(false);
    setSelectedCaption(null);
  };

  const handleGenerateCaptions = async () => {
    if (!file) return;
    setGeneratingCaptions(true);
    setCaptionsReady(false);
    setCaptionSuggestions([]);

    try {
      const { captions, sceneLabel: detected } = await generateImageCaptions(file, activeMood);
      setCaptionSuggestions(captions);
      setSceneLabel(detected || '');
      setCaptionsReady(true);
    } catch (err) {
      console.error('Caption generation failed:', err);
      toast.error('Could not generate captions');
    } finally {
      setGeneratingCaptions(false);
    }
  };

  const handleSelectCaption = (cap) => {
    setCaption(cap);
    setSelectedCaption(cap);
  };

  const handleCaptionChange = (e) => {
    const val = typeof e === 'string' ? e : e.target.value;
    setCaption(val);
    if (val !== selectedCaption) setSelectedCaption(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file to upload'); return; }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('caption', caption);

      if (activeTab === 'post') {
        formData.append('image', file);
        await postsAPI.createPost(formData);
        toast.success('Posted! 🎉');
        navigate('/');
      } else if (activeTab === 'reel') {
        formData.append('video', file);
        await reelsAPI.createReel(formData);
        toast.success('Reel is live! 🎬');
        navigate('/reels');
      } else {
        formData.append('media', file);
        await storiesAPI.createStory(formData);
        toast.success('Story uploaded! ✨');
        navigate('/');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  const resetTab = (id) => {
    setActiveTab(id);
    setFile(null);
    setPreviewUrl(null);
    setCaption('');
    setCaptionSuggestions([]);
    setCaptionsReady(false);
    setSelectedCaption(null);
  };

  const gradient = MOOD_GRADIENT[activeMood] || MOOD_GRADIENT.None;

  const tabs = [
    { id: 'post', label: 'Feed Sync', icon: PhotoIcon },
    { id: 'reel', label: 'Cinematic', icon: FilmIcon },
    { id: 'story', label: 'Memory', icon: SparklesIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <AIBadge className="mx-auto">CREATE CONTENT</AIBadge>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Share Something
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Upload an image or video — AI will suggest captions based on what it sees
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab selector */}
        <div className="lg:col-span-1 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => resetTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-500 group ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className={`w-6 h-6 group-hover:scale-110 transition-transform ${activeTab === tab.id ? 'text-purple-400' : ''}`} />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest">{tab.label}</p>
                <p className="text-[10px] opacity-40 font-bold uppercase">Share a {tab.id}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Main form */}
        <div className="lg:col-span-3">
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ── 1. File Upload ─────────────────────────────────── */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-1">
                  Upload Media
                </label>

                {!file ? (
                  <div className="relative group">
                    <input
                      type="file"
                      accept={activeTab === 'reel' ? 'video/*' : 'image/*,video/*'}
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-16 rounded-[3rem] border-2 border-dashed border-white/5 group-hover:border-purple-500/30 group-hover:bg-white/3 transition-all flex flex-col items-center gap-4 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center"
                      >
                        <CloudArrowUpIcon className="w-8 h-8 text-white/20 group-hover:text-purple-400 transition-colors" />
                      </motion.div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">Select File</p>
                        <p className="text-[10px] text-white/20 font-bold uppercase mt-1">JPG, PNG, MP4 supported</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-[2rem] overflow-hidden border border-white/10 group">
                    {file.type.startsWith('image/') ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                    ) : (
                      <video src={previewUrl} className="w-full h-64 object-cover" controls />
                    )}
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreviewUrl(null); setCaptionSuggestions([]); setCaptionsReady(false); }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-red-500/80 text-white transition-all"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    {/* Scene label overlay */}
                    {sceneLabel && (
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md">
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                          Detected: {sceneLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 2. Generate AI Captions button (appears after upload) ── */}
              <AnimatePresence>
                {file && !captionsReady && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      type="button"
                      onClick={handleGenerateCaptions}
                      disabled={generatingCaptions}
                      className={`w-full py-4 rounded-[2rem] bg-gradient-to-r ${gradient} text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_50px_rgba(139,92,246,0.4)] transition-all disabled:opacity-60`}
                    >
                      {generatingCaptions ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          >
                            <CpuChipIcon className="w-5 h-5" />
                          </motion.div>
                          Analyzing image...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          Generate AI Captions
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── 3. Caption Suggestions ─────────────────────────── */}
              <AnimatePresence>
                {captionsReady && captionSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">
                        Pick a caption — or write your own below
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerateCaptions}
                        className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors"
                      >
                        Regenerate ↺
                      </button>
                    </div>
                    <div className="space-y-2">
                      {captionSuggestions.map((cap, i) => (
                        <motion.button
                          key={i}
                          type="button"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleSelectCaption(cap)}
                          className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                            selectedCaption === cap
                              ? 'bg-purple-500/15 border-purple-500/40 text-white'
                              : 'bg-white/3 border-white/5 text-white/70 hover:bg-white/8 hover:border-white/15'
                          }`}
                        >
                          <span className="text-sm leading-relaxed">{cap}</span>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            selectedCaption === cap
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-white/20 group-hover:border-white/40'
                          }`}>
                            {selectedCaption === cap && <CheckIcon className="w-3 h-3 text-white" />}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── 4. Caption textarea with autocomplete ─────────── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    Caption
                  </label>
                  <span className="text-[9px] text-white/15 font-bold">
                    Type # for hashtag autocomplete
                  </span>
                </div>
                <HashtagAutocomplete
                  value={caption}
                  onChange={handleCaptionChange}
                  mood={activeMood}
                  placeholder="Write your caption here, or pick one above..."
                  className="w-full p-5 rounded-[2rem] bg-white/5 border border-white/5 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all h-28 resize-none leading-relaxed"
                />
              </div>

              {/* ── 5. Live Hashtag Intelligence ───────────────────── */}
              <div className="p-5 rounded-[2rem] bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
                <HashtagIntelligencePanel
                  caption={caption}
                  mood={activeMood}
                  onInsertHashtag={handleInsertHashtag}
                />
              </div>

              {/* ── 6. Submit ──────────────────────────────────────── */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-4 rounded-[2rem] bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className={`flex-[2] py-4 rounded-[2rem] bg-gradient-to-r ${gradient} text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_50px_rgba(139,92,246,0.4)] transition-all disabled:opacity-40`}
                >
                  {loading ? 'Posting...' : `Share ${activeTab}`}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Create;