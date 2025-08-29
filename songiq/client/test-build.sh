#!/bin/bash

echo "🔍 Testing songIQ client build process..."

echo "📦 Checking dependencies..."
npm list --depth=0

echo "🔧 Running TypeScript check..."
npx tsc --noEmit

echo "🚀 Running Vite build..."
npx vite build

echo "✅ Build test complete!"
