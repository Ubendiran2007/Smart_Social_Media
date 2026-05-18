import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
);

export const PostSkeleton = () => (
  <div className="glass-card mb-12 overflow-hidden border-white/5">
    <div className="p-6 flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="aspect-video w-full rounded-none" />
    <div className="p-8 space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24 rounded-2xl" />
        <Skeleton className="h-10 w-24 rounded-2xl" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const ReelSkeleton = () => (
  <div className="h-screen w-full bg-black relative flex items-center justify-center">
    <motion.div 
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="w-full h-full bg-gradient-to-br from-purple-900/20 to-cyan-900/20"
    />
    <div className="absolute bottom-20 left-10 space-y-4 w-2/3">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

export const StoryCircleSkeleton = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-16 h-16 rounded-full border-2 border-white/5 p-1 animate-pulse">
      <div className="w-full h-full rounded-full bg-white/5" />
    </div>
    <Skeleton className="h-2 w-12" />
  </div>
);
