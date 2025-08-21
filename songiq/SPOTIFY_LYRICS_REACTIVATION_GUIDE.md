# Spotify Lyrics Functionality Reactivation Guide

## Overview
The **Spotify lyrics analysis functionality** has been temporarily disabled by commenting out the relevant code. However, the **unreleased songs lyrics analysis functionality is fully active** and working.

This guide explains how to reactivate the Spotify features when you're ready.

## Current Status

### ✅ **ACTIVE - Unreleased Songs Analysis**
- **`songiq/server/src/services/lyricsAnalysisService.ts`** - Fully functional
- **`songiq/server/src/types/lyrics.ts`** - Active types for unreleased songs
- **`songiq/server/src/routes/lyrics.ts`** - Unreleased songs endpoints active
- **`songiq/client/src/components/LyricsAnalysis.tsx`** - Unreleased songs UI active
- **`songiq/client/src/pages/LyricsPage.tsx`** - Unreleased songs page active
- **Navigation link** - Active and accessible

### ❌ **DISABLED - Spotify Lyrics Analysis**
- **`songiq/server/src/services/spotifyLyricsService.ts`** - Commented out
- **Spotify-specific routes** in `lyrics.ts` - Commented out
- **Spotify integration** in frontend - Commented out

## What's Working Now

### Unreleased Songs Features
- ✅ Upload lyrics files (.txt, .lrc, .srt)
- ✅ Manual lyrics text input
- ✅ AI-powered sentiment analysis
- ✅ Theme detection
- ✅ Complexity analysis (readability, word patterns)
- ✅ Structure analysis (rhyming patterns, line counts)
- ✅ PDF export functionality
- ✅ No Spotify account required

### API Endpoints Available
- ✅ `POST /api/lyrics/upload` - File upload analysis
- ✅ `POST /api/lyrics/analyze-text` - Text input analysis

## How to Reactivate Spotify Features

### Step 1: Backend Reactivation
1. **Uncomment the Spotify lyrics service** in `songiq/server/src/services/spotifyLyricsService.ts`:
   - Remove the `/*` at the beginning
   - Remove the `*/` at the end
   - Remove the comment header

2. **Uncomment the Spotify lyrics routes** in `songiq/server/src/routes/lyrics.ts`:
   - Remove the `/*` at the beginning of the Spotify routes section
   - Remove the `*/` at the end of the Spotify routes section
   - Uncomment the `import SpotifyLyricsService` line

3. **Restore Spotify types** in `songiq/server/src/types/lyrics.ts`:
   - Add back the `SpotifyLyricsResponse` interface

### Step 2: Frontend Reactivation
1. **Restore Spotify functionality** in `songiq/client/src/components/LyricsAnalysis.tsx`:
   - Uncomment the Spotify analysis mode
   - Restore the Spotify track ID input
   - Re-enable Spotify authentication checks

2. **Update the page description** in `songiq/client/src/pages/LyricsPage.tsx`:
   - Change description back to include Spotify integration

### Step 3: Restart Servers
After making all changes, restart both servers:
```bash
# Backend
cd songiq/server
PORT=9002 npm run dev

# Frontend (in another terminal)
cd songiq/client
npm run dev
```

## What the Complete Functionality Will Include

### Spotify Integration (when reactivated)
- Fetch lyrics from Spotify API using track IDs
- Analyze lyrics with AI-powered insights
- Sentiment analysis (positive, negative, neutral)
- Theme detection
- Complexity analysis (readability, word patterns)
- Structure analysis (rhyming patterns, line counts)

### Unreleased Songs Support (currently active)
- Upload lyrics files (.txt, .lrc, .srt)
- Manual lyrics input
- Same analysis features as Spotify songs
- No Spotify account required

### PDF Export (currently active)
- Generate professional PDF reports
- Include all analysis results
- Branded with songIQ styling

## Dependencies
The following packages are already installed and will be used when reactivated:
- `spotify-web-api-node` - Spotify API integration
- `jspdf` - PDF generation
- `html2canvas` - HTML to canvas conversion
- `multer` - File upload handling

## Testing After Reactivation
1. Navigate to `/lyrics` in the frontend
2. Test Spotify lyrics analysis with a valid track ID
3. Test unreleased songs analysis with file upload or text input
4. Verify PDF export functionality
5. Check that all API endpoints respond correctly

## Notes
- All original Spotify code has been preserved in comments
- The unreleased songs functionality continues to work normally
- No database changes were made, so user data remains intact
- The `spotifyToken` field in user models is preserved for future use
- Users can currently analyze lyrics for unreleased songs without any limitations

## Troubleshooting
If you encounter issues after reactivation:
1. Check that all Spotify files are properly uncommented
2. Verify that both servers are running
3. Check browser console for any JavaScript errors
4. Verify that the lyrics API endpoints are accessible
5. Ensure Spotify API credentials are properly configured

## Current Usage
Users can currently:
1. Navigate to `/lyrics` page
2. Enter track name and artist name
3. Upload a lyrics file OR paste lyrics text
4. Get comprehensive AI analysis including:
   - Sentiment analysis
   - Theme detection
   - Complexity metrics
   - Structure analysis
5. Export results to PDF
6. All without needing a Spotify account
