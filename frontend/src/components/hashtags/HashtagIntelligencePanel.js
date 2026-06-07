import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { hashtagAPI } from '../../services/hashtagAPI';
import { SparklesIcon, HashtagIcon, FireIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

// Simple debounce
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

const MOOD_COLORS = {
  Productive: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-400',
  Motivational: 'from-orange-500/20 to-red-500/20 border-orange-500/20 text-orange-400',
  Calm: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400',
  Learning: 'from-purple-500/20 to-violet-500/20 border-purple-500/20 text-purple-400',
  Funny: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/20 text-yellow-400',
  None: 'from-white/5 to-white/5 border-white/10 text-white/40',
};

/**
 * HashtagIntelligencePanel
 * 
 * Drop-in panel for the Create page that provides:
 * 1. Live hashtag suggestions as user types caption
 * 2. Detected mood badge
 * 3. Click-to-insert hashtags into caption
 * 4. Trending hashtags when caption is empty
 */
const HashtagIntelligencePanel = ({ caption, mood: activeMood, onInsertHashtag }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [detectedMood, setDetectedMood] = useState('None');
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | analyzing | ready

  // Load trending on mount
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const res = await hashtagAPI.getTrending(activeMood, 10);
        setTrending(res.data.trending || []);
      } catch {}
    };
    loadTrending();
  }, [activeMood]);

  // Debounced real-time suggestion fetch
  const fetchSuggestions = useCallback(
    debounce(async (text, mood) => {
      if (text.trim().length < 3) {
        setSuggestions([]);
        setDetectedMood('None');
        setPhase('idle');
        return;
      }
      setLoading(true);
      setPhase('analyzing');
      try {
        const [sugRes, analyzeRes] = await Promise.all([
          hashtagAPI.suggest(text, mood),
          hashtagAPI.analyze(text, mood),
        ]);
        setSuggestions(sugRes.data.hashtags || []);
        setDetectedMood(analyzeRes.data.emotionCategory || 'None');
        setPhase('ready');
      } catch {
        setPhase('idle');
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  useEffect(() => {
    fetchSuggestions(caption, activeMood);
  }, [caption, activeMood]);

  const hasSuggestions = suggestions.length > 0;
  const showTrending = !hasSuggestions && trending.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <HashtagIcon className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Hashtag Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Detected mood badge */}
          <AnimatePresence>
            {detectedMood !== 'None' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r border ${MOOD_COLORS[detectedMood] || MOOD_COLORS.None}`}
              >
                {detectedMood}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Analyzing indicator */}
          {loading && (
            <div className="flex gap-0.5 items-center">
              {[0,1,2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, 2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-0.5 h-2 bg-purple-400 rounded-full origin-bottom"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions / Trending */}
      <AnimatePresence mode="wait">
        {hasSuggestions ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-purple-400/70 flex items-center gap-1.5 px-1">
              <SparklesIcon className="w-3 h-3" />
              Live Suggestions — Click to insert
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tag, i) => (
                <motion.button
                  key={tag}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onInsertHashtag(`#${tag}`)}
                  className="group relative px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all"
                >
                  <span className="text-[11px] font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all">
                    #{tag}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : showTrending ? (
          <motion.div
            key="trending"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-400/70 flex items-center gap-1.5 px-1">
              <FireIcon className="w-3 h-3" />
              Trending Now — from the network
            </p>
            <div className="flex flex-wrap gap-2">
              {trending.map((t, i) => (
                <motion.button
                  key={t.tag}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onInsertHashtag(t.tag)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-orange-400/40 hover:bg-orange-400/5 transition-all"
                >
                  <span className="text-[11px] font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                    {t.tag}
                  </span>
                  <span className="text-[8px] text-white/20 font-black uppercase tracking-wider">
                    {t.count}×
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : phase === 'idle' && caption.trim().length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 rounded-2xl bg-white/2 border border-dashed border-white/5 text-center"
          >
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
              Start typing your caption to generate hashtags
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

/**
 * HashtagAutocomplete
 *
 * Attaches to a textarea. When user types #word, shows a floating
 * dropdown with hashtag completions from the database.
 */
export const HashtagAutocomplete = ({ value, onChange, mood = 'None', ...textareaProps }) => {
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);
  const textareaRef = useRef(null);

  const fetchAC = useCallback(
    debounce(async (partial, mood) => {
      if (partial.length < 2) { setAutocompleteItems([]); setShowDropdown(false); return; }
      try {
        const res = await hashtagAPI.autocomplete(partial, mood);
        setAutocompleteItems(res.data.suggestions || []);
        setShowDropdown((res.data.suggestions || []).length > 0);
      } catch { setShowDropdown(false); }
    }, 250),
    []
  );

  const handleChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    onChange(e); // propagate

    // Detect if cursor is inside a #word
    const textUpToCursor = val.slice(0, pos);
    const match = textUpToCursor.match(/#(\w*)$/);
    if (match) {
      setCursorPos(pos);
      fetchAC(match[1], mood);
    } else {
      setShowDropdown(false);
    }
  };

  const insertTag = (tag) => {
    const val = value;
    const pos = cursorPos;
    const textUpToCursor = val.slice(0, pos);
    const before = textUpToCursor.replace(/#\w*$/, '');
    const after = val.slice(pos);
    const newVal = `${before}${tag} ${after}`;
    // Fire synthetic change
    onChange({ target: { value: newVal } });
    setShowDropdown(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        {...textareaProps}
      />
      <AnimatePresence>
        {showDropdown && autocompleteItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute left-0 bottom-full mb-2 z-50 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-w-[200px]"
          >
            {autocompleteItems.map((item, i) => (
              <button
                key={item.tag}
                type="button"
                onMouseDown={() => insertTag(item.tag)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-500/15 transition-colors group"
              >
                <span className="text-sm font-bold text-cyan-400 group-hover:text-cyan-300">{item.tag}</span>
                {item.count > 0 && (
                  <span className="text-[9px] text-white/20 font-black uppercase ml-4 flex items-center gap-1">
                    <ArrowTrendingUpIcon className="w-3 h-3" /> {item.count}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * ClickableHashtag — wraps text and makes #tags navigable
 */
export const ClickableHashtags = ({ text, className = '' }) => {
  const navigate = useNavigate();
  if (!text) return null;
  const parts = text.split(/(#\w+)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <motion.span
            key={i}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hashtag/${encodeURIComponent(part.slice(1))}`);
            }}
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all font-bold inline-block"
          >
            {part}
          </motion.span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

/**
 * HashtagPill — a small clickable badge for a single tag
 */
export const HashtagPill = ({ tag, count, variant = 'default', className = '' }) => {
  const navigate = useNavigate();
  const cleanTag = tag.replace('#', '');

  const variants = {
    default: 'bg-white/5 border-white/5 text-white/40 hover:border-cyan-400/30 hover:text-cyan-400',
    trending: 'bg-orange-500/5 border-orange-500/10 text-orange-400 hover:border-orange-400/40 hover:bg-orange-500/10',
    active: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:border-cyan-400/50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(`/hashtag/${encodeURIComponent(cleanTag)}`)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${variants[variant]} ${className}`}
    >
      <span>#{cleanTag}</span>
      {count !== undefined && (
        <span className="opacity-40 text-[8px] font-black">{count}</span>
      )}
    </motion.button>
  );
};

export default HashtagIntelligencePanel;
