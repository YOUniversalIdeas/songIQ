#!/bin/bash

# Get Admin Token Script
# This script helps you login and get your admin token

EMAIL="allan@carpediem.works"
API_URL="http://localhost:5001/api/auth/login"

echo "🔐 Getting admin token for: $EMAIL"
echo ""
echo "Please enter your password:"
read -s PASSWORD

echo ""
echo "Logging in..."

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Check if login was successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo ""
  echo "✅ Login successful!"
  echo ""
  echo "Your admin token:"
  echo "$TOKEN"
  echo ""
  echo "To use this token, add it to your requests:"
  echo "Authorization: Bearer $TOKEN"
  echo ""
  echo "Example - Fetch NewsAPI articles:"
  echo "curl -X POST http://localhost:5001/api/news/admin/fetch/newsapi \\"
  echo "  -H 'Authorization: Bearer $TOKEN'"
else
  echo ""
  echo "❌ Login failed!"
  echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4 || echo "$RESPONSE"
fi

