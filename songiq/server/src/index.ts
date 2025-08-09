import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'

// Load environment variables
dotenv.config()

// Import routes
import songRoutes from './routes/songs'
import analysisRoutes from './routes/analysis'
import marketRoutes from './routes/market'
import spotifyRoutes from './routes/spotify'
import successRoutes from './routes/success'
import paymentRoutes from './routes/payments'
import webhookRoutes from './routes/webhooks'
import authRoutes from './routes/auth'

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
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
app.use('/api/songs', songRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/success', successRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/webhooks', webhookRoutes)

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
    
    app.listen(PORT, () => {
      console.log(`🚀 songIQ server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

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

startServer() 