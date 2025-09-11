#!/usr/bin/env node

/**
 * Simple test server to verify Spotify API integration
 */

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load production environment variables
dotenv.config({ path: path.join(__dirname, 'server', '.env.production') });

const app = express();
const PORT = 5001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Test endpoint to show environment variables
app.get('/api/test-env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Not set',
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? '✅ Set' : '❌ Not set',
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? '✅ Set' : '❌ Not set',
    LASTFM_API_KEY: process.env.LASTFM_API_KEY ? '✅ Set' : '❌ Not set'
  });
});

// Test Spotify API endpoint
app.get('/api/test-spotify', async (req, res) => {
  try {
    console.log('Testing Spotify API with keys:');
    console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not set');
    console.log('Client Secret:', process.env.SPOTIFY_CLIENT_SECRET ? 'Set' : 'Not set');
    
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Spotify API keys not configured' });
    }
    
    // Test Spotify token generation
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({ 
        success: true, 
        message: 'Spotify API connection successful!',
        token_type: data.token_type,
        expires_in: data.expires_in
      });
    } else {
      res.status(response.status).json({ 
        error: 'Spotify API connection failed',
        status: response.status,
        statusText: response.statusText
      });
    }
  } catch (error) {
    console.error('Error testing Spotify API:', error);
    res.status(500).json({ 
      error: 'Error testing Spotify API',
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`🔑 Environment check:`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   SPOTIFY_CLIENT_ID: ${process.env.SPOTIFY_CLIENT_ID ? '✅ Loaded' : '❌ Not loaded'}`);
  console.log(`   SPOTIFY_CLIENT_SECRET: ${process.env.SPOTIFY_CLIENT_SECRET ? '✅ Loaded' : '❌ Not loaded'}`);
  console.log(`   YOUTUBE_API_KEY: ${process.env.YOUTUBE_API_KEY ? '✅ Loaded' : '❌ Not loaded'}`);
  console.log(`   LASTFM_API_KEY: ${process.env.LASTFM_API_KEY ? '✅ Loaded' : '❌ Not loaded'}`);
  console.log('');
  console.log(`🧪 Test endpoints:`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/test-env`);
  console.log(`   http://localhost:${PORT}/api/test-spotify`);
});
