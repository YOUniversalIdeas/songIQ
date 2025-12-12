# 📚 songIQ Codebase Index

**Last Updated:** 2025-01-27  
**Purpose:** Comprehensive reference guide for the songIQ codebase architecture, systems, and components.

---

## 🏗️ Architecture Overview

### **Tech Stack**
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Real-time:** WebSocket (ws library)
- **Build:** Vite (frontend), TypeScript (backend)

### **Project Structure**
```
songIQ/
├── songiq/
│   ├── client/          # React frontend (port 3001)
│   │   ├── src/
│   │   │   ├── pages/   # Page components
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── contexts/   # React contexts
│   │   │   ├── hooks/     # Custom hooks
│   │   │   ├── services/  # Frontend services
│   │   │   └── utils/     # Utility functions
│   │   └── public/    # Static assets
│   │
│   └── server/         # Express backend (port 5001)
│       ├── src/
│       │   ├── routes/     # API route handlers
│       │   ├── models/     # MongoDB models
│       │   ├── services/   # Business logic services
│       │   ├── middleware/ # Express middleware
│       │   ├── config/     # Configuration
│       │   └── utils/      # Utility functions
│       └── scripts/    # Utility scripts
│
└── [root]/            # Documentation & deployment scripts
```

---

## 🗄️ Database Models

### **Core Models**

#### **User** (`models/User.ts`)
- Authentication & authorization
- Roles: `user`, `artist`, `producer`, `label`, `admin`, `superadmin`
- Subscription management (Stripe integration)
- Gamification (XP, levels, tiers, coins)
- Preferences & privacy settings
- Stats tracking

#### **Song** (`models/Song.ts`)
- User-uploaded songs
- Links to `AudioFeatures` and `Analysis`
- Release status & platform tracking
- Performance metrics reference

#### **AudioFeatures** (`models/AudioFeatures.ts`)
- Spotify-compatible audio features
- Tempo, key, mode, energy, danceability, etc.
- Used for analysis and predictions

#### **Analysis** (`models/Analysis.ts`)
- Success prediction scores (0-100)
- Market potential, social score
- Genre analysis, audience analysis
- Competitive analysis
- Production quality assessment
- Release recommendations

### **Charts Models**

#### **UnifiedArtist** (`models/UnifiedArtist.ts`)
- Aggregated artist data from multiple sources
- **Metrics Sources:**
  - Spotify: followers, popularity, growth
  - Last.fm: listeners, playcount, growth
  - ListenBrainz: listeners, listenCount
- **Scores:**
  - `compositeScore`: Overall ranking (0-100)
  - `momentumScore`: Growth/trending indicator (0-100)
  - `reachScore`: Audience size indicator (0-100)
- **Flags:**
  - `isIndependent`: Boolean flag for independent artists
- **Metadata:**
  - Genres, images, country, type, label
  - Score history tracking
- **External IDs:**
  - MusicBrainz ID
  - Spotify ID, Last.fm URL, ListenBrainz ID

#### **UnifiedTrack** (`models/UnifiedTrack.ts`)
- Aggregated track data from multiple sources
- **Links:** References `UnifiedArtist` via `artistId`
- **Metrics Sources:**
  - Spotify: popularity, playcount
  - Last.fm: listeners, playcount
- **Scores:**
  - `compositeScore`: Overall ranking (0-100)
  - `momentumScore`: Growth/trending indicator (0-100)
- **Metadata:**
  - Album, release date, genres, images (album art), duration
  - Score history tracking
- **External IDs:**
  - MusicBrainz ID
  - Spotify ID, Last.fm URL

### **Trading/Financial Models**

#### **Currency** (`models/Currency.ts`)
- Fiat, crypto, stablecoin support
- Exchange rates, price history

#### **Wallet** (`models/Wallet.ts`)
- Custodial & non-custodial wallets
- Multi-chain support (Ethereum, Polygon, BSC)

#### **Balance** (`models/Balance.ts`)
- Multi-currency balances per user
- Available vs locked funds

#### **TradingPair** (`models/TradingPair.ts`)
- Currency pairs for trading
- Orderbook data

#### **Order** (`models/Order.ts`)
- Market & limit orders
- Order status tracking

#### **Trade** (`models/Trade.ts`)
- Executed trade records
- P&L tracking

#### **Transaction** (`models/Transaction.ts`)
- Deposits & withdrawals
- Crypto & fiat transactions

