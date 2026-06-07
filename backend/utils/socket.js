const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Store online users and room state
  const onlineUsers = new Map();
  const roomMembers = new Map(); // roomId -> Set of socketIds
  const roomMessages = new Map(); // roomId -> Array of messages (mock persistence for now)
  const roomPomodoro = new Map(); // roomId -> { state: 'work'|'break', timeRemaining, intervalId }

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);
    
    // Update user online status
    User.findByIdAndUpdate(socket.userId, { isOnline: true }).exec();

    // Join user to their own room for notifications
    socket.join(socket.userId);

    // Broadcast online status to followers
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      username: socket.user.username
    });

    // Handle private messaging
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, message } = data;
        
        // Save message to database
        const newMessage = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          message
        });

        await newMessage.populate('sender', 'username fullName avatar');
        await newMessage.populate('receiver', 'username fullName avatar');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        // Send back to sender
        socket.emit('messageSent', newMessage);

        // Create notification
        await Notification.create({
          recipient: receiverId,
          sender: socket.userId,
          type: 'message',
          message: `${socket.user.username} sent you a message`
        });

        // Send notification if receiver is online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newNotification', {
            type: 'message',
            message: `${socket.user.username} sent you a message`,
            sender: {
              _id: socket.userId,
              username: socket.user.username,
              avatar: socket.user.avatar
            }
          });
        }

      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          username: socket.user.username
        });
      }
    });

    socket.on('stopTyping', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStoppedTyping', {
          userId: socket.userId
        });
      }
    });

    // Handle real-time notifications for likes, comments, follows
    socket.on('sendNotification', async (data) => {
      try {
        const { recipientId, type, message, postId, reelId } = data;
        
        const notification = await Notification.create({
          recipient: recipientId,
          sender: socket.userId,
          type,
          message,
          postId,
          reelId
        });

        await notification.populate('sender', 'username fullName avatar');

        // Send to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newNotification', notification);
        }

      } catch (error) {
        console.error('Notification error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      // Remove from online users
      onlineUsers.delete(socket.userId);
      
      // Update user offline status
      User.findByIdAndUpdate(socket.userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      }).exec();

      // Leave any rooms
      for (const [roomId, members] of roomMembers.entries()) {
        if (members.has(socket.id)) {
          members.delete(socket.id);
          io.to(roomId).emit('roomMembersUpdate', { roomId, count: members.size });
        }
      }

      // Broadcast offline status
      socket.broadcast.emit('userOffline', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    // ─────────────────────────────────────────────────────────────────
    // CREATOR ROOMS LOGIC
    // ─────────────────────────────────────────────────────────────────

    socket.on('joinRoom', (data) => {
      const { roomId } = data;
      socket.join(roomId);

      if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Set());
      }
      roomMembers.get(roomId).add(socket.id);

      // Record room behavior signal for the recommendation engine
      const RecommendationService = require('../services/RecommendationService');
      RecommendationService.recordBehavior(socket.userId, { type: 'room', roomId }).catch(err => {
        console.error('Failed to record room behavior:', err);
      });

      // Broadcast active count to room
      io.to(roomId).emit('roomMembersUpdate', { roomId, count: roomMembers.get(roomId).size });
      
      // Optionally send recent messages
      if (roomMessages.has(roomId)) {
        socket.emit('roomHistory', { roomId, messages: roomMessages.get(roomId) });
      }
    });

    socket.on('leaveRoom', (data) => {
      const { roomId } = data;
      socket.leave(roomId);

      if (roomMembers.has(roomId)) {
        roomMembers.get(roomId).delete(socket.id);
        io.to(roomId).emit('roomMembersUpdate', { roomId, count: roomMembers.get(roomId).size });
      }
    });

    socket.on('sendRoomMessage', (data) => {
      const { roomId, message, type } = data; // type can be text, code, etc.

      const newMessage = {
        _id: Date.now().toString(),
        sender: {
          _id: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        message,
        type: type || 'text',
        createdAt: new Date()
      };

      if (!roomMessages.has(roomId)) roomMessages.set(roomId, []);
      roomMessages.get(roomId).push(newMessage);
      if (roomMessages.get(roomId).length > 100) roomMessages.get(roomId).shift();

      io.to(roomId).emit('newRoomMessage', { roomId, message: newMessage });
    });

    socket.on('roomTyping', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('userRoomTyping', { roomId, username: socket.user.username });
    });

    // Pomodoro Sync
    socket.on('startPomodoro', (data) => {
      const { roomId, durationMinutes } = data;
      // Broadcast to all users in the room that a timer started
      io.to(roomId).emit('pomodoroStarted', { 
        roomId, 
        durationMinutes, 
        startTime: Date.now(),
        startedBy: socket.user.username
      });
    });
  });

  return io;
};

module.exports = initializeSocket;