#!/usr/bin/env bash
# ==============================================================================
# ONCOGRAPH-X: 1-CLICK GITHUB PUBLISHING SCRIPT
# Run this script to push the entire verified codebase to your GitHub profile.
# ==============================================================================

set -e

echo "🚀 OncoGraph-X GitHub Publishing Utility"
echo "----------------------------------------"

if [ -z "$1" ]; then
    echo "Usage: ./push_to_github.sh <your-github-username-or-repo-url>"
    echo "Example: ./push_to_github.sh shivkumar-khatge"
    echo "Or:      ./push_to_github.sh https://github.com/shivkumar-khatge/oncograph-x.git"
    exit 1
fi

TARGET="$1"

if [[ "$TARGET" == http* ]] || [[ "$TARGET" == git@* ]]; then
    REPO_URL="$TARGET"
else
    REPO_URL="https://github.com/${TARGET}/oncograph-x.git"
fi

echo "Connecting remote origin to: $REPO_URL"

# Remove existing remote if present
git remote remove origin 2>/dev/null || true

# Add new remote
git remote add origin "$REPO_URL"

# Push main branch
echo "Pushing code, architecture, and README to GitHub main branch..."
git push -u origin main

echo ""
echo "✅ SUCCESS! OncoGraph-X is now live on your GitHub profile:"
echo "👉 $REPO_URL"