### **Prediction Markets Models**

#### **Market** (`models/Market.ts`)
- User-created prediction markets
- Outcomes, prices, liquidity
- Resolution & payouts

#### **Position** (`models/Position.ts`)
- User positions in markets
- Shares, cost basis, P&L

#### **PriceHistory** (`models/PriceHistory.ts`)
- Historical price data for markets
- Used for charts

#### **Comment** (`models/Comment.ts`)
- Market discussions
- Threaded comments with likes

### **Social Models**

#### **Follow** (`models/Follow.ts`)
- User follow relationships
- Follower/following tracking

#### **Achievement** (`models/Achievement.ts`)
- Gamification achievements
- Badges, milestones

#### **Challenge** (`models/Challenge.ts`)
- User challenges
- Progress tracking

---

## 🔌 API Routes

### **Authentication** (`routes/auth.ts`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout

### **Charts** (`routes/charts.ts`)
**Public Endpoints:**
- `GET /api/charts/artists/top` - Top independent artists
- `GET /api/charts/artists/rising` - Rising artists
- `GET /api/charts/artists/genre/:genre` - Artists by genre
- `GET /api/charts/artists/search` - Search artists
- `GET /api/charts/artists/:id` - Artist details
- `GET /api/charts/artists/stats` - Chart statistics
- `GET /api/charts/tracks/top` - Top independent tracks
- `GET /api/charts/tracks/genre/:genre` - Tracks by genre
- `GET /api/charts/tracks/:id` - Track details
- `GET /api/charts/tracks/stats` - Track statistics

**Admin Endpoints:**
- `POST /api/charts/admin/import/artists/lastfm` - Import artists from Last.fm
- `POST /api/charts/admin/import/artists/genre` - Import artists by genre
- `POST /api/charts/admin/import/tracks/lastfm` - Import tracks from Last.fm
- `POST /api/charts/admin/import/tracks/genre` - Import tracks by genre
- `POST /api/charts/admin/update-metrics` - Update all metrics
- `POST /api/charts/admin/fetch-spotify-ids` - Fetch Spotify IDs for artists
- `POST /api/charts/admin/update-artist-images` - Update artist images
- `GET /api/charts/admin/test-spotify-search` - Test Spotify search

### **Songs** (`routes/songs.ts`)
- `POST /api/songs/upload` - Upload song
- `GET /api/songs` - List user's songs
- `GET /api/songs/:id` - Get song details
- `DELETE /api/songs/:id` - Delete song

### **Analysis** (`routes/analysis.ts`)
- `POST /api/analysis/:songId` - Analyze song
- `GET /api/analysis/:songId` - Get analysis results

### **Trading** (`routes/trading.ts`)
- `GET /api/trading/pairs` - List trading pairs
- `GET /api/trading/pairs/:id/orderbook` - Get orderbook
- `POST /api/trading/orders/market` - Place market order
- `POST /api/trading/orders/limit` - Place limit order
- `GET /api/trading/orders` - Get user orders
- `DELETE /api/trading/orders/:id` - Cancel order

### **Currencies** (`routes/currencies.ts`)
- `GET /api/currencies` - List currencies
- `GET /api/currencies/user/balances` - User balances
- `GET /api/currencies/user/portfolio` - Portfolio summary
- `GET /api/currencies/convert` - Convert currencies

### **Markets** (`routes/markets.ts`)
- `GET /api/markets` - List markets
- `GET /api/markets/:id` - Market details
- `POST /api/markets` - Create market
- `POST /api/markets/:id/trade` - Execute trade
- `GET /api/markets/:id/price-history` - Price history

### **Social** (`routes/social.ts`)
- `POST /api/social/follow/:userId` - Follow user
- `DELETE /api/social/follow/:userId` - Unfollow user
- `GET /api/social/followers/:userId` - Get followers
- `GET /api/social/following/:userId` - Get following
- `GET /api/social/feed` - Social feed

---

## 🔧 Services

### **Charts System**

#### **chartDataAggregator.ts**
- `importFromLastfm(limit)` - Import top artists from Last.fm
- `importByGenre(genre, limit)` - Import artists by genre
- `updateAllArtistMetrics()` - Update metrics from all sources
- `fetchSpotifyIdsForArtists()` - Fetch missing Spotify IDs
- `updateArtistImages()` - Update artist images from Spotify

