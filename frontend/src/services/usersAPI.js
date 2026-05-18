import api from './api';

export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  toggleFollow: (userId) => api.put(`/users/${userId}/follow`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  updateMood: (mood) => api.put('/users/update-mood', { mood }),
  getWellness: () => api.get('/users/wellness'),
  syncWellness: (data) => api.put('/users/wellness/sync', data)
};
