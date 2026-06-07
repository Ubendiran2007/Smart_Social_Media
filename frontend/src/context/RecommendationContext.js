import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useMood } from './MoodContext';
import { useWellness } from './WellnessContext';
import { recommendationAPI } from '../services/recommendationAPI';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  RecommendationContext
 *  ───────────────────────────────────────────────────────────────────────
 *  Central personalization layer. Loads and caches:
 *    • suggestedCreators   — mood + skill matched accounts to follow
 *    • suggestedHashtags   — personalized + trending topics
 *    • trendingHashtags    — platform-wide trending tags
 *    • recommendedRooms    — mood + wellness aware room list
 *    • recommendedRoom     — top single room to highlight
 *    • forYouReason        — human-readable explanation ("Because you love learning")
 *
 *  Also exposes:
 *    • recordBehavior(type, payload) — fire-and-forget behavior events
 *    • refresh()                     — force re-fetch on mood change
 * ══════════════════════════════════════════════════════════════════════════
 */

const RecommendationContext = createContext();

export const RecommendationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { activeMood } = useMood();
  const { focusMode, burnoutScore } = useWellness();

  const [suggestedCreators,  setSuggestedCreators]  = useState([]);
  const [suggestedHashtags,  setSuggestedHashtags]  = useState([]);
  const [trendingHashtags,   setTrendingHashtags]   = useState([]);
  const [recommendedRooms,   setRecommendedRooms]   = useState([]);
  const [recommendedRoom,    setRecommendedRoom]    = useState(null);
  const [forYouReason,       setForYouReason]       = useState('Trending on Sentient');
  const [loading,            setLoading]            = useState(false);
  const [lastMood,           setLastMood]           = useState(null);

  // Debounce ref so rapid mood changes don't fire many requests
  const debounceRef = useRef(null);

  const loadForYouPanel = useCallback(async (mood) => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      const res = await recommendationAPI.getForYou(mood);
      const d = res.data;
      if (d.success) {
        setSuggestedCreators(d.creators  || []);
        setSuggestedHashtags(d.hashtags  || []);
        setTrendingHashtags(d.trendingHashtags || []);
        setRecommendedRooms(d.rooms      || []);
        setRecommendedRoom(d.recommendedRoom || null);
        setForYouReason(d.reason         || 'Trending on Sentient');
        setLastMood(mood);
      }
    } catch (err) {
      console.warn('RecommendationContext: for-you panel failed, using fallback', err.message);
      // Graceful degradation — static mood-based fallback
      const fallback = {
        Productive:   { hashtags: ['#coding','#startup','#buildinpublic','#developer','#productivity'], reason: "Because you're in Productive mode" },
        Learning:     { hashtags: ['#learning','#tutorial','#education','#study','#ai'],                reason: 'Because you love learning' },
        Motivational: { hashtags: ['#motivation','#success','#discipline','#hustle','#goals'],          reason: 'To fuel your motivation' },
        Calm:         { hashtags: ['#wellness','#nature','#mindfulness','#peace','#aesthetic'],          reason: 'For a calmer experience' },
        Funny:        { hashtags: ['#memes','#humor','#relatable','#comedy','#trending'],               reason: 'Because you need a laugh' },
        None:         { hashtags: ['#sentient','#creators','#tech','#ai','#buildinpublic'],             reason: 'Trending on Sentient' }
      };
      const fb = fallback[mood] || fallback.None;
      setSuggestedHashtags(fb.hashtags);
      setTrendingHashtags(fb.hashtags.slice(0, 3));
      setForYouReason(fb.reason);
      setLastMood(mood);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Re-load when mood or focus mode changes — debounced 400 ms
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeMood === lastMood && !loading) return; // skip if same mood

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadForYouPanel(activeMood);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [activeMood, isAuthenticated, focusMode]);

  /**
   * recordBehavior — fire-and-forget; silently updates the user's behavior
   * profile on the backend without blocking the UI.
   * 
   * Usage examples:
   *   recordBehavior('like',   { hashtags: ['#coding'], mood: 'Productive', creatorId: '...' })
   *   recordBehavior('watch',  { mood: 'Learning' })
   *   recordBehavior('search', { query: 'React hooks' })
   *   recordBehavior('room',   { roomId: 'room-coding' })
   */
  const recordBehavior = useCallback((type, payload = {}) => {
    if (!isAuthenticated) return;
    recommendationAPI.recordBehavior(type, payload).catch(() => {
      // Silently fail — behavior tracking must never interrupt the user
    });
  }, [isAuthenticated]);

  const refresh = useCallback(() => {
    loadForYouPanel(activeMood);
  }, [activeMood, loadForYouPanel]);

  return (
    <RecommendationContext.Provider value={{
      suggestedCreators,
      suggestedHashtags,
      trendingHashtags,
      recommendedRooms,
      recommendedRoom,
      forYouReason,
      loading,
      recordBehavior,
      refresh
    }}>
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendations = () => {
  const ctx = useContext(RecommendationContext);
  if (!ctx) throw new Error('useRecommendations must be used within RecommendationProvider');
  return ctx;
};
