#!/bin/bash

echo "🔍 Testing songIQ server build process..."

echo "📁 Current directory: $(pwd)"

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running TypeScript check..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed!"
    
    echo "🚀 Running build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "🎉 Server build successful!"
    else
        echo "❌ Server build failed!"
        exit 1
    fi
else
    echo "❌ TypeScript check failed!"
    exit 1
fi

echo "✅ Server build test complete!"
