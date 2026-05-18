import api from './api';

export const notificationsAPI = {
  // Get notifications
  getNotifications: (page = 1, limit = 20) => 
    api.get(`/notifications?page=${page}&limit=${limit}`),

  // Mark as read
  markAsRead: (notificationId) => 
    api.put(`/notifications/${notificationId}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),

  // Delete notification
  deleteNotification: (notificationId) => 
    api.delete(`/notifications/${notificationId}`)
};