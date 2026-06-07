import api from './api';

export const reelsAPI = {
  // Create reel
  createReel: (formData) => api.post('/reels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Get reels
  getReels: (limit = 5, mood = 'None', viewedIds = []) => 
    api.get(`/reels?limit=${limit}&mood=${mood}&viewed=${viewedIds.join(',')}`),

  // Like/Unlike reel
  toggleLike: (reelId) => api.put(`/reels/${reelId}/like`),

  // Add comment
  addComment: (reelId, text) => api.post(`/reels/${reelId}/comment`, { text }),

  // Increment view
  incrementView: (reelId) => api.put(`/reels/${reelId}/view`)
};