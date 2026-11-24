import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '../../context/GamificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const NOTIF_STYLES = {
  xp: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    bar: 'bg-violet-500'
  },
  levelUp: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    bar: 'bg-amber-500'
  },
  achievement: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    bar: 'bg-orange-500'
  },
  badge: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    bar: 'bg-emerald-500'
  }
};

const GamificationToasts = () => {
  const { notifications, dismissNotification } = useGamification();

  return (
    <div className="fixed bottom-6 right-6 z-[800] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notif) => {
          const style = NOTIF_STYLES[notif.type] || NOTIF_STYLES.xp;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-xl ${style.bg} ${style.border} ${style.glow}`}
            >
              {/* Icon */}
              <span className="text-2xl shrink-0 animate-bounce">{notif.icon}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground leading-snug">{notif.message}</p>
                {/* Countdown bar */}
                <div className="mt-2 h-0.5 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${style.bar}`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismissNotification(notif.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              >
                <XMarkIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GamificationToasts;