#### **trackDataAggregator.ts**
- `importFromLastfm(limit)` - Import top tracks from Last.fm
- `importByGenre(genre, limit)` - Import tracks by genre
- `updateAllTrackMetrics()` - Update track metrics from all sources
- Creates artists if they don't exist
- Only imports tracks from independent artists

#### **chartScoringEngine.ts**
- `updateAllArtistScores(weights)` - Recalculate all artist scores
- `updateAllTrackScores()` - Recalculate all track scores
- `updateArtistScore(artistId, weights)` - Update single artist
- `updateTrackScore(trackId)` - Update single track
- **Scoring Components:**
  - **Composite Score:** Weighted combination of reach, engagement, cross-platform presence
  - **Momentum Score:** Growth indicators, engagement metrics, recent activity
  - **Reach Score:** Audience size across platforms

#### **independentArtistDetector.ts**
- `detectIndependent(artist)` - Determine if artist is independent
- `updateAllIndependentFlags()` - Update flags for all artists
- **Thresholds:**
  - Spotify followers < 500K
  - Spotify popularity < 65
  - Last.fm listeners < 300K
  - Minimum momentum > 5

#### **chartUpdateScheduler.ts**
- **Daily (2 AM):** Full metrics update (artists + tracks)
- **Daily (3 AM):** Score recalculation (artists + tracks)
- **Weekly (Sunday 1 AM):** Import new artists
- **Weekly (Sunday 2 AM):** Import new tracks
- **Hourly:** Quick update for top 100 artists & top 50 tracks

### **External API Services**

#### **spotifyService.ts**
- OAuth client credentials flow
- Automatic token refresh
- Rate limiting (25 req/sec)
- Methods:
  - `searchTracks(query, limit)`
  - `searchArtists(query, limit)`
  - `getArtist(spotifyId)`
  - `getTrack(spotifyId)`
  - `getTrackAudioFeatures(spotifyId)`

#### **lastfmService.ts**
- Rate limiting (5 req/sec)
- Methods:
  - `getTopTracks(limit)`
  - `getTopArtists(limit)`
  - `getTopTracksByTag(tag, limit)`
  - `getTrackInfo(trackName, artistName)`
  - `getArtistInfo(artistName)`

#### **musicbrainzService.ts**
- Artist lookup by name
- Extract external IDs (Spotify, etc.)
- Methods:
  - `findOrCreateArtistId(name)`
  - `getArtistById(mbid)`
  - `extractExternalIds(artist)`

### **Trading Services**

#### **matchingEngine.ts**
- Order matching algorithm
- Market & limit order execution
- Orderbook management
- Trade execution broadcasting

#### **currencyConversionService.ts**
- Real-time price feeds (CoinGecko)
- Fiat exchange rates
- Portfolio valuation

#### **blockchainService.ts**
- Web3 integration (ethers.js)
- Multi-chain support
- Wallet operations

### **WebSocket Services**

#### **websocketService.ts**
- General WebSocket server (`/ws`)
- Client connection management
- Message broadcasting

#### **tradingWebSocketService.ts**
- Trading WebSocket server (`/ws/trading`)
- JWT authentication
- Channel subscriptions:
  - `orderbook:{pairId}`
  - `ticker:{pairId}`
  - `trades:{pairId}`
  - `balance:{userId}`
  - `orders:{userId}`
- Heartbeat mechanism

#### **realtimeTradingService.ts**
- Auto-broadcasts orderbook updates (2s)
- Auto-broadcasts price updates (5s)
- Trade execution monitoring

---

## 🎨 Frontend Pages

### **Public Pages**
- `/` - HomePage
- `/charts` - ChartsPage (Artists & Songs tabs)
- `/charts/artist/:id` - ChartArtistPage
- `/markets` - MarketsHub
- `/markets/:id` - MarketDetailPage
- `/profile/:userId` - UserProfilePage
- `/auth` - AuthPage (login/signup)

### **Authenticated Pages**
- `/dashboard` - DashboardPage
- `/upload` - UploadPage
- `/analysis/:songId` - AnalysisPage
- `/recommendations` - RecommendationsPage
- `/trends` - TrendsPage
- `/profile` - ProfilePage
- `/pricing` - PricingPage
- `/portfolio` - PortfolioPage
- `/wallets` - WalletsPage
- `/trading` - TradingPageRealtime
- `/exchange` - CurrencyExchangePage
- `/transactions` - TransactionsPage

### **Admin Pages**
- `/admin` - AdminPage

