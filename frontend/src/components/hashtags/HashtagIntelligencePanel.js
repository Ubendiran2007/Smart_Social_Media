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
          <HashtagIcon className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-foreground">
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
                className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-accent/10 border border-accent/20 text-accent"
              >
                {detectedMood}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Analyzing indicator */}
          {loading && (
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin" />
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
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 px-1">
              <SparklesIcon className="w-4 h-4" />
              Live Suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tag, i) => (
                <motion.button
                  key={tag}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onInsertHashtag(`#${tag}`)}
                  className="group relative px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-hover transition-colors"
                >
                  <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
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
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 px-1">
              <FireIcon className="w-4 h-4" />
              Trending Now
            </p>
            <div className="flex flex-wrap gap-2">
              {trending.map((t, i) => (
                <motion.button
                  key={t.tag}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onInsertHashtag(t.tag)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-hover transition-colors"
                >
                  <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                    {t.tag}
                  </span>
                  <span className="text-[10px] bg-surface-hover px-1.5 py-0.5 rounded text-muted-foreground font-semibold">
                    {t.count}
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
            className="px-4 py-3 rounded-xl bg-surface border border-dashed border-border text-center"
          >
            <p className="text-xs font-medium text-muted-foreground">
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
            className="absolute left-0 bottom-full mb-2 z-50 bg-surface border border-border rounded-xl overflow-hidden shadow-lg min-w-[200px]"
          >
            {autocompleteItems.map((item, i) => (
              <button
                key={item.tag}
                type="button"
                onMouseDown={() => insertTag(item.tag)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-surface-hover transition-colors group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-accent">{item.tag}</span>
                {item.count > 0 && (
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
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
            whileHover={{ y: -1 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hashtag/${encodeURIComponent(part.slice(1))}`);
            }}
            className="text-accent hover:opacity-80 cursor-pointer font-semibold inline-block transition-all"
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
    default: 'bg-surface border-border text-foreground hover:border-accent hover:text-accent',
    trending: 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500/20',
    active: 'bg-accent/10 border-accent/20 text-accent hover:bg-accent/20',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/hashtag/${encodeURIComponent(cleanTag)}`)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${variants[variant]} ${className}`}
    >
      <span>#{cleanTag}</span>
      {count !== undefined && (
        <span className="text-[10px] opacity-70 bg-black/10 px-1 rounded">{count}</span>
      )}
    </motion.button>
  );
};

export default HashtagIntelligencePanel;
