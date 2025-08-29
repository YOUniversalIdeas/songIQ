#!/bin/bash

echo "🔧 Fixing songIQ client build issues..."

echo "📦 Installing dependencies..."
npm install

echo "🔍 Checking for missing files..."
if [ ! -f "src/vite-env.d.ts" ]; then
    echo "❌ vite-env.d.ts is missing!"
    exit 1
fi

echo "🔧 Running TypeScript check..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed!"
    
    echo "🚀 Running Vite build..."
    npx vite build
    
    if [ $? -eq 0 ]; then
        echo "🎉 Build successful!"
    else
        echo "❌ Vite build failed!"
        exit 1
    fi
else
    echo "❌ TypeScript check failed!"
    exit 1
fi

echo "✅ Build fix complete!"
