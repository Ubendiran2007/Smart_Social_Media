import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
      });

      newSocket.on('userOnline', (data) => {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      newSocket.on('userOffline', (data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });

      newSocket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.success(notification.message);
      });

      newSocket.on('newMessage', (message) => {
        // Handle new message
        toast.success(`New message from ${message.sender.username}`);
      });

      newSocket.on('userTyping', (data) => {
        // Handle typing indicator
      });

      newSocket.on('userStoppedTyping', (data) => {
        // Handle stop typing
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [isAuthenticated, token]);

  const sendMessage = (receiverId, message) => {
    if (socket) {
      socket.emit('sendMessage', { receiverId, message });
    }
  };

  const sendNotification = (recipientId, type, message, postId = null, reelId = null) => {
    if (socket) {
      socket.emit('sendNotification', {
        recipientId,
        type,
        message,
        postId,
        reelId
      });
    }
  };

  const startTyping = (receiverId) => {
    if (socket) {
      socket.emit('typing', { receiverId });
    }
  };

  const stopTyping = (receiverId) => {
    if (socket) {
      socket.emit('stopTyping', { receiverId });
    }
  };

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('joinRoom', { roomId });
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leaveRoom', { roomId });
    }
  };

  const sendRoomMessage = (roomId, message, type = 'text') => {
    if (socket) {
      socket.emit('sendRoomMessage', { roomId, message, type });
    }
  };

  const startPomodoro = (roomId, durationMinutes) => {
    if (socket) {
      socket.emit('startPomodoro', { roomId, durationMinutes });
    }
  };

  const value = {
    socket,
    onlineUsers,
    notifications,
    sendMessage,
    sendNotification,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    startPomodoro,
    setNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};