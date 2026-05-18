import api from './api';

export const storiesAPI = {
  // Create story
  createStory: (formData) => api.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Get stories
  getStories: (mood = 'None') => api.get(`/stories?mood=${mood}`),

  // View story
  viewStory: (storyId) => api.put(`/stories/${storyId}/view`),

  // Delete story
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`)
};