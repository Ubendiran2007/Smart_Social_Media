import api from './api';

export const postsAPI = {
  // Create post
  createPost: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Get feed posts with mood filtering
  getFeedPosts: (page = 1, limit = 10, mood = 'None', isProductivity = false) => 
    api.get(`/posts/feed?page=${page}&limit=${limit}&mood=${mood}&isProductivity=${isProductivity}`),


  // Like/Unlike post
  toggleLike: (postId) => api.put(`/posts/${postId}/like`),

  // Add comment
  addComment: (postId, text) => api.post(`/posts/${postId}/comment`, { text }),

  // Delete post
  deletePost: (postId) => api.delete(`/posts/${postId}`)
};