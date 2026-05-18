import api from './api';

export const chatAPI = {
  // Send message
  sendMessage: (receiverId, message) => 
    api.post('/chat/send', { receiverId, message }),

  // Get conversation
  getConversation: (userId, page = 1, limit = 50) => 
    api.get(`/chat/conversation/${userId}?page=${page}&limit=${limit}`),

  // Get all conversations
  getConversations: () => api.get('/chat/conversations'),

  // Mark as read
  markAsRead: (userId) => api.put(`/chat/read/${userId}`),

  // Get discovery/suggested users
  getDiscoveryUsers: () => api.get('/chat/discovery')
};