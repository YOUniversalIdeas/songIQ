#!/bin/bash

# Test script for Charts functionality
# Make sure your server is running on port 5001 before running this

BASE_URL="http://localhost:5001/api/charts"

echo "🧪 Testing Charts API Endpoints"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Seed test data
echo "1️⃣  Seeding test data..."
SEED_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/seed-test-data" \
  -H "Content-Type: application/json")

if echo "$SEED_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Test data seeded successfully${NC}"
  echo "$SEED_RESPONSE" | jq '.' 2>/dev/null || echo "$SEED_RESPONSE"
else
  echo -e "${RED}❌ Failed to seed test data${NC}"
  echo "$SEED_RESPONSE"
fi
echo ""

# Wait a moment for data to be processed
sleep 2

# Test 2: Get stats
echo "2️⃣  Fetching charts stats..."
STATS_RESPONSE=$(curl -s "${BASE_URL}/stats")
if echo "$STATS_RESPONSE" | grep -q "totalArtists"; then
  echo -e "${GREEN}✅ Stats endpoint working${NC}"
  echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
else
  echo -e "${RED}❌ Stats endpoint failed${NC}"
  echo "$STATS_RESPONSE"
fi
echo ""

# Test 3: Get top artists
echo "3️⃣  Fetching top artists..."
TOP_ARTISTS=$(curl -s "${BASE_URL}/artists/top?limit=10")
if echo "$TOP_ARTISTS" | grep -q "artists"; then
  ARTIST_COUNT=$(echo "$TOP_ARTISTS" | jq '.artists | length' 2>/dev/null || echo "N/A")
  echo -e "${GREEN}✅ Top artists endpoint working (found $ARTIST_COUNT artists)${NC}"
  echo "$TOP_ARTISTS" | jq '.artists[0:3]' 2>/dev/null || echo "$TOP_ARTISTS" | head -20
else
  echo -e "${RED}❌ Top artists endpoint failed${NC}"
  echo "$TOP_ARTISTS"
fi
echo ""

# Test 4: Get rising artists
echo "4️⃣  Fetching rising artists..."
RISING_ARTISTS=$(curl -s "${BASE_URL}/artists/rising?limit=10")
if echo "$RISING_ARTISTS" | grep -q "artists"; then
  RISING_COUNT=$(echo "$RISING_ARTISTS" | jq '.artists | length' 2>/dev/null || echo "N/A")
  echo -e "${GREEN}✅ Rising artists endpoint working (found $RISING_COUNT artists)${NC}"
else
  echo -e "${RED}❌ Rising artists endpoint failed${NC}"
  echo "$RISING_ARTISTS"
fi
echo ""

# Test 5: Get genres
echo "5️⃣  Fetching genres..."
GENRES=$(curl -s "${BASE_URL}/genres")
if echo "$GENRES" | grep -q "genres"; then
  GENRE_COUNT=$(echo "$GENRES" | jq '.genres | length' 2>/dev/null || echo "N/A")
  echo -e "${GREEN}✅ Genres endpoint working (found $GENRE_COUNT genres)${NC}"
  echo "$GENRES" | jq '.genres[0:5]' 2>/dev/null || echo "$GENRES" | head -15
else
  echo -e "${RED}❌ Genres endpoint failed${NC}"
  echo "$GENRES"
fi
echo ""

# Test 6: Search artists
echo "6️⃣  Testing search..."
SEARCH_RESULT=$(curl -s "${BASE_URL}/search?q=taylor&limit=5")
if echo "$SEARCH_RESULT" | grep -q "artists"; then
  echo -e "${GREEN}✅ Search endpoint working${NC}"
  echo "$SEARCH_RESULT" | jq '.artists[0:2]' 2>/dev/null || echo "$SEARCH_RESULT" | head -15
else
  echo -e "${YELLOW}⚠️  Search endpoint returned no results (this is OK if no matching artists)${NC}"
fi
echo ""

# Test 7: Test LastFM import (if you have admin token)
echo "7️⃣  Testing LastFM API connection..."
echo -e "${YELLOW}⚠️  This requires admin authentication. Skipping for now.${NC}"
echo "   To test: curl -X POST ${BASE_URL}/admin/import/lastfm \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \\"
echo "     -d '{\"limit\": 10}'"
echo ""

echo "================================"
echo "✅ Charts API testing complete!"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3001/charts to see the frontend"
echo "2. Test LastFM import with admin credentials"
echo "3. Check individual artist pages at /charts/artist/:id"

