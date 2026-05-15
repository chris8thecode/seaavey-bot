#!/bin/bash

set -e

echo "╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮"
echo "┃    SeaaveyBot Updater     ┃"
echo "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
echo ""

echo "📥 Pulling latest changes..."
git pull --rebase

echo "📦 Updating dependencies..."
bun install

echo ""
echo "✅ Update selesai! Restart bot:"
echo "   bun run start"
echo ""
