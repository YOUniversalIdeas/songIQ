#!/usr/bin/env node

/**
 * Test script to verify environment variables are loaded correctly
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Testing Environment Variable Loading');
console.log('=====================================');
console.log('');

// Test different ways of loading environment variables
console.log('1. Current process.env values:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('   SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Not set');
console.log('   SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
console.log('   YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? '✅ Set' : '❌ Not set');
console.log('');

// Try to load the production environment file directly
const envPath = path.join(__dirname, 'server', '.env.production');
console.log('2. Production environment file:');
console.log('   Path:', envPath);
console.log('   Exists:', fs.existsSync(envPath) ? '✅ Yes' : '❌ No');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('   Lines:', lines.length);
  console.log('   Contains SPOTIFY_CLIENT_ID:', envContent.includes('SPOTIFY_CLIENT_ID') ? '✅ Yes' : '❌ No');
  console.log('   Contains SPOTIFY_CLIENT_SECRET:', envContent.includes('SPOTIFY_CLIENT_SECRET') ? '✅ Yes' : '❌ No');
  console.log('   Contains YOUTUBE_API_KEY:', envContent.includes('YOUTUBE_API_KEY') ? '✅ Yes' : '❌ No');
  
  // Show first few lines (without exposing full keys)
  console.log('');
  console.log('3. First few lines (sanitized):');
  lines.slice(0, 10).forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        const sanitizedValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
        console.log(`   ${key}=${sanitizedValue}`);
      }
    }
  });
}

console.log('');
console.log('4. Testing dotenv loading:');
try {
  // Try to load dotenv manually
  require('dotenv').config({ 
    path: path.join(__dirname, 'server', '.env.production') 
  });
  
  console.log('   dotenv loaded successfully');
  console.log('   SPOTIFY_CLIENT_ID after dotenv:', process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Not set');
  console.log('   SPOTIFY_CLIENT_SECRET after dotenv:', process.env.SPOTIFY_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
} catch (error) {
  console.log('   ❌ Error loading dotenv:', error.message);
}

console.log('');
console.log('✅ Environment test complete!');