---

## 🔐 Authentication & Authorization

### **Middleware**

#### **auth.ts**
- `authenticateToken` - JWT token verification
- Extracts user ID and email from token
- Sets `req.user` object

#### **adminAuth.ts**
- `requireAdminOrSuperAdmin` - Admin access check
- `requireSuperAdmin` - Super admin only
- Verifies user role from database

### **Frontend Auth**

#### **AuthProvider.tsx**
- React context for authentication state
- Token management (localStorage/sessionStorage)
- Auto token refresh
- User profile fetching

#### **VerificationGuard.tsx**
- Route protection based on auth status
- Email verification check
- Public routes: `/charts/*`, `/auth`, `/verify`

---

## 📊 Charts System Flow

### **Data Import Flow**
1. **Manual Import:**
   - Admin triggers `/api/charts/admin/import/artists/lastfm`
   - `chartDataAggregator.importFromLastfm()` fetches from Last.fm
   - Creates/updates `UnifiedArtist` documents
   - Fetches MusicBrainz ID if missing
   - Extracts Spotify ID from MusicBrainz
   - Fetches Spotify metrics (followers, popularity, images)
   - Determines `isIndependent` flag
   - Calculates initial scores

2. **Track Import:**
   - Admin triggers `/api/charts/admin/import/tracks/lastfm`
   - `trackDataAggregator.importFromLastfm()` fetches from Last.fm
   - For each track:
     - Finds or creates artist
     - Determines if artist is independent
     - Only imports if `isIndependent: true`
     - Fetches Last.fm track info (listeners, playcount)
     - Searches Spotify for album art
     - Creates `UnifiedTrack` document
     - Links to `UnifiedArtist` via `artistId`

### **Automatic Update Flow**
1. **Daily Metrics Update (2 AM):**
   - `chartDataAggregator.updateAllArtistMetrics()`
   - `trackDataAggregator.updateAllTrackMetrics()`
   - Updates Last.fm listeners/playcount
   - Updates Spotify followers/popularity
   - Fetches missing album art

2. **Daily Score Recalculation (3 AM):**
   - `chartScoringEngine.updateAllArtistScores()`
   - `chartScoringEngine.updateAllTrackScores()`
   - `independentArtistDetector.updateAllIndependentFlags()`
   - Recalculates composite, momentum, reach scores
   - Updates score history

3. **Weekly Import (Sunday 1-2 AM):**
   - Imports new artists (100) + by genre
   - Imports new tracks (100)
   - Recalculates scores

4. **Hourly Quick Update:**
   - Updates top 100 artists (Spotify metrics)
   - Updates top 50 track scores

### **Scoring Algorithm**

#### **Composite Score (0-100)**
- **Reach (40%):** Spotify followers, Last.fm listeners
- **Engagement (30%):** Spotify popularity, Last.fm playcount/listeners ratio
- **Cross-platform (20%):** Presence on multiple platforms
- **Momentum (10%):** Recent growth indicators

#### **Momentum Score (0-100)**
- **Spotify popularity (40%)**
- **Last.fm listeners (30%)**
- **Last.fm playcount (20%)**
- **Engagement ratio (10%):** Plays per listener
- **Variation:** Name hash for variation when metrics are similar

#### **Reach Score (0-100)**
- Normalized audience size across platforms
- Weighted by platform importance

---

## 🌐 External API Integrations

### **Spotify API**
- **Purpose:** Artist/track metrics, album art, audio features
- **Auth:** Client credentials flow
- **Rate Limit:** 25 requests/second
- **Key Endpoints:**
  - Search tracks/artists
  - Get artist (followers, popularity, images)
  - Get track (popularity, album, images)
  - Get audio features

### **Last.fm API**
- **Purpose:** Chart data, listener counts, playcounts
- **Auth:** API key
- **Rate Limit:** 5 requests/second
- **Key Endpoints:**
  - `chart.gettoptracks` - Top tracks
  - `chart.gettopartists` - Top artists
  - `tag.gettoptracks` - Tracks by genre
  - `track.getinfo` - Track details (listeners, playcount)

### **MusicBrainz API**
- **Purpose:** Canonical artist identification, external ID extraction
- **Auth:** User agent header
- **Rate Limit:** 1 request/second
- **Key Endpoints:**
  - Artist search by name
  - Get artist by MBID
  - Extract Spotify IDs from relations

---

## 🔄 WebSocket System

