#!/bin/bash

# DHCP Monitor - Option 50 Tracker
# Script de build pour Linux

echo "DHCP Monitor - Build Script"
echo "==========================="
echo

# Vérifier si on a les privilèges root pour certaines opérations
if [ "$EUID" -eq 0 ]; then
    echo "Build avec privilèges root détectés"
fi

# Forcer le changement vers le répertoire du script
cd "$(dirname "$0")"

echo "Vérification des dépendances..."

# Vérifier si Node.js est installé
if ! command -v node >/dev/null 2>&1; then
    echo "ERREUR: Node.js n'est pas installé"
    echo "Installation recommandée: https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm >/dev/null 2>&1; then
    echo "ERREUR: npm n'est pas installé"
    echo "Installation recommandée: https://nodejs.org/"
    exit 1
fi

# Vérifier si Rust est installé
if ! command -v cargo >/dev/null 2>&1; then
    echo "ERREUR: Rust n'est pas installé"
    echo "Installation recommandée: https://rustup.rs/"
    exit 1
fi

# Vérifier si Tauri CLI est installé
if ! command -v npx >/dev/null 2>&1; then
    echo "ERREUR: npx n'est pas installé"
    exit 1
fi

echo "Toutes les dépendances sont installées"
echo

echo "Nettoyage des builds précédents..."
rm -rf src-tauri/target
rm -rf dist
echo "Nettoyage terminé"
echo

echo "Installation des dépendances npm..."
npm install
if [ $? -ne 0 ]; then
    echo "ERREUR: Échec de l'installation des dépendances npm"
    exit 1
fi
echo "Dépendances npm installées"
echo

echo "Configuration des variables d'environnement..."
export RUSTFLAGS=""
echo "Variables d'environnement configurées"
echo

echo "Build de l'application Tauri..."
echo "Cette opération peut prendre plusieurs minutes..."

# Build de l'application
npx @tauri-apps/cli build

if [ $? -eq 0 ]; then
    echo
    echo "✅ Build réussi !"
    echo
    echo "L'application a été compilée dans :"
    echo "  - src-tauri/target/release/dhcp-monitor"
    echo "  - src-tauri/target/release/bundle/"
    echo
    echo "Pour installer l'application :"
    echo "  sudo cp src-tauri/target/release/dhcp-monitor /usr/local/bin/"
    echo "  sudo chmod +x /usr/local/bin/dhcp-monitor"
    echo
    echo "Pour créer un package :"
    echo "  npx @tauri-apps/cli build --target x86_64-unknown-linux-gnu"
else
    echo
    echo "❌ Échec du build"
    echo
    echo "Vérifiez les erreurs ci-dessus et réessayez."
    echo "Assurez-vous que toutes les dépendances sont installées :"
    echo "  - libpcap-dev"
    echo "  - build-essential"
    echo "  - pkg-config"
    exit 1
fi 