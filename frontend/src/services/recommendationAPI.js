import api from './api';

export const recommendationAPI = {
  // Personalized ranked feed
  getFeed: (mood = 'None', page = 1, limit = 10, focusMode = false) =>
    api.get('/recommendations/feed', { params: { mood, page, limit, focusMode } }),

  // Personalized reels queue
  getReels: (mood = 'None', limit = 10, excludeIds = []) =>
    api.get('/recommendations/reels', { params: { mood, limit, excludeIds: excludeIds.join(',') } }),

  // Creator suggestions
  getCreators: (mood = 'None', limit = 6) =>
    api.get('/recommendations/creators', { params: { mood, limit } }),

  // Hashtag suggestions + trending
  getHashtags: (mood = 'None') =>
    api.get('/recommendations/hashtags', { params: { mood } }),

  // Room suggestions
  getRooms: (mood = 'None') =>
    api.get('/recommendations/rooms', { params: { mood } }),

  // Aggregated For You panel (creators + hashtags + rooms in 1 call)
  getForYou: (mood = 'None') =>
    api.get('/recommendations/for-you', { params: { mood } }),

  // Record a user behavior event
  recordBehavior: (type, payload = {}) =>
    api.post('/recommendations/behavior', { type, ...payload }),
};
