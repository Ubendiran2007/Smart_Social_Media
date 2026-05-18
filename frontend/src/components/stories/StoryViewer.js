import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { storiesAPI } from '../../services/storiesAPI';

const StoryViewer = ({ user, stories, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    // Reset progress when story changes
    setProgress(0);
    
    // Mark story as viewed
    storiesAPI.viewStory(currentStory._id).catch(console.error);

    const duration = currentStory.mediaType === 'video' ? 10000 : 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center">
      <div className="relative w-full max-w-lg aspect-[9/16] bg-neutral-900 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
        {/* Progress Bars */}
        <div className="absolute top-8 left-4 right-4 flex gap-2 z-50">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-12 left-6 right-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} 
              className="w-10 h-10 rounded-2xl border border-white/20"
              alt=""
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=9333ea&color=fff`;
              }}
            />
            <div>
              <p className="text-sm font-black text-white uppercase italic tracking-tighter">@{user.username}</p>
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Neural Story</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 transition-all">
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {currentStory.mediaType === 'video' ? (
            <video 
              src={currentStory.media} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
              onEnded={handleNext}
            />
          ) : (
            <img 
              src={currentStory.media} 
              className="w-full h-full object-cover" 
              alt="" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80';
              }}
            />
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Navigation Arrows (Desktop) */}
        <div className="hidden md:block">
          {currentIndex > 0 && (
            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
