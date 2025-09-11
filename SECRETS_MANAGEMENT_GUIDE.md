# Secrets Management Guide

This guide explains how to properly manage secrets and environment variables in your songIQ development environment.

## Current Status ✅

**Real secrets have been replaced with placeholder values in:**
- `songiq/server/env.development` - All API keys now use placeholder values
- `songiq/client/env.local` - Contains actual Stripe test key for development

## Environment File Structure

### Development Environment
- **Server**: `songiq/server/env.development` - Contains placeholder values
- **Client**: `songiq/client/env.local` - Contains placeholder values

### Production Environment
- **Server**: `songiq/server/.env.production` - Contains real production secrets (not in git)
- **Client**: `songiq/client/.env.production` - Contains real production secrets (not in git)

## How to Set Up Your Development Environment

### 1. Copy Template Files
```bash
# For server development
cp songiq/server/env.development songiq/server/.env

# For client development
cp songiq/client/env.local songiq/client/.env
```

### 2. Replace Placeholders with Your Development Keys
Edit the `.env` files and replace placeholder values with your actual development API keys:

#### Server (.env)
```env
# Spotify API (Get from: https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_actual_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_actual_spotify_client_secret

# YouTube API (Get from: https://console.cloud.google.com/apis/credentials)
YOUTUBE_API_KEY=your_actual_youtube_api_key

# Last.fm API (Get from: https://www.last.fm/api/account/create)
LASTFM_API_KEY=your_actual_lastfm_api_key

# SendGrid (Get from: https://app.sendgrid.com/settings/api_keys)
EMAIL_PASSWORD=your_actual_sendgrid_api_key

# Stripe Test Keys (Get from: https://dashboard.stripe.com/test/apikeys)
# STRIPE_PUBLISHABLE_KEY=
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=

# Stripe Test Price IDs (Create test products in Stripe dashboard)
# STRIPE_BASIC_PLAN_PRICE_ID=
# STRIPE_PRO_PLAN_PRICE_ID=
# STRIPE_ENTERPRISE_PLAN_PRICE_ID=
```

#### Client (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5001

# Stripe Test Configuration
# VITE_STRIPE_PUBLISHABLE_KEY=
```

## Security Best Practices

### ✅ DO:
- Use placeholder values in template files (committed to git)
- Keep real secrets only in `.env` files (not committed to git)
- Use test API keys for development
- Use production API keys only in production environment files

### ❌ DON'T:
- Commit real API keys to git
- Use production keys in development
- Share `.env` files with real secrets
- Store secrets in plain text in code

## Environment File Priority

Vite (client) and Node.js (server) load environment variables in this order:

1. `.env.local` (highest priority, never committed)
2. `.env.development` or `.env.production`
3. `.env` (lowest priority)

## Quick Commands

### Reset to Placeholder Values
```bash
# Reset server environment to safe placeholders
cp songiq/server/env.development songiq/server/.env

# Reset client environment to safe placeholders
cp songiq/client/env.local songiq/client/.env
```

### Update Git Ignore
Ensure these files are in your `.gitignore`:
```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
.env.staging
```

## Troubleshooting

### "API Key Invalid" Errors
- Check that you've copied the correct API keys from the respective services
- Ensure you're using test keys for development, not production keys
- Verify the `.env` files are in the correct directories

### Environment Variables Not Loading
- Restart your development server after changing `.env` files
- Check file naming (should be exactly `.env`)
- Verify file location (should be in project root or respective client/server directories)

## Production Deployment

When deploying to production:
1. Use the production environment files (`.env.production`)
2. Never commit production secrets to git
3. Use the deployment scripts that copy production environment files securely

## Need Help?

If you need to restore real development keys:
1. Check your password manager or secure storage
2. Re-generate API keys from the respective services
3. Update your local `.env` files (not the template files)

---

**Remember**: The template files (`env.development` and `env.local`) should always contain placeholder values and can be safely committed to git. Your actual development keys should only exist in your local `.env` files.
