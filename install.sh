#!/usr/bin/env bash

# SeaaveyBot Universal Installer (VPS + Termux)

set -euo pipefail

REPO_URL="https://github.com/seaavey/seaavey-bot.git"
TARGET_DIR="SeaaveyBot"

detect_platform() {
  if [ -f /data/data/com.termux/files/usr/bin/bash ]; then
    echo "termux"
  else
    echo "vps"
  fi
}

platform=$(detect_platform)
echo "Detected platform: $platform"

if [ "$platform" = "termux" ]; then
  echo "Updating packages..."
  pkg update && pkg upgrade -y

  echo "Installing system dependencies..."
  pkg install -y git nodejs-lts python make g++ pkg-config libvips fontconfig curl
else
  echo "Updating system..."
  sudo apt update && sudo apt upgrade -y

  echo "Installing system dependencies..."
  sudo apt install -y git curl build-essential pkg-config libvips-dev fontconfig
fi

if [ "$platform" != "termux" ]; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  if ! grep -q "BUN_INSTALL" ~/.bashrc 2>/dev/null; then
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
  fi
fi

echo "Cloning repository..."
if [ ! -d "$TARGET_DIR" ]; then
  git clone "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR" || exit

echo "Installing project dependencies..."
if [ "$platform" = "termux" ]; then
  export SHARP_IGNORE_GLOBAL_LIBVIPS=0
  npm install
else
  "$HOME/.bun/bin/bun" install
fi

if [ "$platform" != "termux" ]; then
  echo "Installing PM2..."
  if command -v npm &> /dev/null; then
    sudo npm install -g pm2
  else
    "$HOME/.bun/bin/bun" add -g pm2
  fi
fi

echo "----------------------------------------"
echo "Setup Selesai!"
echo "Gunakan: source ~/.bashrc"
echo "Masuk ke folder: cd $TARGET_DIR"
if [ "$platform" = "termux" ]; then
  echo "Jalankan: npm run start:node"
else
  echo "Start Bot: pm2 start src/index.ts --name seaaveybot --interpreter ~/.bun/bin/bun"
fi
echo "----------------------------------------"
