import api from './api';

export const aiAPI = {
  analyzeText:       (text) => api.post('/ai/analyze', { text }),
  getSuggestions:    (mood) => api.post('/ai/suggestions', { mood }),
  getCommsAnalytics: ()     => api.get('/ai/comms-analytics'),
};
