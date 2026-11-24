import api from './api';

export const gamificationAPI = {
  // Get the logged-in user's gamification profile
  getProfile: () => api.get('/gamification/profile'),

  // Get weekly leaderboards
  getLeaderboards: () => api.get('/gamification/leaderboards')
};
