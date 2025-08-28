// Import routes
import authRoutes from './routes/auth'
import songsRoutes from './routes/songs'
import analysisRoutes from './routes/analysis'
import adminRoutes from './routes/admin'
import userActivityRoutes from './routes/userActivity'
import paymentsRoutes from './routes/payments'
import webhooksRoutes from './routes/webhooks'
import lyricsRoutes from './routes/lyrics'
import marketRoutes from './routes/market'
import spotifyRoutes from './routes/spotify'
import successRoutes from './routes/success'

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/songs', songsRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user-activity', userActivityRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/webhooks', webhooksRoutes)
app.use('/api/lyrics', lyricsRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/success', successRoutes)
