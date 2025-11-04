# 🔑 songIQ API Keys Setup Guide

## 📋 **Required API Keys for Production**

To make your songIQ application fully functional, you need to configure these API keys:

### **🎵 Music Industry APIs (Priority: HIGH)**
1. **Spotify API** - Core music data and analysis
2. **Last.fm API** - Music metadata and charts
3. **YouTube API** - Video performance data

### **📱 Social Media APIs (Priority: MEDIUM)**
4. **Twitter API** - Social media trends
5. **Instagram API** - Visual content analysis
6. **TikTok API** - Short-form video trends

### **💳 Payment & Communication (Priority: HIGH)**
7. **Stripe API** - Payment processing
8. **SendGrid API** - Email services

---

## 🚀 **Step 1: Spotify API Setup (CRITICAL)**

### **1.1 Create Spotify Developer Account**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Sign in with your Spotify account
3. Click **"Create App"**

### **1.2 Configure Your App**
- **App Name**: `songIQ Music Analysis`
- **Description**: `Music analysis and market insights platform`
- **Website**: `https://songiq.com`
- **Redirect URI**: `https://songiq.com/callback`
- **API/SDKs**: Check "Web API"

### **1.3 Get Your Credentials**
- **Client ID**: Copy this (starts with letters/numbers)
- **Client Secret**: Click "Show Client Secret" and copy

### **1.4 Update Environment File**
```bash
# Add to songiq/server/env.production
SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
```

---

## 🎵 **Step 2: Last.fm API Setup**

### **2.1 Create Last.fm Account**
1. Go to [Last.fm API Account](https://www.last.fm/api/account/create)
2. Sign up for a free account
3. Create an API key

### **2.2 Get API Key**
- **API Key**: Copy the generated key
- **Username**: Your Last.fm username

### **2.3 Update Environment File**
```bash
# Add to songiq/server/env.production
LASTFM_API_KEY=your_lastfm_api_key_here
```

---

## 📺 **Step 3: YouTube API Setup**

### **3.1 Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3

### **3.2 Create API Credentials**
1. Go to "Credentials" in the API & Services section
2. Click "Create Credentials" → "API Key"
3. Copy the API key

### **3.3 Update Environment File**
```bash
# Add to songiq/server/env.production
YOUTUBE_API_KEY=your_youtube_api_key_here
```

---

## 💳 **Step 4: Stripe Payment Setup (CRITICAL)**

### **4.1 Create Stripe Account**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Complete account verification

### **4.2 Get API Keys**
1. Go to "Developers" → "API Keys"
2. Copy **Publishable Key** (starts with `pk_live_`)
3. Copy **Secret Key** (starts with `sk_live_`)

### **4.3 Create Products and Prices**
1. Go to "Products" → "Add Product"
2. Create your subscription plans:
   - Basic Plan: $9.99/month
   - Pro Plan: $19.99/month
   - Enterprise Plan: $49.99/month
3. Copy the Price IDs (start with `price_`)

### **4.4 Update Environment Files**

**Server Environment (songiq/server/env.production):**
```bash
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_BASIC_PLAN_PRICE_ID=price_your_basic_plan_id
STRIPE_PRO_PLAN_PRICE_ID=price_your_pro_plan_id
STRIPE_ENTERPRISE_PLAN_PRICE_ID=price_your_enterprise_plan_id
```

**Client Environment (songiq/client/env.production):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
```

---

## 📧 **Step 5: SendGrid Email Setup (CRITICAL)**

### **5.1 Create SendGrid Account**
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your account

### **5.2 Create API Key**
1. Go to "Settings" → "API Keys"
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access"
4. Copy the API key

### **5.3 Update Environment File**
```bash
# Add to songiq/server/env.production
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@songiq.com
```

---

## 🐦 **Step 6: Social Media APIs (Optional)**

### **6.1 Twitter API**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for developer access
3. Create an app and get Bearer Token

### **6.2 Instagram API**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Add Instagram Basic Display API
4. Get Access Token

### **6.3 TikTok API**
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create an app
3. Get Access Token

### **6.4 Update Environment File**
```bash
# Add to songiq/server/env.production
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token_here
```

---

## 🔧 **Step 7: Update Production Environment Files**

### **7.1 Server Environment (songiq/server/env.production)**
```bash
# Production Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/songiq-production

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# CORS Configuration
ALLOWED_ORIGINS=https://songiq.com,https://www.songiq.com

# Music Industry APIs
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
LASTFM_API_KEY=your_lastfm_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Social Media APIs
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token_here

# Payment Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_BASIC_PLAN_PRICE_ID=price_your_basic_plan_id_here
STRIPE_PRO_PLAN_PRICE_ID=price_your_pro_plan_id_here
STRIPE_ENTERPRISE_PLAN_PRICE_ID=price_your_enterprise_plan_id_here

# Email Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@songiq.com

# Production Features
ENABLE_COMPRESSION=true
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### **7.2 Client Environment (songiq/client/env.production)**
```bash
# Production API Configuration
VITE_API_URL=https://songiq.com/api

# App Configuration
VITE_APP_NAME=songIQ
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
```

---

## 🧪 **Step 8: Test API Integrations**

### **8.1 Test Script**
```bash
cd songiq
node test-api-integrations.js
```

### **8.2 Manual Testing**
```bash
# Test Spotify
curl "http://localhost:5000/api/spotify/search?q=shape%20of%20you&limit=5"

# Test Last.fm
curl "http://localhost:5000/api/market/trends/pop"

# Test Success Calculation
curl -X POST http://localhost:5000/api/success/calculate \
  -H "Content-Type: application/json" \
  -d '{"audioFeatures": {"danceability": 0.8, "energy": 0.7}}'
```

---

## 🔒 **Security Best Practices**

### **8.1 Environment File Security**
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate API keys regularly
- Monitor API usage for unusual activity

### **8.2 API Key Management**
- Store sensitive keys in environment variables only
- Use different keys for development and production
- Implement rate limiting on your API endpoints
- Log API usage for monitoring

---

## 📊 **Priority Order for Implementation**

### **Phase 1 (Critical - Implement First)**
1. ✅ **Stripe API** - Payment processing
2. ✅ **SendGrid API** - Email services
3. ✅ **Spotify API** - Core music functionality

### **Phase 2 (Important - Implement Second)**
4. ✅ **Last.fm API** - Music metadata
5. ✅ **YouTube API** - Video performance

### **Phase 3 (Optional - Implement Later)**
6. ✅ **Twitter API** - Social trends
7. ✅ **Instagram API** - Visual content
8. ✅ **TikTok API** - Short-form video

---

## 🎯 **Next Steps**

1. **Start with Stripe and SendGrid** (most critical for business)
2. **Add Spotify API** (core music functionality)
3. **Test each integration** as you add it
4. **Deploy to production** once core APIs are working
5. **Add social media APIs** for enhanced features

---

**💡 Pro Tip**: You can start with just Stripe, SendGrid, and Spotify APIs to have a fully functional application. The social media APIs can be added later for enhanced features.
