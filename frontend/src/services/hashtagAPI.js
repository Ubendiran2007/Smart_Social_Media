import api from './api';

export const hashtagAPI = {
  // Real-time suggestions while typing caption
  suggest: (caption, mood = 'None') =>
    api.post('/hashtags/suggest', { caption, mood }),

  // Trending hashtags from actual DB usage
  getTrending: (mood = 'None', limit = 15) =>
    api.get(`/hashtags/trending?mood=${mood}&limit=${limit}`),

  // All content for a given hashtag (#MERN, #AI etc.)
  getFeed: (tag, page = 1, limit = 20) =>
    api.get(`/hashtags/feed/${encodeURIComponent(tag.replace('#', ''))}?page=${page}&limit=${limit}`),

  // Autocomplete while typing #mer → #MERN
  autocomplete: (partial, mood = 'None') =>
    api.get(`/hashtags/autocomplete?q=${encodeURIComponent(partial)}&mood=${mood}`),

  // Full caption analysis before submit
  analyze: (caption, mood = 'None') =>
    api.post('/hashtags/analyze', { caption, mood }),
};
