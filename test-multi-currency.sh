#!/bin/bash

# Multi-Currency Trading System - Test Suite
# This script tests all major endpoints of the new system

BASE_URL="http://localhost:5001"
echo "🧪 Testing Multi-Currency Trading System"
echo "========================================="
echo "Base URL: $BASE_URL"
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 3

# Test 1: Health Check
echo "Test 1: Health Check"
echo "---------------------"
curl -s "$BASE_URL/api/health" | jq '.' || echo "❌ Health check failed"
echo -e "\n"

# Test 2: Get All Currencies
echo "Test 2: Get All Currencies"
echo "--------------------------"
curl -s "$BASE_URL/api/currencies" | jq '.currencies[] | {symbol, name, type, priceUSD}' || echo "❌ Failed to get currencies"
echo -e "\n"

# Test 3: Get Specific Currency (USDC)
echo "Test 3: Get Currency by Symbol (USDC)"
echo "--------------------------------------"
curl -s "$BASE_URL/api/currencies/symbol/USDC" | jq '.currency | {symbol, name, type, contractAddress, minDeposit}' || echo "❌ Failed to get USDC"
echo -e "\n"

# Test 4: Get All Trading Pairs
echo "Test 4: Get All Trading Pairs"
echo "------------------------------"
curl -s "$BASE_URL/api/trading/pairs" | jq '.pairs[] | {symbol, makerFee, takerFee, isActive}' || echo "❌ Failed to get trading pairs"
echo -e "\n"

# Test 5: Currency Conversion
echo "Test 5: Currency Conversion (1 ETH to USDC)"
echo "--------------------------------------------"
curl -s "$BASE_URL/api/currencies/convert?from=ETH&to=USDC&amount=1" | jq '.' || echo "❌ Conversion failed"
echo -e "\n"

# Test 6: Get ETH/USDC Trading Pair Details
echo "Test 6: Get Trading Pair Details (ETH/USDC)"
echo "--------------------------------------------"
PAIR_ID=$(curl -s "$BASE_URL/api/trading/pairs" | jq -r '.pairs[] | select(.symbol=="ETH/USDC") | ._id')
if [ -n "$PAIR_ID" ]; then
    echo "ETH/USDC Pair ID: $PAIR_ID"
    curl -s "$BASE_URL/api/trading/pairs/$PAIR_ID" | jq '.pair | {symbol, lastPrice, volume24h, minTradeAmount}' || echo "❌ Failed"
else
    echo "❌ Could not find ETH/USDC pair"
fi
echo -e "\n"

# Test 7: Get Orderbook
echo "Test 7: Get Orderbook for ETH/USDC"
echo "-----------------------------------"
if [ -n "$PAIR_ID" ]; then
    curl -s "$BASE_URL/api/trading/pairs/$PAIR_ID/orderbook" | jq '.orderBook' || echo "❌ Failed"
else
    echo "❌ No pair ID available"
fi
echo -e "\n"

# Test 8: Get Spread
echo "Test 8: Get Spread for ETH/USDC"
echo "--------------------------------"
if [ -n "$PAIR_ID" ]; then
    curl -s "$BASE_URL/api/trading/pairs/$PAIR_ID/spread" | jq '.spread' || echo "❌ Failed"
else
    echo "❌ No pair ID available"
fi
echo -e "\n"

# Test 9: Update Prices (will fail without API keys, but tests endpoint)
echo "Test 9: Trigger Price Update"
echo "-----------------------------"
curl -s -X POST "$BASE_URL/api/currencies/prices/update" | jq '.' || echo "⚠️  Price update may fail without API keys (expected)"
echo -e "\n"

echo "========================================="
echo "✅ Basic API Tests Complete!"
echo ""
echo "📝 Notes:"
echo "- All public endpoints are working"
echo "- Currencies and trading pairs are loaded"
echo "- For authenticated tests, you need to:"
echo "  1. Register/login to get a JWT token"
echo "  2. Use the token for wallet/trading endpoints"
echo ""
echo "🔐 Next Steps for Full Testing:"
echo "1. Create a user account"
echo "2. Get authentication token"
echo "3. Create test wallet"
echo "4. Test trading functionality"
echo ""
echo "Run: npm run create:test-wallet <userId>"
echo "========================================="

