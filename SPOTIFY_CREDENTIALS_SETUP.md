# Spotify Credentials Setup Guide

## Problem
Your `.env` file currently has placeholder values instead of real Spotify API credentials. This is why tracks don't have Spotify IDs or album art.

## Solution: Get Real Spotify Credentials

### Step 1: Go to Spotify Developer Dashboard
1. Visit: https://developer.spotify.com/dashboard
2. Log in with your Spotify account (or create one if needed)

### Step 2: Create a New App
1. Click **"Create app"** button
2. Fill in the form:
   - **App name**: `songIQ` (or any name you prefer)
   - **App description**: `Music intelligence platform for independent artists`
   - **Website**: `https://songiq.ai` (or your domain)
   - **Redirect URI**: `http://localhost:5001/callback` (for development)
   - **Which API/SDKs are you planning to use?**: Check "Web API"
3. Accept the terms and click **"Save"**

### Step 3: Get Your Credentials
1. Once your app is created, you'll see the app dashboard
2. Click on your app name to open it
3. You'll see:
   - **Client ID**: A long string (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - **Client Secret**: Click **"Show client secret"** to reveal it (looks similar)

### Step 4: Update Your .env File
1. Open `songiq/server/.env` in a text editor
2. Find these lines:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   ```
3. Replace them with your actual credentials:
   ```
   SPOTIFY_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   SPOTIFY_CLIENT_SECRET=your_actual_secret_here
   ```
4. **Important**: 
   - No quotes around the values
   - No spaces before or after the `=`
   - Save the file

### Step 5: Restart Your Server
After updating the `.env` file, restart your server so it loads the new credentials:
```bash
# Stop the current server (Ctrl+C in the terminal where it's running)
# Then restart it:
cd songiq/server
npm run dev
```

### Step 6: Test the Credentials
Run the test script to verify everything works:
```bash
cd songiq/server
npx ts-node scripts/test-spotify-credentials.ts
```

You should see:
- ✅ Authentication successful!
- ✅ API call successful!

## Troubleshooting

### "Invalid client" error
- Double-check you copied the credentials correctly (no extra spaces)
- Make sure you're using the Client ID and Client Secret (not other values)
- Verify the credentials in your Spotify Dashboard

### "App not found" error
- Make sure your app is still active in the Spotify Dashboard
- Check that you're logged into the correct Spotify account

### Still not working?
1. Check your server console logs for detailed error messages
2. Verify the `.env` file is in `songiq/server/.env` (not `songiq/.env`)
3. Make sure the server is reading from the correct environment file

## After Setup
Once your credentials are working:
1. Run the update process: `POST /api/charts/admin/update-metrics`
2. Tracks should start getting Spotify IDs and album art
3. The update process will show success messages in the console

