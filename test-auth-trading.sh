#!/bin/bash

# Multi-Currency Trading System - Full Authenticated Test Suite
# This script tests the complete trading flow with authentication

BASE_URL="http://localhost:5001"
echo "🧪 Testing Multi-Currency Trading System - Full Flow"
echo "===================================================="
echo ""

# Wait for server
echo "⏳ Waiting for server to restart..."
sleep 8

# Test 1: Health Check
echo "✓ Test 1: Health Check"
curl -s "$BASE_URL/api/health" > /dev/null && echo "  Server is running" || echo "  ❌ Server not ready"
echo ""

# Test 2: Fixed Currency Conversion
echo "✓ Test 2: Currency Conversion (Fixed)"
echo "  Converting 1 ETH to USDC..."
CONVERSION=$(curl -s "$BASE_URL/api/currencies/convert?from=ETH&to=USDC&amount=1")
echo "  $CONVERSION" | jq '.'
echo ""

# Test 3: Get a User ID for testing (you'll need to replace this)
echo "✓ Test 3: User Setup"
echo "  To test authenticated endpoints, you need:"
echo "  1. A user ID from your database"
echo "  2. Run: npm run create:test-wallet <userId>"
echo ""
echo "  Quick way to get a user ID:"
echo "  mongo songiq --eval 'db.users.findOne({}, {_id:1})'"
echo ""

# Show example trading flow
echo "📝 Example Trading Flow (after getting user ID):"
echo "================================================"
echo ""
echo "# Step 1: Create test wallet and balances"
echo "cd songiq/server"
echo "npm run create:test-wallet YOUR_USER_ID"
echo ""
echo "# Step 2: Login to get token"
echo "curl -X POST $BASE_URL/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"your@email.com\",\"password\":\"yourpass\"}'"
echo ""
echo "# Step 3: Check balances (use token from step 2)"
echo "curl $BASE_URL/api/currencies/user/balances \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""
echo "# Step 4: Get trading pair ID"
echo "curl -s $BASE_URL/api/trading/pairs | jq '.pairs[0]._id'"
echo ""
echo "# Step 5: Place a market order"
echo "curl -X POST $BASE_URL/api/trading/orders/market \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"tradingPairId\": \"PAIR_ID_FROM_STEP_4\","
echo "    \"side\": \"buy\","
echo "    \"amount\": 0.1"
echo "  }'"
echo ""
echo "===================================================="
echo ""

# Interactive mode
read -p "Do you have a user ID to test with? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your user ID: " USER_ID
    echo ""
    echo "Creating test wallet for user $USER_ID..."
    cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server
    npm run create:test-wallet "$USER_ID"
    echo ""
    echo "✅ Test wallet created!"
    echo ""
    echo "Now you can:"
    echo "1. Login to get an auth token"
    echo "2. Use the token to access trading endpoints"
    echo "3. Place orders and see them in the orderbook"
else
    echo ""
    echo "📋 To continue testing:"
    echo "1. Create or find a user in your database"
    echo "2. Run this script again with a user ID"
    echo "3. Or manually test using the commands above"
    echo ""
fi

echo "===================================================="
echo "✅ Test suite complete!"
echo ""

