# songIQ Production Environment Setup Guide

This guide will help you set up the production environment variables for your songIQ deployment.

## 🚀 **Quick Start**

1. **Copy the production environment files:**
   ```bash
   cp songiq/client/env.production songiq/client/.env.production
   cp songiq/server/env.production songiq/server/.env.production
   ```

2. **Update the values with your actual production credentials**
3. **Test the builds locally before deploying**

## 📋 **Required Production Credentials**

### 🔑 **Stripe Configuration (Required)**
- **Publishable Key**: `pk_live_...` (from Stripe Dashboard)
- **Secret Key**: `sk_live_...` (from Stripe Dashboard)
- **Webhook Secret**: `whsec_...` (from Stripe Dashboard)
- **Price IDs**: Create products in Stripe Dashboard

**Steps to get Stripe keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/developers/api-keys)
2. Switch to "Live" mode (not test mode)
3. Copy the publishable and secret keys
4. Go to Webhooks section to get webhook secret

### 🎵 **Spotify API (Required)**
- **Client ID**: From [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- **Client Secret**: From Spotify Developer Dashboard

**Steps to get Spotify keys:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use existing one
3. Copy Client ID and Client Secret

### 🗄️ **MongoDB (Required)**
- **Local MongoDB**: `mongodb://localhost:27017/songiq`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/songiq`

**Recommended: Use MongoDB Atlas for production**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string

### 📧 **Email Service (Required)**
- **SendGrid** (Recommended): Get API key from [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)
- **AWS SES**: Use AWS credentials
- **Gmail**: Use app password (less secure for production)

### 🔐 **Security Keys (Required)**
Generate strong secrets for production:

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 **Domain Configuration**

### **Production Domains:**
- **Frontend**: `https://songiq.com`
- **Backend API**: `https://api.songiq.com` (or `https://songiq.com/api`)

### **CORS Settings:**
Update `ALLOWED_ORIGINS` in server environment to only include your production domains.

## 📝 **Environment File Checklist**

### **Client (.env.production):**
- [ ] `VITE_API_URL` - Production API endpoint
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Live Stripe key
- [ ] `VITE_ENABLE_DEBUG_MODE` - Set to `false`

### **Server (.env.production):**
- [ ] `NODE_ENV` - Set to `production`
- [ ] `MONGODB_URI` - Production database connection
- [ ] `JWT_SECRET` - Strong, unique secret
- [ ] `STRIPE_SECRET_KEY` - Live Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Live webhook secret
- [ ] `EMAIL_SERVICE` - Production email service
- [ ] `ALLOWED_ORIGINS` - Production domains only

## 🧪 **Testing Production Builds**

Before deploying, test your production builds locally:

```bash
# Build client
cd songiq/client
npm run build

# Build server
cd ../server
npm run build

# Test production builds
npm run preview  # Client
npm start        # Server
```

## ⚠️ **Security Checklist**

- [ ] All API keys are LIVE keys (not test keys)
- [ ] JWT secret is strong and unique
- [ ] CORS only allows production domains
- [ ] Debug mode is disabled
- [ ] Log level is set to `warn` or `error`
- [ ] Rate limiting is enabled and configured
- [ ] File upload size limits are appropriate

## 🚨 **Common Mistakes to Avoid**

1. **Using test keys in production**
2. **Weak JWT secrets**
3. **Allowing localhost in CORS for production**
4. **Leaving debug mode enabled**
5. **Using development database in production**
6. **Not setting up proper SSL certificates**

## 📞 **Need Help?**

If you encounter issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all services (MongoDB, Stripe, Spotify) are accessible
4. Test API endpoints individually

## 🔄 **Next Steps After Environment Setup**

1. **Test builds locally**
2. **Set up production server**
3. **Configure domain and SSL**
4. **Deploy using deployment scripts**
5. **Monitor logs and performance**

---

**Remember**: Never commit production environment files to git. Keep them secure and only accessible on your production server.
