#!/bin/bash

echo "🔍 Testing Header component for TypeScript errors..."

echo "📁 Current directory: $(pwd)"

echo "🔧 Running TypeScript check on Header component..."
npx tsc --noEmit --skipLibCheck src/components/Header.tsx

if [ $? -eq 0 ]; then
    echo "✅ Header component TypeScript check passed!"
else
    echo "❌ Header component has TypeScript errors!"
fi

echo "✅ Header test complete!"
