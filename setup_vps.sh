#!/bin/bash

# SeaaveyBot VPS Universal Installer
REPO_URL="https://github.com/seaavey/seaavey-bot.git"
TARGET_DIR="SeaaveyBot"

echo "Updating system..."
sudo apt update && sudo apt upgrade -y

echo "Installing system dependencies..."
sudo apt install -y git curl build-essential pkg-config libvips-dev fontconfig

echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
if ! grep -q "BUN_INSTALL" ~/.bashrc; then
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
fi

echo "Cloning repository..."
if [ ! -d "$TARGET_DIR" ]; then
    git clone $REPO_URL $TARGET_DIR
fi

cd $TARGET_DIR || exit

echo "Installing project dependencies..."
$HOME/.bun/bin/bun install

echo "Installing PM2..."
if command -v npm &> /dev/null; then
    sudo npm install -g pm2
else
    $HOME/.bun/bin/bun add -g pm2
fi

echo "----------------------------------------"
echo "Setup Selesai!"
echo "Gunakan: source ~/.bashrc"
echo "Masuk ke folder: cd $TARGET_DIR"
echo "Start Bot: pm2 start src/index.ts --name seaaveybot --interpreter ~/.bun/bin/bun"
echo "----------------------------------------"
