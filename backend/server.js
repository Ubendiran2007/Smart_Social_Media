const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const initializeSocket = require('./utils/socket');

// Import routes
const authRoutes = require('./routes/auth/authRoutes');
const postRoutes = require('./routes/posts/postRoutes');
const storyRoutes = require('./routes/stories/storyRoutes');
const reelRoutes = require('./routes/reels/reelRoutes');
const chatRoutes = require('./routes/chat/chatRoutes');
const notificationRoutes = require('./routes/notifications/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/ai/aiRoutes');


const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Initialize Socket.IO
const io = initializeSocket(server);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://ui-avatars.com", "https://source.unsplash.com"],
      mediaSrc: ["'self'", "https://player.vimeo.com", "https://vimeo.com", "https://*.vimeo.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

// Rate limiting - exclude uploads
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path.startsWith('/uploads')
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Disable helmet for uploads to allow video streaming
app.use('/uploads', (req, res, next) => {
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-Frame-Options');
  next();
});

// Static files with proper headers for video
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

const searchRoutes = require('./routes/searchRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});