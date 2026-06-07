import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Standard SaaS Card
 * Clean, flat, subtle border with hover elevation. Replaces the old heavy glassmorphism.
 */
export const GlassCard = ({ children, className, hover = true, ...props }) => (
  <motion.div
    whileHover={hover ? { y: -2 } : {}}
    className={cn(
      "card-base",
      hover && "card-hover",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * Professional Action Button
 * Clean solid colors, standard hover states instead of excessive neon glow.
 */
export const NeonButton = ({ children, variant = 'primary', className, ...props }) => {
  const isSecondary = variant === 'secondary';
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        isSecondary ? "btn-secondary" : "btn-primary",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Minimal Data Badge
 * Clean, subtle pill design for metadata or labels.
 */
export const AIBadge = ({ children, className }) => (
  <div className={cn(
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-hover border border-border text-[11px] font-semibold text-muted-foreground",
    className
  )}>
    {children}
  </div>
);