### **Connection Flow**
1. Client connects: `ws://localhost:5001/ws/trading?token=JWT_TOKEN`
2. Server authenticates JWT token
3. Connection established, client ID assigned
4. Client subscribes to channels:
   ```json
   {
     "type": "subscribe",
     "channel": "orderbook:ETH_USDC"
   }
   ```
5. Server broadcasts updates to subscribed clients

### **Channels**
- **Public:**
  - `orderbook:{pairId}` - Orderbook updates
  - `ticker:{pairId}` - Price updates
  - `trades:{pairId}` - Recent trades
- **Private (auth required):**
  - `balance:{userId}` - Balance changes
  - `orders:{userId}` - Order status updates

### **Update Intervals**
- Orderbook: 2 seconds
- Price ticker: 5 seconds
- Trade execution: Immediate
- Balance changes: Immediate

---

## 📝 Key Configuration

### **Environment Variables**
```bash
# Database
MONGODB_URI=mongodb://...

# Authentication
JWT_SECRET=...

# External APIs
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
LASTFM_API_KEY=...
YOUTUBE_API_KEY=...

# Server
PORT=5001
NODE_ENV=development|production

# Charts
ENABLE_CHART_SCHEDULER=true
```

### **Ports**
- Frontend: `3001`
- Backend: `5001`
- WebSocket: `5001` (same as backend)

---

## 🚀 Deployment

### **Server Startup**
1. Load environment variables
2. Connect to MongoDB
3. Initialize Express app
4. Setup middleware (CORS, helmet, rate limiting)
5. Register API routes
6. Initialize WebSocket services
7. Start chart update scheduler
8. Start HTTP server

### **Frontend Build**
- Vite build system
- Code splitting (lazy loading)
- PWA support (service worker)
- Production optimizations

---

## 📚 Documentation Files

### **Charts Documentation**
- `CHARTS_COMPLETE_GUIDE.md` - Complete charts system guide
- `CHARTS_UPDATE_SYSTEM.md` - Automatic update system
- `CHARTS_TESTING_GUIDE.md` - Testing procedures

### **API Setup**
- `SPOTIFY_CREDENTIALS_SETUP.md` - Spotify API setup
- `LASTFM_SETUP.md` - Last.fm API setup
- `API_KEYS_SETUP_GUIDE.md` - All API keys guide

### **Deployment**
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Production setup
- `STAGING_DEPLOYMENT_GUIDE.md` - Staging setup

---

## 🎯 Key Features

### **Charts System**
✅ Independent artist detection  
✅ Multi-source data aggregation (Spotify, Last.fm, MusicBrainz)  
✅ Automatic daily/weekly updates  
✅ Composite, momentum, and reach scoring  
✅ Genre-based filtering  
✅ Artist and track charts  
✅ Album art and artist images  

### **Trading System**
✅ Multi-currency support  
✅ Market & limit orders  
✅ Real-time orderbook  
✅ WebSocket updates  
✅ Portfolio tracking  
✅ Wallet management  

### **Music Analysis**
✅ Audio feature extraction  
✅ Genre classification  
✅ Success prediction  
✅ Market comparison  
✅ Lyrics analysis  

### **Social Features**
✅ User profiles  
✅ Follow system  
✅ Comments & discussions  
✅ Leaderboards  
✅ Achievements  

---

## 🔍 Quick Reference

### **Find Chart-Related Code**
- Models: `server/src/models/UnifiedArtist.ts`, `UnifiedTrack.ts`
- Services: `server/src/services/chartDataAggregator.ts`, `trackDataAggregator.ts`, `chartScoringEngine.ts`
- Routes: `server/src/routes/charts.ts`
- Frontend: `client/src/pages/ChartsPage.tsx`

### **Find Trading Code**
- Models: `server/src/models/Currency.ts`, `Order.ts`, `Trade.ts`
- Services: `server/src/services/matchingEngine.ts`, `tradingWebSocketService.ts`
- Routes: `server/src/routes/trading.ts`
- Frontend: `client/src/pages/TradingPageRealtime.tsx`

### **Find Auth Code**
- Middleware: `server/src/middleware/auth.ts`, `adminAuth.ts`
- Routes: `server/src/routes/auth.ts`
- Frontend: `client/src/components/AuthProvider.tsx`, `VerificationGuard.tsx`

---

**This index is maintained to provide a comprehensive overview of the codebase. Update as new features are added.**


