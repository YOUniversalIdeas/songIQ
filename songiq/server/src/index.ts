import dotenv from 'dotenv'

// Load environment variables FIRST, before any other imports
dotenv.config({ path: process.env.NODE_ENV === 'development' ? './env.development' : '.env' })

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import path from 'path'
import { createServer } from 'http'
import WebSocketService from './services/websocketService'

// Debug: Check if YouTube API key is loaded
console.log('🔑 Environment check:')
console.log('YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? '✅ Loaded' : '❌ Not loaded')
console.log('LASTFM_API_KEY:', process.env.LASTFM_API_KEY ? '✅ Loaded' : '❌ Not loaded')
console.log('NODE_ENV:', process.env.NODE_ENV || 'development')

// Import routes
import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import songsRoutes from './routes/songs';
import lyricsRoutes from './routes/lyrics';
import adminRoutes from './routes/admin';
import paymentsRoutes from './routes/payments';
import userActivityRoutes from './routes/userActivity';
import spotifyRoutes from './routes/spotify';
// import youtubeMusicRoutes from './routes/youtubeMusic';
import marketSignalsRoutes from './routes/market';
import webhookRoutes from './routes/webhooks';
import successRoutes from './routes/success';
import recommendationsRoutes from './routes/recommendations';
import verificationRoutes from './routes/verification';

const app = express()
const server = createServer(app)
const PORT = parseInt(process.env.PORT || '3000', 10)

// Initialize WebSocket service
const webSocketService = new WebSocketService(server)

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:5001'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
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
// app.use('/api/youtube-music', youtubeMusicRoutes)
app.use('/api/success', successRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/user-activity', userActivityRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/lyrics', lyricsRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/verification', verificationRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  
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