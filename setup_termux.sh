#!/data/data/com.termux/files/usr/bin/bash

# SeaaveyBot Termux Universal Installer
REPO_URL="https://github.com/seaavey/seaavey-bot.git"
TARGET_DIR="SeaaveyBot"

echo "Updating packages..."
pkg update && pkg upgrade -y

echo "Installing system dependencies..."
pkg install -y git nodejs-lts python make g++ pkg-config libvips fontconfig curl

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
export SHARP_IGNORE_GLOBAL_LIBVIPS=0
bun install

echo "----------------------------------------"
echo "Setup Selesai!"
echo "Gunakan: source ~/.bashrc"
echo "Masuk ke folder: cd $TARGET_DIR"
echo "Jalankan: bun run start"
echo "----------------------------------------"
