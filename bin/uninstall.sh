#!/bin/bash

set -e

echo "╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮"
echo "┃   SeaaveyBot Uninstaller  ┃"
echo "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
echo ""

read -p "⚠️  Yakin mau uninstall SeaaveyBot? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "❌ Dibatalkan."
  exit 0
fi

echo "🗑️  Menghapus node_modules..."
rm -rf node_modules

echo "🗑️  Menghapus auth session..."
rm -rf auth

echo "🗑️  Menghapus database..."
rm -f *.db *.db-wal *.db-shm

echo "🗑️  Menghapus .env..."
rm -f .env

echo ""
echo "✅ Uninstall selesai."
echo "   Untuk hapus folder project: rm -rf $(pwd)"
echo ""
