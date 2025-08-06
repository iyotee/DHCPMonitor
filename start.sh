#!/bin/bash

# DHCP Monitor - Option 50 Tracker
# Script de lancement pour Linux

echo "DHCP Monitor - Option 50 Tracker"
echo "================================"
echo

# Vérifier si on a les privilèges root
if [ "$EUID" -ne 0 ]; then
    echo "Cette application nécessite des privilèges root pour capturer les paquets DHCP."
    echo "Relancement avec sudo..."
    echo
    echo "ATTENTION: Le système va demander votre mot de passe."
    echo "Entrez votre mot de passe pour continuer."
    echo
    read -p "Appuyez sur Entrée pour continuer..."
    
    # Relancer le script avec sudo
    exec sudo "$0" "$@"
    exit $?
fi

# Forcer le changement vers le répertoire du script
cd "$(dirname "$0")"

echo "Arrêt des processus existants..."
echo "Recherche des processus sur le port 1420..."
pkill -f ":1420" 2>/dev/null

echo "Arrêt des processus Node.js..."
pkill -f "node" 2>/dev/null

echo "Arrêt des processus Vite..."
pkill -f "vite" 2>/dev/null

echo "Processus arrêtés avec succès"
echo

echo "Configuration des variables d'environnement..."
export RUSTFLAGS=""
echo "Variables d'environnement configurées."
echo

echo "Vérification de libpcap..."
if command -v pkg-config >/dev/null 2>&1 && pkg-config --exists libpcap; then
    echo "libpcap trouvé via pkg-config"
elif ldconfig -p | grep -q libpcap; then
    echo "libpcap trouvé dans le système"
else
    echo "ATTENTION: libpcap n'est pas installé ou n'est pas trouvé"
    echo "Installation recommandée: sudo apt-get install libpcap-dev (Ubuntu/Debian)"
    echo "ou: sudo yum install libpcap-devel (CentOS/RHEL)"
    echo
    read -p "Continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo
echo "Vérification des dépendances..."
echo

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

echo "Toutes les dépendances sont installées"
echo

echo "Démarrage de l'application en mode développement..."
echo

echo "NOTE: Application lancée avec privilèges root"
echo "pour capturer les paquets DHCP."
echo

echo "Démarrage du serveur de développement..."
echo "Attente du démarrage du serveur..."

# Démarrer le serveur de développement en arrière-plan
npm run dev &
DEV_PID=$!

# Attendre que le serveur démarre
sleep 5

echo "Démarrage de l'application Tauri..."

# Fonction de nettoyage
cleanup() {
    echo
    echo "Arrêt de l'application..."
    kill $DEV_PID 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "tauri" 2>/dev/null
    echo "Application arrêtée"
    exit 0
}

# Capturer Ctrl+C pour nettoyer
trap cleanup SIGINT SIGTERM

# Démarrer l'application Tauri
npx @tauri-apps/cli dev

# Nettoyer à la fin
cleanup 