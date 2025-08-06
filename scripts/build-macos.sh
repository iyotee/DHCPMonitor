#!/bin/bash

# Script de build pour macOS
# Usage: ./build-macos.sh

set -e

echo "🍎 Build DHCP Monitor pour macOS"

# Vérifier les prérequis
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust n'est pas installé"
    exit 1
fi

# Installer les targets macOS si nécessaire
echo "📦 Installation des targets macOS..."
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Build du frontend
echo "🔨 Build du frontend..."
npm run build

# Créer l'icône .icns si elle n'existe pas
if [ ! -f "src-tauri/icons/icon.icns" ]; then
    echo "🎨 Création de l'icône .icns..."
    cd src-tauri/icons
    python3 create_icns.py
    cd ../..
fi

# Build de l'application Tauri
echo "🔨 Build de l'application Tauri..."
npx @tauri-apps/cli build --target universal-apple-darwin

echo "✅ Build terminé !"
echo "📦 Fichiers générés dans src-tauri/target/release/bundle/"

# Lister les fichiers générés
echo "📋 Fichiers disponibles :"
ls -la src-tauri/target/release/bundle/ 