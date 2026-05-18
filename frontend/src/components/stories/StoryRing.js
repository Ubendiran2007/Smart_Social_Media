import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StoryViewer from './StoryViewer';

const StoryRing = ({ user, stories }) => {
  const [showViewer, setShowViewer] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2 flex-shrink-0 group">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowViewer(true)}
          className="relative cursor-pointer"
        >
          {/* Neural Ring Effect */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-purple-500 via-cyan-400 to-purple-500 animate-[spin_4s_linear_infinite] p-1" />
          
          <div className="relative w-20 h-20 rounded-[2.2rem] bg-black p-1">
            <img
              src={getImageUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.username}`}
              alt={user.username}
              className="w-full h-full rounded-[1.8rem] object-cover border border-white/10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=9333ea&color=fff`;
              }}
            />
          </div>

          {/* Indicator */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-purple-600 border-2 border-black flex items-center justify-center text-[10px] font-black text-white shadow-lg">
            {stories.length}
          </div>
        </motion.div>
        
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-purple-400 transition-colors">
          {user.username}
        </span>
      </div>

      <AnimatePresence>
        {showViewer && (
          <StoryViewer 
            user={user} 
            stories={stories} 
            onClose={() => setShowViewer(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default StoryRing;