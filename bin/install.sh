#!/bin/bash

set -e

echo "╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮"
echo "┃   SeaaveyBot Installer    ┃"
echo "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "⚠️  Jangan jalankan sebagai root!"
  exit 1
fi

# Install Bun if not installed
if ! command -v bun &>/dev/null; then
  echo "📦 Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
  export PATH="$HOME/.bun/bin:$PATH"
  echo "✅ Bun installed"
else
  echo "✅ Bun already installed ($(bun --version))"
fi

# Install ffmpeg if not installed
if ! command -v ffmpeg &>/dev/null; then
  echo "📦 Installing ffmpeg..."
  if command -v apt &>/dev/null; then
    sudo apt update && sudo apt install -y ffmpeg
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm ffmpeg
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y ffmpeg
  elif command -v brew &>/dev/null; then
    brew install ffmpeg
  else
    echo "❌ Package manager tidak dikenali. Install ffmpeg manual."
    exit 1
  fi
  echo "✅ ffmpeg installed"
else
  echo "✅ ffmpeg already installed ($(ffmpeg -version | head -1))"
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Setup .env
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ .env created from .env.example"
  else
    cat >.env <<EOF
NODE_ENV=production
OWNER_NUMBER=
API_KEY=
EOF
    echo "✅ .env created"
  fi
else
  echo "✅ .env already exists"
fi

# Create auth directory
mkdir -p auth

echo ""
echo "╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮"
echo "┃   ✅ Installation Done!    ┃"
echo "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
echo ""
echo "Edit .env lalu jalankan:"
echo "  bun run start"
echo ""
