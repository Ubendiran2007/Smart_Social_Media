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
import { advancedAnalyzeImage, generateAdvancedCaptions } from '../utils/advancedCaptionEngine';

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
  const [hashtagGroups, setHashtagGroups] = useState([]);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(null);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [captionsReady, setCaptionsReady] = useState(false);
  const [captionStyle, setCaptionStyle] = useState('Creative'); // Default style
  const captionStyles = ['Creative', 'Professional', 'Funny', 'Deep', 'Motivational'];

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
    setHashtagGroups([]);
    setCaptionsReady(false);
    setSelectedCaptionIndex(null);
    setAnalysisData(null);
  };

  const handleGenerateCaptions = async (forcedStyle = null) => {
    if (!file) return;
    setGeneratingCaptions(true);
    setCaptionsReady(false);
    setCaptionSuggestions([]);
    setHashtagGroups([]);
    setSelectedCaptionIndex(null);

    try {
      const targetStyle = forcedStyle || captionStyle;
      let analysis = analysisData;
      
      // Only run image analysis if we haven't done it yet for this file
      if (!analysis) {
        analysis = await advancedAnalyzeImage(file);
        setAnalysisData(analysis);
      }

      // Generate captions based on analysis, active mood, and selected style
      const { captions, hashtagGroups: tags } = generateAdvancedCaptions(analysis, activeMood, targetStyle);
      
      setCaptionSuggestions(captions);
      setHashtagGroups(tags);
      setCaptionsReady(true);
    } catch (err) {
      console.error('Caption generation failed:', err);
      toast.error('Could not generate captions');
    } finally {
      setGeneratingCaptions(false);
    }
  };

  const handleSelectCaption = (index) => {
    const cap = captionSuggestions[index];
    const tags = hashtagGroups[index] ? hashtagGroups[index].join(' ') : '';
    const fullCaption = `${cap}\n\n${tags}`;
    setCaption(fullCaption);
    setSelectedCaptionIndex(index);
  };

  const handleCaptionChange = (e) => {
    const val = typeof e === 'string' ? e : e.target.value;
    setCaption(val);
    setSelectedCaptionIndex(null);
  };

  const handleStyleChange = (style) => {
    setCaptionStyle(style);
    handleGenerateCaptions(style);
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
    setHashtagGroups([]);
    setCaptionsReady(false);
    setSelectedCaptionIndex(null);
    setAnalysisData(null);
  };

  const gradient = MOOD_GRADIENT[activeMood] || MOOD_GRADIENT.None;

  const tabs = [
    { id: 'post', label: 'Feed Sync', icon: PhotoIcon },
    { id: 'reel', label: 'Cinematic', icon: FilmIcon },
    { id: 'story', label: 'Memory', icon: SparklesIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Create Content</h1>
        <p className="text-sm text-muted-foreground">
          Upload an image or video, and our AI will suggest contextual captions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab selector */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => resetTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === tab.id
                  ? 'bg-surface border border-border shadow-sm'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground border border-transparent'
              }`}
            >
              <tab.icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? 'text-accent' : ''}`} />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{tab.label}</p>
                <p className="text-xs text-muted-foreground capitalize">Share a {tab.id}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Main form */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── 1. File Upload ─────────────────────────────────── */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
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
                    <div className="p-12 rounded-xl border-2 border-dashed border-border bg-surface-hover/30 hover:bg-surface-hover hover:border-accent/50 transition-all flex flex-col items-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
                        <CloudArrowUpIcon className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Select File</p>
                        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, MP4 supported</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-black group">
                    {file.type.startsWith('image/') ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain" />
                    ) : (
                      <video src={previewUrl} className="w-full h-64 object-contain" controls />
                    )}
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreviewUrl(null); setCaptionSuggestions([]); setHashtagGroups([]); setCaptionsReady(false); setSelectedCaptionIndex(null); setAnalysisData(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-500 text-white transition-all backdrop-blur-sm"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    {/* Analysis results overlay */}
                    {analysisData && (
                      <div className="absolute bottom-2 left-2 px-3 py-2 rounded-lg bg-black/80 backdrop-blur-md max-w-[90%] border border-white/10">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Detected Subjects:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[...(analysisData.objects || []), ...(analysisData.themes || []), ...(analysisData.styles || [])]
                            .filter(Boolean)
                            .slice(0, 5)
                            .map((tag, idx) => (
                            <span key={idx} className="text-xs font-medium text-white bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 border border-white/5">
                              <CheckIcon className="w-3 h-3 text-accent" /> {tag}
                            </span>
                          ))}
                        </div>
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
                      onClick={() => handleGenerateCaptions(captionStyle)}
                      disabled={generatingCaptions}
                      className="w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {generatingCaptions ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analyzing image...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4" />
                          Generate AI Captions
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── 3. Caption Suggestions & Analysis ─────────────────────────── */}
              <AnimatePresence>
                {captionsReady && captionSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {/* Style Regeneration Options */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Select a Tone</p>
                      <div className="flex flex-wrap gap-2">
                        {captionStyles.map(style => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => handleStyleChange(style)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                              captionStyle === style
                                ? 'bg-accent text-white shadow-sm'
                                : 'bg-surface-hover border border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">
                        Pick a caption below, or write your own:
                      </p>
                    </div>

                    <div className="space-y-3">
                      {captionSuggestions.map((cap, i) => (
                        <motion.button
                          key={i}
                          type="button"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleSelectCaption(i)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex flex-col gap-2 group ${
                            selectedCaptionIndex === i
                              ? 'bg-accent/10 border-accent/40'
                              : 'bg-surface-hover border-transparent hover:border-border-strong'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 w-full">
                            <span className={`text-sm ${selectedCaptionIndex === i ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{cap}</span>
                            <div className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              selectedCaptionIndex === i
                                ? 'bg-accent border-accent'
                                : 'border-border group-hover:border-border-strong'
                            }`}>
                              {selectedCaptionIndex === i && <CheckIcon className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          
                          {/* Hashtag Group Preview */}
                          {hashtagGroups[i] && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {hashtagGroups[i].map(tag => (
                                <span key={tag} className={`text-xs ${selectedCaptionIndex === i ? 'text-accent' : 'text-muted-foreground'}`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── 4. Caption textarea with autocomplete ─────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Caption
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Type # for autocomplete
                  </span>
                </div>
                <HashtagAutocomplete
                  value={caption}
                  onChange={handleCaptionChange}
                  mood={activeMood}
                  placeholder="Write your caption here, or pick one above..."
                  className="w-full bg-surface-hover border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none h-24"
                />
              </div>

              {/* ── 5. Live Hashtag Intelligence ───────────────────── */}
              <div className="p-4 rounded-xl bg-surface border border-border shadow-sm">
                <HashtagIntelligencePanel
                  caption={caption}
                  mood={activeMood}
                  onInsertHashtag={handleInsertHashtag}
                />
              </div>

              {/* ── 6. Submit ──────────────────────────────────────── */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-semibold text-foreground hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="flex-1 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors disabled:opacity-50"
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