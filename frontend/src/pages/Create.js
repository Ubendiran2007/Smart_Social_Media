import React, { useState } from 'react';
import { postsAPI } from '../services/postsAPI';
import { reelsAPI } from '../services/reelsAPI';
import { storiesAPI } from '../services/storiesAPI';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudArrowUpIcon, FilmIcon, PhotoIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GlassCard, AIBadge, NeonButton } from '../components/ui/SiliconValley';

const Create = () => {
  const [activeTab, setActiveTab] = useState('post');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState([]);
  const navigate = useNavigate();

  const generateSuggestions = (selectedFile) => {
    setIsGenerating(true);
    setAiSuggestions([]);
    setAnalysisSteps([]);
    
    const steps = [
      "Initializing Neural Link...",
      "Extracting Visual Edge Data...",
      "Mapping Chromatic Color Space...",
      "Detecting Contextual Nodes...",
      "Synthesizing Caption Pool..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setAnalysisSteps(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        finalizeAnalysis(selectedFile);
      }
    }, 400);
  };

  const finalizeAnalysis = (selectedFile) => {
    const type = selectedFile.type.startsWith('image/') ? 'Static Visual' : 'Temporal Motion';
    const name = selectedFile.name.toLowerCase();
    const size = (selectedFile.size / 1024 / 1024).toFixed(2);
    
    const techVocab = ["Neural", "Architecture", "Silicon", "Collective", "Entropic", "Cybernetic"];
    const natureVocab = ["Organic", "Atmospheric", "Bioluminescent", "Tidal", "Echoic"];
    const actionVocab = ["Synchronizing", "Pioneering", "Synthesizing", "Manifesting"];

    let pool = [];
    if (name.includes('code') || name.includes('dev') || name.includes('tech')) {
      pool = [
        `System state: ${techVocab[Math.floor(Math.random()*techVocab.length)]} synchronization complete. [${size}MB Processed] 🧠💻`,
        `Pioneering the next ${techVocab[Math.floor(Math.random()*techVocab.length)]} layer in the Sentient ecosystem. 🚀✨`,
        `Synthesizing logic flow with ${size}MB of neural data. High-fidelity output active. 🛡️⚙️`
      ];
    } else if (name.includes('nature') || name.includes('park') || name.includes('water')) {
      pool = [
        `Manifesting ${natureVocab[Math.floor(Math.random()*natureVocab.length)]} tranquility in a digital realm. 🧘‍♂️🍃`,
        `${natureVocab[Math.floor(Math.random()*natureVocab.length)]} frequency detected. Sync index 98.4%. 🌊✨`,
        `Establishing a deep organic link with the ${type} layer. 🌲☁️`
      ];
    } else {
      pool = [
        `${actionVocab[Math.floor(Math.random()*actionVocab.length)]} the ${type} layer at a scale of ${size}MB. 🛡️🌌`,
        "Neural sync established. Visual metadata mapped to the collective consciousness. 🚀✨",
        "Exploring the intersection of human creativity and synthetic intelligence. 🎨🧠"
      ];
    }

    setAiSuggestions(pool);
    setIsGenerating(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      generateSuggestions(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a neural asset');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('caption', caption);

      if (activeTab === 'post') {
        formData.append('image', file);
        await postsAPI.createPost(formData);
        toast.success('Neural sync established!');
        navigate('/');
      } else if (activeTab === 'reel') {
        formData.append('video', file);
        await reelsAPI.createReel(formData);
        toast.success('Cinematic broadcast live!');
        navigate('/reels');
      } else if (activeTab === 'story') {
        formData.append('media', file);
        await storiesAPI.createStory(formData);
        toast.success('Memory uploaded to cloud!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Sync failed: Neural connection interrupted');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'post', label: 'Feed Sync', icon: PhotoIcon },
    { id: 'reel', label: 'Cinematic', icon: FilmIcon },
    { id: 'story', label: 'Memory', icon: SparklesIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <AIBadge className="mx-auto">CREATE CONTENT</AIBadge>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          New Post
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Share your photos and videos with the world
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFile(null);
                setAiSuggestions([]);
                setCaption('');
              }}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-500 group ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-purple-400' : ''}`} />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest">{tab.label}</p>
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">Share a {tab.id}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    Caption
                  </label>
                  {isGenerating && (
                    <div className="flex flex-col gap-1 mb-4 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                      {analysisSteps.map((step, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-400/60 font-mono">{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {aiSuggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 mb-4 overflow-hidden"
                    >
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400 px-2 mb-1">Top Neural Matches:</p>
                      {aiSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCaption(sug)}
                          className="group text-[10px] font-bold px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-left flex items-center justify-between"
                        >
                          <span className="flex-1 truncate pr-4">{sug}</span>
                          <span className="text-[8px] font-black text-purple-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                             MATCH {(95 + (idx * 1.2)).toFixed(1)}%
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={`Write something about this ${activeTab}...`}
                  className="w-full p-6 rounded-[2rem] bg-white/5 border-white/5 text-white font-bold placeholder:text-white/20 focus:ring-2 focus:ring-purple-500/50 transition-all h-32"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-2">
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
                    <div className="p-12 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/0 group-hover:bg-white/5 group-hover:border-purple-500/30 transition-all flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all">
                        <CloudArrowUpIcon className="w-8 h-8 text-white/20 group-hover:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">Select File</p>
                        <p className="text-[10px] text-white/20 font-bold uppercase mt-1">MP4, JPG, PNG supported</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative group rounded-[3rem] overflow-hidden border border-white/10">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-64 object-cover"
                        controls
                      />
                    )}
                    <button
                      onClick={() => {
                        setFile(null);
                        setAiSuggestions([]);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-red-500 transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Ready to upload</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-5 rounded-[2rem] bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-5 rounded-[2rem] bg-gradient-to-r from-purple-600 to-cyan-500 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
                >
                  {loading ? 'Sharing...' : `Share ${activeTab}`}
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