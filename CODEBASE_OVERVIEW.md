# 📚 SongIQ Codebase Overview

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 7.0.6
- **Routing**: React Router DOM 6.8.0
- **Styling**: Tailwind CSS 3.2.7
- **State Management**: React Context API (AuthProvider, DarkModeContext, TradingWebSocketContext)
- **HTTP Client**: Native `fetch` API (no axios wrapper)
- **Charts**: 
  - Chart.js 4.5.0 with react-chartjs-2
  - Recharts 3.3.0 (for price history)
- **Forms**: React Hook Form 7.43.0
- **Icons**: Lucide React 0.263.1
- **PDF Generation**: jsPDF 3.0.1 + pdfmake 0.2.20
- **Audio Analysis**: Tone.js 14.7.77
- **ML**: TensorFlow.js 4.0.0
- **PWA**: Service Worker + Manifest (offline support)

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 7.0.0 (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0
- **WebSocket**: ws 8.18.3 (native WebSocket server)
- **File Upload**: Multer 1.4.5
- **Security**: 
  - Helmet 6.0.1
  - CORS 2.8.5
  - express-rate-limit 6.7.0
- **Email**: Nodemailer 7.0.5 + SendGrid 8.1.5
- **SMS**: Twilio 5.8.0
- **Payments**: Stripe 18.4.0
- **Blockchain**: ethers.js 6.15.0
- **Validation**: Joi 17.9.2
- **Logging**: Winston 3.8.2

### Infrastructure
- **Process Manager**: PM2 (production)
- **Web Server**: Apache (cPanel managed) with ProxyPass
- **Database**: MongoDB (127.0.0.1:27017)
- **Deployment**: Git-based, manual deployment scripts

---

## 🗄️ Database

### MongoDB (Mongoose)
- **Connection**: `mongodb://127.0.0.1:27017/songiq` (production)
- **Models**: 25+ Mongoose schemas

### Key Models
```
User              - User accounts, authentication, subscriptions
Song              - Uploaded songs, metadata
Analysis          - Analysis results and metrics
Market            - Prediction markets
Trade             - Trading transactions
Order             - Limit orders
Position          - User market positions
Comment           - Market comments
PriceHistory      - Market price tracking
Balance           - Multi-currency balances
Currency          - Supported currencies
Wallet            - User wallets (custodial)
Transaction       - Payment transactions
Follow            - Social follow relationships
Achievement       - User achievements
Streak            - Login/trading streaks
Challenge         - Gamification challenges
UserChallenge     - User challenge progress
DailyReward       - Daily login rewards
TradingPair       - Currency trading pairs
AudioFeatures     - Extracted audio features
AnalysisResults   - Analysis output
PerformanceMetrics - Song performance data
```

---

## 📁 Folder Structure

```
songIQ/
├── songiq/
│   ├── client/                    # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/        # 67 React components
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   ├── MarketCard.tsx
│   │   │   │   ├── TradingInterface.tsx
│   │   │   │   ├── PriceHistoryChart.tsx
│   │   │   │   ├── MarketComments.tsx
│   │   │   │   ├── Leaderboard.tsx
│   │   │   │   ├── SocialFeed.tsx
│   │   │   │   ├── DailyRewards.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── ... (60+ more)
│   │   │   ├── pages/             # 28 page components
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── MarketsHub.tsx
│   │   │   │   ├── MarketDetailPage.tsx
│   │   │   │   ├── UserProfilePage.tsx
│   │   │   │   ├── TradingPageRealtime.tsx
│   │   │   │   ├── AdminPage.tsx
│   │   │   │   └── ... (22 more)
│   │   │   ├── contexts/          # React Context providers
│   │   │   │   ├── DarkModeContext.tsx
│   │   │   │   └── TradingWebSocketContext.tsx
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   ├── useTradingWebSocket.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── useSwipeGesture.ts
│   │   │   ├── services/          # Frontend services
│   │   │   │   └── mlSuccessPredictor.ts
│   │   │   ├── utils/             # Utility functions
│   │   │   │   ├── cache.ts       # Caching utilities
│   │   │   │   ├── auth.ts
│   │   │   │   ├── pwaUtils.ts
│   │   │   │   └── ... (7 more)
│   │   │   ├── config/
│   │   │   │   └── api.ts         # API endpoint configuration
│   │   │   ├── types/             # TypeScript types
│   │   │   ├── styles/
│   │   │   │   └── mobile.css     # Mobile-specific styles
│   │   │   ├── assets/            # Images, logos, SVG
│   │   │   ├── App.tsx            # Main app component
│   │   │   └── main.tsx           # Entry point
│   │   ├── public/
│   │   │   ├── manifest.json      # PWA manifest
│   │   │   └── service-worker.js  # PWA service worker
│   │   ├── dist/                  # Production build output
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   ├── server/                     # Backend (Node.js + Express)
│   │   ├── src/
│   │   │   ├── index.ts           # Main server entry point
│   │   │   ├── routes/            # 26 API route files
│   │   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   │   ├── markets.ts    # Prediction markets
│   │   │   │   ├── trading.ts    # Trading operations
│   │   │   │   ├── admin.ts      # Admin dashboard APIs
│   │   │   │   ├── comments.ts   # Market comments
│   │   │   │   ├── orders.ts     # Limit orders
│   │   │   │   ├── social.ts     # Social features
│   │   │   │   ├── gamification.ts # Gamification
│   │   │   │   ├── payments.ts   # Stripe integration
│   │   │   │   ├── wallets.ts    # Wallet management
│   │   │   │   ├── currencies.ts # Currency management
│   │   │   │   └── ... (15 more)
│   │   │   ├── models/            # 25 Mongoose models
│   │   │   │   ├── User.ts
│   │   │   │   ├── Market.ts
│   │   │   │   ├── Trade.ts
│   │   │   │   ├── Order.ts
│   │   │   │   ├── Comment.ts
│   │   │   │   ├── Balance.ts
│   │   │   │   └── ... (19 more)
│   │   │   ├── services/          # 39 service files
│   │   │   │   ├── tradingWebSocketService.ts
│   │   │   │   ├── matchingEngine.ts
│   │   │   │   ├── emailService.ts
│   │   │   │   ├── marketNotificationService.ts
│   │   │   │   ├── gamificationService.ts
│   │   │   │   ├── fiatIntegrationService.ts
│   │   │   │   ├── blockchainService.ts
│   │   │   │   ├── spotifyService.ts
│   │   │   │   └── ... (31 more)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts        # JWT authentication
│   │   │   │   ├── adminAuth.ts   # Admin authorization
│   │   │   │   └── uploadMiddleware.ts
│   │   │   ├── validations/
│   │   │   │   ├── userValidation.ts
│   │   │   │   ├── songValidation.ts
│   │   │   │   └── audioFeaturesValidation.ts
│   │   │   ├── utils/
│   │   │   │   ├── envLoader.ts   # Environment variable loader
│   │   │   │   └── audioUtils.ts
│   │   │   ├── types/
│   │   │   │   ├── express.d.ts   # Express Request extension
│   │   │   │   ├── email.ts
│   │   │   │   └── lyrics.ts
│   │   │   └── config/
│   │   │       └── stripe.ts
│   │   ├── contracts/             # Smart contracts (Solidity)
│   │   │   ├── contracts/
│   │   │   ├── scripts/
│   │   │   └── deployments/
│   │   ├── scripts/               # 46 utility scripts
│   │   ├── dist/                  # TypeScript compilation output
│   │   ├── uploads/               # Uploaded files storage
│   │   └── package.json
│   │
│   └── shared/                    # Shared types
│       └── types/
│           └── index.ts
│
├── Documentation/                 # 50+ markdown guides
├── Scripts/                      # Deployment & setup scripts
└── package.json                   # Root package.json
```

---

## 🔌 API Architecture

### API Base Configuration
- **Frontend**: Uses relative URLs (`/api/*`) in production
- **Backend**: Express routes mounted at `/api/*`
- **Proxy**: Apache ProxyPass routes `/api/` → `http://localhost:5001/api/`
- **WebSocket**: `/ws/` → `ws://localhost:5001/ws/`

### API Call Pattern

#### Frontend (Client)
```typescript
// Pattern: Native fetch API
const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});

const result = await response.json();
```

**Key Files:**
- `client/src/config/api.ts` - API endpoint constants
- `client/src/components/AuthProvider.tsx` - Auth API calls
- `client/src/utils/cache.ts` - Cached fetch wrapper

#### Backend (Server)
```typescript
// Pattern: Express route handlers
router.post('/endpoint', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const user = req.user; // From auth middleware
    // ... business logic
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**Route Organization:**
- Each feature has its own route file
- Routes are mounted in `server/src/index.ts`
- Middleware: `auth.ts`, `adminAuth.ts` for protection

### API Endpoints Structure

```
/api/auth/*              - Authentication (login, register, profile)
/api/songs/*             - Song upload and management
/api/analysis/*          - Music analysis
/api/markets/*           - Prediction markets
/api/markets/:id/trade   - Market trading
/api/markets/:id/comments - Market comments
/api/orders/*            - Limit orders
/api/social/*            - Social features (follow, profiles)
/api/gamification/*      - Gamification (rewards, challenges)
/api/admin/*             - Admin dashboard APIs
/api/trading/*           - Trading operations
/api/wallets/*           - Wallet management
/api/currencies/*        - Currency management
/api/payments/*          - Stripe payments
/api/webhooks/*          - Webhook handlers
/ws/*                    - WebSocket connections
```

### WebSocket Architecture

**Services:**
- `websocketService.ts` - General WebSocket service
- `tradingWebSocketService.ts` - Trading-specific WebSocket

**Channels:**
- `trades:*` - Trade updates
- `markets:*` - Market updates
- `orders:*` - Order book updates
- `notifications:*` - User notifications

**Frontend Hook:**
- `useTradingWebSocket.ts` - React hook for WebSocket connections

---

## 🔐 Authentication & Authorization

### Flow
1. **Login/Register** → JWT token returned
2. **Token Storage** → localStorage (frontend)
3. **API Requests** → `Authorization: Bearer <token>` header
4. **Middleware** → `auth.ts` validates token, adds `req.user`
5. **Admin Routes** → `adminAuth.ts` checks `req.user.isAdmin`

### Key Files
- `server/src/middleware/auth.ts` - JWT validation
- `server/src/middleware/adminAuth.ts` - Admin check
- `client/src/components/AuthProvider.tsx` - Auth context
- `server/src/routes/auth.ts` - Auth endpoints

---

## 🎨 Frontend Architecture

### Component Structure
- **Layout Components**: `Layout.tsx`, `Header.tsx`, `Navigation.tsx`, `Footer.tsx`
- **Page Components**: 28 pages in `pages/` directory
- **Feature Components**: 67 components in `components/` directory
- **Shared Components**: `ErrorBoundary.tsx`, `LoadingStates.tsx`, `Toast.tsx`

### State Management
- **Context API**: 
  - `AuthProvider` - User authentication state
  - `DarkModeContext` - Theme management
  - `TradingWebSocketContext` - WebSocket state
- **Local State**: React hooks (`useState`, `useEffect`)
- **No Redux**: Context API is sufficient for current needs

### Code Splitting
- **Lazy Loading**: All pages loaded with `React.lazy()`
- **Suspense**: Loading fallbacks for lazy components
- **Chunking**: Vite automatically code-splits by route

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: Context-based theme switching
- **Mobile**: Responsive design + `mobile.css` for touch gestures
- **PWA**: Service worker for offline support

---

## 🚀 Build & Deployment

### Development
```bash
npm run dev              # Start both client & server
npm run dev:client       # Frontend only (Vite dev server)
npm run dev:server       # Backend only (nodemon)
```

### Production Build
```bash
npm run build            # Build both
npm run build:client     # Frontend → dist/
npm run build:server     # Backend → dist/ (TypeScript compile)
```

### Deployment
- **Frontend**: Static files in `client/dist/` → `/home/songiq/public_html/`
- **Backend**: PM2 process running `server/dist/index.js`
- **Web Server**: Apache with ProxyPass configuration
- **Process Manager**: PM2 with `ecosystem.config.js`

---

## 📊 Key Features Implementation

### Prediction Markets
- **Models**: `Market.ts`, `Trade.ts`, `Order.ts`, `Position.ts`, `PriceHistory.ts`
- **Routes**: `markets.ts`, `orders.ts`, `comments.ts`
- **Services**: `matchingEngine.ts`, `tradingWebSocketService.ts`
- **Frontend**: `MarketsHub.tsx`, `MarketDetailPage.tsx`, `TradingInterface.tsx`

### Social Features
- **Models**: `Follow.ts`, `Comment.ts`
- **Routes**: `social.ts`, `comments.ts`
- **Frontend**: `UserProfilePage.tsx`, `SocialFeed.tsx`, `FollowButton.tsx`

### Gamification
- **Models**: `Achievement.ts`, `Streak.ts`, `Challenge.ts`, `DailyReward.ts`
- **Routes**: `gamification.ts`
- **Services**: `gamificationService.ts`
- **Frontend**: `DailyRewards.tsx`, `Challenges.tsx`, `LeaderboardTiers.tsx`

### Admin Dashboard
- **Routes**: `admin.ts` (comprehensive admin APIs)
- **Frontend**: `AdminDashboard.tsx`, `AdminOverview.tsx`, `UsersManagement.tsx`

---

## 🔧 Environment Variables

### Backend (.env)
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/songiq
JWT_SECRET=your-secret-key
PORT=5001
NODE_ENV=production

# Optional APIs
STRIPE_SECRET_KEY=sk_...
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=...
YOUTUBE_API_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

### Frontend (.env)
```bash
VITE_API_URL=  # Empty in production (uses relative URLs)
```

---

## 📝 Code Quality

- **TypeScript**: Full type safety across codebase
- **ESLint**: Code linting configured
- **Error Boundaries**: React error boundaries for graceful failures
- **Validation**: Joi schemas for API input validation
- **Logging**: Winston for server-side logging

---

## 🎯 Summary

**Architecture**: Monorepo with separate client/server
**Frontend**: React + Vite + TypeScript + Tailwind
**Backend**: Node.js + Express + TypeScript + MongoDB
**API**: RESTful + WebSocket for real-time
**Auth**: JWT with localStorage
**Deployment**: PM2 + Apache + MongoDB
**Code Style**: TypeScript-first, component-based, service-oriented

