#!/bin/bash

echo "🚀 Starting Complete Multi-Currency Trading Platform"
echo "===================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}Checking MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB not running. Start it with: mongod${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Start Backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server
npm run dev > ../../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend starting (PID: $BACKEND_PID)${NC}"
echo "  Logs: backend.log"
echo "  URL: http://localhost:5001"
echo ""

# Wait for backend to be ready
echo -e "${BLUE}Waiting for backend to be ready...${NC}"
sleep 5

# Check backend health
HEALTH_CHECK=$(curl -s http://localhost:5001/api/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Backend not responding yet (may need more time)${NC}"
fi
echo ""

# Start Frontend
echo -e "${BLUE}Starting Frontend...${NC}"
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/client
npm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend starting (PID: $FRONTEND_PID)${NC}"
echo "  Logs: frontend.log"
echo "  URL: http://localhost:3001"
echo ""

# Optional: Start Hardhat node
read -p "Start local blockchain node? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Starting Local Blockchain...${NC}"
    cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server/contracts
    npx hardhat node > ../../blockchain.log 2>&1 &
    BLOCKCHAIN_PID=$!
    echo -e "${GREEN}✓ Blockchain starting (PID: $BLOCKCHAIN_PID)${NC}"
    echo "  Logs: blockchain.log"
    echo "  URL: http://localhost:8545"
    echo ""
fi

# Summary
echo "===================================================="
echo -e "${GREEN}✅ All Services Started!${NC}"
echo "===================================================="
echo ""
echo "📊 Service Status:"
echo "  Backend:     http://localhost:5001 (PID: $BACKEND_PID)"
echo "  Frontend:    http://localhost:3001 (PID: $FRONTEND_PID)"
if [[ $BLOCKCHAIN_PID ]]; then
    echo "  Blockchain:  http://localhost:8545 (PID: $BLOCKCHAIN_PID)"
fi
echo ""
echo "📝 Access Points:"
echo "  • Main App:     http://localhost:3001"
echo "  • Trading:      http://localhost:3001/trading"
echo "  • Portfolio:    http://localhost:3001/portfolio"
echo "  • Wallets:      http://localhost:3001/wallets"
echo "  • Exchange:     http://localhost:3001/exchange"
echo "  • API Health:   http://localhost:5001/api/health"
echo ""
echo "📚 Documentation:"
echo "  • Complete Guide:    COMPLETE_SYSTEM_GUIDE.md"
echo "  • Frontend Guide:    FRONTEND_TRADING_GUIDE.md"
echo "  • Quick Start:       QUICK_START_MULTI_CURRENCY.md"
echo ""
echo "🛑 To Stop All Services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
if [[ $BLOCKCHAIN_PID ]]; then
    echo "  kill $BLOCKCHAIN_PID"
fi
echo "  OR run: pkill -f 'npm run dev'"
echo ""
echo "===================================================="
echo -e "${GREEN}🎉 Platform is ready! Open http://localhost:3001${NC}"
echo "===================================================="
echo ""

