#!/bin/bash

echo "🔍 Testing TypeScript compilation..."

echo "📁 Current directory: $(pwd)"
echo "📁 Checking if shared types exist:"
ls -la ../shared/types/

echo "🔧 Running TypeScript check..."
npx tsc --noEmit --skipLibCheck

echo "✅ TypeScript check complete!"
