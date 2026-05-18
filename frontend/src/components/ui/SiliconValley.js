import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Silicon Valley Standard Glass Card
 * Features adaptive blur, high saturation, and hover elevations.
 */
export const GlassCard = ({ children, className, hover = true, ...props }) => (
  <motion.div
    whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } : {}}
    className={cn(
      "relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-500",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * Futuristic Action Button
 * Features magnetic hover effects and neon glow.
 */
export const NeonButton = ({ children, variant = 'purple', className, ...props }) => {
  const variants = {
    purple: "bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)]",
    cyan: "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]",
    rose: "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_40px_rgba(244,63,94,0.6)]"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-8 py-3 rounded-2xl font-bold text-white uppercase tracking-widest text-[10px] transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Adaptive AI Badge
 * Shimmers when active.
 */
export const AIBadge = ({ children, className }) => (
  <div className={cn(
    "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-tighter text-purple-400 overflow-hidden relative",
    "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:translate-x-[-100%] after:animate-[shimmer_2s_infinite]",
    className
  )}>
    {children}
  </div>
);
