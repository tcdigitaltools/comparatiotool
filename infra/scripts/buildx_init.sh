#!/usr/bin/env bash
# ========================================
# Docker Buildx Initialization Script
# Sets up multi-architecture build support
# ========================================

set -euo pipefail

echo "🏗️  Initializing Docker Buildx for multi-architecture builds..."

# Use existing builder or create new one
if docker buildx inspect comparatio-builder >/dev/null 2>&1; then
    echo "✅ Builder 'comparatio-builder' already exists, using it..."
    docker buildx use comparatio-builder
else
    echo "📦 Creating new builder 'comparatio-builder'..."
    docker buildx create --name comparatio-builder --use
fi

# Bootstrap the builder
echo "🔍 Bootstrapping builder..."
docker buildx inspect --bootstrap >/dev/null

echo ""
echo "✅ Buildx initialization complete!"
echo "   Builder: comparatio-builder"
echo "   Platforms: linux/amd64, linux/arm64"

