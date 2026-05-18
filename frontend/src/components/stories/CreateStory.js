import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CameraIcon, PhotoIcon, SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { storiesAPI } from '../../services/storiesAPI';
import { GlassCard, NeonButton, AIBadge } from '../ui/SiliconValley';
import { toast } from 'react-hot-toast';

const CreateStory = ({ onClose, onStoryCreated }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || loading) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      
      await storiesAPI.createStory(formData);
      toast.success('Neural Story Transmitted!');
      onStoryCreated();
    } catch (err) {
      toast.error('Transmission failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="relative w-full max-w-lg"
      >
        <GlassCard className="overflow-hidden border-purple-500/30">
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">New Neural Story</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Share a moment with the matrix</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div 
              className={`relative aspect-[9/16] rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${
                preview ? 'border-transparent' : 'border-white/10 hover:border-purple-500/50 bg-white/5'
              }`}
              onClick={() => !preview && fileInputRef.current.click()}
            >
              {preview ? (
                <>
                  {file.type.startsWith('video') ? (
                    <video src={preview} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={preview} className="w-full h-full object-cover" alt="" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => {setPreview(null); setFile(null);}} className="p-4 rounded-full bg-rose-500 text-white shadow-2xl">
                      <XMarkIcon className="w-8 h-8" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <PhotoIcon className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Drop Neural Fragment or Click to Upload</p>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />

            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">Abort</button>
              <NeonButton variant="purple" className="flex-1 py-4" type="submit" disabled={!file || loading}>
                {loading ? 'Transmitting...' : 'Establish Sync'}
              </NeonButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CreateStory;
