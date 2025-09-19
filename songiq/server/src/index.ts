// Load environment variables FIRST, before any other imports
import { loadEnvironment, validateRequiredEnvVars, logEnvironmentStatus } from './utils/envLoader';

// Load environment configuration
const envResult = loadEnvironment();

if (!envResult.success) {
  console.error('❌ Failed to load environment configuration:', envResult.error);
  process.exit(1);
}

// Log environment status
logEnvironmentStatus();

// Validate required environment variables
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = validateRequiredEnvVars(requiredVars);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables. Server cannot start.');
  process.exit(1);
}

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import * as path from 'path'
import { createServer } from 'http'
import WebSocketService from './services/websocketService'

// Additional API key validation (optional services)
const optionalVars = ['YOUTUBE_API_KEY', 'LASTFM_API_KEY', 'SPOTIFY_CLIENT_ID'];
const missingOptional = validateRequiredEnvVars(optionalVars);
if (missingOptional.length > 0) {
  console.warn('⚠️  Some optional API keys are missing. Some features may not work:', missingOptional);
}

// Import routes
import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import songsRoutes from './routes/songs';
import lyricsRoutes from './routes/lyrics';
import adminRoutes from './routes/admin';
import paymentsRoutes from './routes/payments';
import userActivityRoutes from './routes/userActivity';
import spotifyRoutes from './routes/spotify';
import youtubeMusicRoutes from './routes/youtubeMusic';
import marketSignalsRoutes from './routes/market';
import webhookRoutes from './routes/webhooks';
import successRoutes from './routes/success';
import recommendationsRoutes from './routes/recommendations';
import verificationRoutes from './routes/verification';
import contactRoutes from './routes/contact';

const app = express()
const server = createServer(app)
const PORT = parseInt(process.env.PORT || '5001', 10)

// Initialize WebSocket service
const webSocketService = new WebSocketService(server)

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://songiq.ai'] 
    : ['http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}))

// Handle preflight requests
app.options('*', cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.round(15 * 60 * 1000 / 1000) // seconds
    });
  }
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Compression middleware
app.use(compression())

// Static file serving for uploaded audio files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq'
    await mongoose.connect(mongoURI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    console.log('Starting server without database connection...')
    // Don't exit, just continue without database
  }
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/songs', songsRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/market', marketSignalsRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/youtube-music', youtubeMusicRoutes)
app.use('/api/success', successRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/user-activity', userActivityRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/lyrics', lyricsRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/verification', verificationRoutes)
app.use('/api/contact', contactRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? `${process.env.YOUTUBE_API_KEY.substring(0, 15)}...` : 'Not set',
    YOUTUBE_API_KEY_LENGTH: process.env.YOUTUBE_API_KEY?.length || 0,
    IS_PLACEHOLDER: process.env.YOUTUBE_API_KEY === 'your_youtube_api_key_here',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  });
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err.stack)
  
  // Ensure CORS headers are set even on errors
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use('*', (req, res) => {
  // Ensure CORS headers are set even on 404 errors
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

// Start server
const startServer = async () => {
  try {
    await connectDB()
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 songIQ server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/api/health`)
      console.log(`🔌 WebSocket service: ws://0.0.0.0:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await mongoose.connection.close()
  console.log('MongoDB connection closed')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await mongoose.connection.close()
  console.log('MongoDB connection closed')
  process.exit(0)
}) 