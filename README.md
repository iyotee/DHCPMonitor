# DHCP Monitor - Option 50 Tracker

<div align="center">
  <img src="src/assets/logo_colored.png" alt="DHCP Monitor Logo" width="200" height="200">
  <br>
  <h3>Application moderne de surveillance DHCP avec détection spécifique de l'Option 50</h3>
  <p>Développée avec <strong>Tauri</strong>, <strong>React</strong> et <strong>TypeScript</strong> pour une expérience multiplateforme</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue.svg)](https://tauri.app/)
  [![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
  [![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
</div>

---

## 📋 Table des Matières

- [🚀 Fonctionnalités](#-fonctionnalités)
- [🎯 Cas d'Usage](#-cas-dusage)
- [📦 Installation](#-installation)
- [🛠️ Développement](#️-développement)
- [📊 Architecture Technique](#-architecture-technique)
- [🔧 Configuration](#-configuration)
- [🐛 Dépannage](#-dépannage)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## 🚀 Fonctionnalités

### 🔧 Capture Réseau Avancée
- **Capture de paquets DHCP** en temps réel avec libpcap
- **Détection intelligente de l'Option 50** (Requested IP Address)
- **Support complet des types DHCP** : DISCOVER, OFFER, REQUEST, ACK, NACK, DECLINE, RELEASE
- **Détection automatique** de la Gateway et des interfaces réseau
- **Privilèges administrateur** pour accès aux interfaces réseau
- **Filtrage intelligent** des paquets DHCP

### 🖼️ Interface Utilisateur Moderne
- **Interface responsive** avec sidebar de navigation
- **Onglets spécialisés** :
  - 📝 **Logs** : Affichage coloré en temps réel
  - 🎯 **Option 50** : Vue filtrée des requêtes d'IP
  - 📊 **Statistiques** : Graphiques et métriques
  - 🌐 **Réseau** : Interfaces détectées
  - ⚙️ **Paramètres** : Configuration avancée
- **Thèmes dynamiques** : Sombre / Clair / Auto (détection système)
- **Logs colorés** avec code couleur intuitif :
  - 🟢 **Succès** : Paquets capturés avec succès
  - 🔴 **Erreurs** : Erreurs de capture ou réseau
  - 🟠 **Avertissements** : Problèmes mineurs
  - 🟣 **Option 50** : Requêtes d'IP spécifiques
  - 🟡 **Gateway** : Activité de la passerelle
  - 🔵 **Informations** : Messages généraux

### 📈 Analytics et Métriques
- **Compteurs en temps réel** :
  - Nombre total de paquets capturés
  - Nombre de paquets Option 50
  - Fréquence des types de messages DHCP
  - Activité de la passerelle
- **Graphiques interactifs** style Wireshark
- **Export de données** (JSON, CSV)
- **Historique des captures**

---

## 🎯 Cas d'Usage

### 🔍 Surveillance Réseau
- **Administrateurs réseau** : Surveillance du trafic DHCP
- **Sécurité** : Détection d'attaques DHCP (DHCP Starvation, Rogue DHCP)
- **Dépannage** : Analyse des problèmes de configuration DHCP
- **Audit** : Vérification des politiques DHCP

### 🎯 Détection Option 50
- **Analyse des requêtes d'IP** spécifiques
- **Détection de clients malveillants** utilisant des IP fixes
- **Audit de conformité** des politiques DHCP
- **Optimisation réseau** basée sur les patterns d'utilisation

---

## 📦 Installation

### ⚡ Installation Rapide

#### Windows
```cmd
# Télécharger la dernière release
# Exécuter DHCPMonitor-Setup.exe
# Lancer avec privilèges administrateur
```

#### Linux
```bash
# Télécharger l'AppImage
chmod +x DHCPMonitor-*.AppImage
./DHCPMonitor-*.AppImage
```

### 🛠️ Installation Développeur

#### Prérequis
- **Node.js** (v18+)
- **Rust** (v1.70+)
- **Git**
- **Privilèges administrateur/root**

#### Installation des Dépendances

```bash
# Cloner le repository
git clone https://github.com/iyotee/DHCPMonitor.git
cd DHCPMonitor

# Installation automatique (recommandé)
install.bat    # Windows
./install.sh   # Linux/macOS

# Ou manuellement
npm install
cargo build
```

---

## 🛠️ Développement

### 🚀 Démarrage Rapide

#### Windows
```cmd
# Script de lancement avec privilèges administrateur
start.bat

# Ou manuellement
npm run dev
npx @tauri-apps/cli dev
```

#### Linux/macOS
```bash
# Script de lancement avec privilèges root
./start.sh

# Ou manuellement
sudo npm run dev
sudo npx @tauri-apps/cli dev
```

### 🔧 Scripts Disponibles

| Script | Description | Plateforme |
|--------|-------------|------------|
| `start.bat` / `start.sh` | Démarrage avec privilèges | Windows/Linux |
| `build.bat` / `build.sh` | Build complet avec DLLs | Windows/Linux |
| `install.bat` / `install.sh` | Installation automatique | Windows/Linux |

### 📦 Build et Packaging

#### Windows
```cmd
# Build complet avec DLLs Npcap incluses
build.bat

# Génération de l'installer
npx @tauri-apps/cli build --target msi
```

#### Linux
```bash
# Build de l'application
./build.sh

# Génération AppImage
npx @tauri-apps/cli build --target appimage
```

---

## 📊 Architecture Technique

### 🏗️ Stack Technique

| Couche | Technologie | Description |
|--------|-------------|-------------|
| **Frontend** | React 18 + TypeScript | Interface utilisateur moderne |
| **Styling** | Tailwind CSS | Design system responsive |
| **Backend** | Rust + Tauri | Performance native |
| **Réseau** | libpcap | Capture de paquets |
| **Graphiques** | Recharts | Visualisations en temps réel |
| **Icons** | Lucide React | Icônes modernes |

### 📁 Structure du Projet

```
DHCPMonitor/
├── 📁 src/                    # Frontend React/TypeScript
│   ├── 📁 components/         # Composants React
│   │   ├── LogsView.tsx      # Vue des logs
│   │   ├── NetworkView.tsx   # Vue réseau
│   │   ├── Option50View.tsx  # Vue Option 50
│   │   ├── PacketDetails.tsx # Détails des paquets
│   │   └── SettingsView.tsx  # Paramètres
│   ├── 📁 assets/            # Assets (logos, images)
│   ├── 📁 types/             # Types TypeScript
│   └── App.tsx               # Application principale
├── 📁 src-tauri/             # Backend Rust/Tauri
│   ├── 📁 src/               # Code Rust
│   │   ├── main.rs           # Point d'entrée
│   │   ├── dhcp_capture.rs   # Capture DHCP
│   │   └── network_interfaces.rs # Interfaces réseau
│   ├── 📁 icons/             # Icônes de l'application
│   ├── 📁 gen/               # Schémas générés
│   └── Cargo.toml            # Dépendances Rust
├── 📁 dist/                  # Build de production
├── 📄 package.json           # Dépendances Node.js
├── 📄 tauri.conf.json        # Configuration Tauri
└── 📄 README.md              # Documentation
```

### 🔧 Composants Clés

#### Frontend (React/TypeScript)
- **LogsView** : Affichage des logs en temps réel
- **NetworkView** : Gestion des interfaces réseau
- **Option50View** : Filtrage et analyse Option 50
- **PacketDetails** : Détails des paquets capturés
- **SettingsView** : Configuration de l'application

#### Backend (Rust/Tauri)
- **dhcp_capture.rs** : Capture et parsing DHCP
- **network_interfaces.rs** : Détection des interfaces
- **main.rs** : Orchestration et communication

---

## 🔧 Configuration

### ⚙️ Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `TAURI_DEBUG` | Mode debug (développement) | `false` |
| `RUST_LOG` | Niveau de log Rust | `info` |
| `DHCP_CAPTURE_TIMEOUT` | Timeout de capture (ms) | `1000` |
| `MAX_PACKETS` | Nombre max de paquets | `10000` |

### 🎛️ Paramètres de l'Application

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| **Intervalle d'actualisation** | 500ms - 10s | 1000ms | Fréquence de mise à jour |
| **Nombre max de logs** | 100 - 10000 | 1000 | Limite d'affichage |
| **Affichage données brutes** | Booléen | `false` | Mode debug |
| **Thème** | Auto/Sombre/Clair | `Auto` | Apparence |

### 📊 Configuration Réseau

```json
{
  "capture": {
    "timeout": 1000,
    "promiscuous": true,
    "filter": "udp port 67 or udp port 68"
  },
  "interface": {
    "auto_detect": true,
    "preferred": "eth0"
  },
  "logging": {
    "level": "info",
    "max_entries": 1000
  }
}
```

---

## 🐛 Dépannage

### ❗ Problèmes Courants

#### 1. Erreur de Permissions
```bash
# Windows
# Exécuter en tant qu'administrateur
# Clic droit → "Exécuter en tant qu'administrateur"

# Linux/macOS
sudo ./DHCPMonitor
```

#### 2. Aucune Interface Détectée
```bash
# Vérifier les privilèges
# Windows : Exécuter en tant qu'administrateur
# Linux : sudo

# Vérifier les interfaces
ipconfig  # Windows
ifconfig  # Linux/macOS
```

#### 3. Pas de Paquets Capturés
- ✅ Vérifier que l'interface est active
- ✅ S'assurer qu'il y a du trafic DHCP
- ✅ Vérifier les filtres de capture
- ✅ Redémarrer l'application

#### 4. Erreur DLL (Windows)
```cmd
# Réinstaller Npcap
# Télécharger depuis https://npcap.com/
# Ou utiliser install.bat
```

### 🔍 Logs de Debug

```bash
# Activer les logs détaillés
RUST_LOG=debug npm run tauri dev

# Logs spécifiques
RUST_LOG=dhcp_capture=debug npm run tauri dev
```

### 📋 Checklist de Diagnostic

- [ ] Privilèges administrateur/root
- [ ] Interface réseau active
- [ ] Trafic DHCP présent
- [ ] Filtres de capture corrects
- [ ] DLLs Npcap installées (Windows)
- [ ] libpcap installé (Linux)

---

## 🤝 Contribution

Nous accueillons toutes les contributions ! Voici comment participer :

### 🚀 Première Contribution

1. **Fork** le projet
2. **Clone** votre fork
3. **Créez** une branche feature
4. **Commitez** vos changements
5. **Poussez** vers votre fork
6. **Ouvrez** une Pull Request

### 📝 Guidelines

- **Code Style** : Suivre les conventions existantes
- **Tests** : Ajouter des tests pour les nouvelles fonctionnalités
- **Documentation** : Mettre à jour la documentation
- **Commits** : Messages clairs et descriptifs

### 🐛 Signaler un Bug

1. Vérifier les [issues existantes](https://github.com/iyotee/DHCPMonitor/issues)
2. Créer une nouvelle issue avec :
   - Description détaillée du problème
   - Étapes pour reproduire
   - Configuration système
   - Logs d'erreur

### 💡 Proposer une Fonctionnalité

1. Créer une issue avec le label "enhancement"
2. Décrire la fonctionnalité souhaitée
3. Expliquer le cas d'usage
4. Proposer une implémentation

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [`LICENSE`](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2024 DHCP Monitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Remerciements

- **[Tauri](https://tauri.app/)** - Framework multiplateforme
- **[React](https://reactjs.org/)** - Interface utilisateur
- **[libpcap](https://www.tcpdump.org/)** - Capture réseau
- **[Recharts](https://recharts.org/)** - Graphiques
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Lucide React](https://lucide.dev/)** - Icônes

---

<div align="center">
  <p><strong>DHCP Monitor - Option 50 Tracker</strong></p>
  <p>Surveillance DHCP moderne et performante</p>
  <p>⭐ N'hésitez pas à donner une étoile si ce projet vous est utile !</p>
</div>