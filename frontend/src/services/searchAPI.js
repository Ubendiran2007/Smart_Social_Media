import api from './api';

export const searchAPI = {
  globalSearch: (query, mood = 'None') => api.get(`/search?q=${query}&mood=${mood}`),
  getTrending: (mood = 'None') => api.get(`/search/trending?mood=${mood}`)
};
