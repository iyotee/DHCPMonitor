# DHCP Monitor - Option 50 Tracker

Application moderne de surveillance DHCP avec détection spécifique de l'Option 50 (Requested IP Address). Développée avec Tauri, React et TypeScript pour une expérience multiplateforme.

## 🚀 Fonctionnalités

### 🔧 Fonctionnalités Réseau
- **Capture de paquets DHCP** en temps réel
- **Détection de l'Option 50** (Requested IP Address)
- **Support des types de message DHCP** : DISCOVER, OFFER, REQUEST, ACK, NACK
- **Détection intelligente** de la Gateway et de l'interface réseau utilisée
- **Privilèges admin/root** pour accéder aux interfaces réseau

### 🖼️ Interface Graphique
- **Interface moderne** avec sidebar de navigation
- **Onglets spécialisés** :
  - Logs (colorés)
  - Option 50 (vue filtrée)
  - Graphiques en temps réel
  - Statistiques (paquets, type, par interface)
  - Réseau (interfaces détectées)
- **Thèmes** : Sombre / Clair / Auto (détection système)
- **Logs colorés** avec code couleur :
  - 🟢 Succès
  - 🔴 Erreurs
  - 🟠 Avertissements
  - 🟣 Option 50
  - 🟡 Gateway
  - 🔵 Informations

### 📈 Statistiques et Données
- **Nombre total de paquets** capturés
- **Nombre de paquets Option 50**
- **Fréquence des types de messages** (DISCOVER, OFFER, etc.)
- **Activité de la passerelle** (Gateway)
- **Graphiques en temps réel** style Wireshark

## 🛠️ Installation

### Prérequis

- **Node.js** (version 16 ou supérieure)
- **Rust** (version 1.70 ou supérieure)
- **Git**

### Installation des Dépendances

```bash
# Cloner le repository
git clone <repository-url>
cd dhcp-monitor

# Les scripts de démarrage installent automatiquement toutes les dépendances
# Voir la section "Développement" ci-dessous
```

### Développement

Les scripts de démarrage facilitent le lancement de l'application :

#### Windows
```cmd
# Script de lancement avec privilèges administrateur
start.bat

# Ou manuellement
npm run dev
npx @tauri-apps/cli dev
```

#### Linux
```bash
# Script de lancement avec privilèges root
./start.sh

# Ou manuellement
sudo npm run dev
sudo npx @tauri-apps/cli dev
```

**Note** : Les scripts gèrent automatiquement :
- ✅ **Vérification des privilèges** (admin/root)
- ✅ **Arrêt des processus existants**
- ✅ **Configuration des variables d'environnement**
- ✅ **Vérification des dépendances**
- ✅ **Démarrage automatique des services**

Voir `SCRIPTS.md` pour plus de détails sur les scripts de lancement.

### Build et Installation

#### Windows
```cmd
# Build complet avec DLLs Npcap incluses
build.bat

# Installation automatique avec Npcap
install.bat

# Ou manuellement
npx @tauri-apps/cli build
```

#### Linux
```bash
# Build de l'application
./build.sh

# Installation manuelle
sudo cp src-tauri/target/release/dhcp-monitor /usr/local/bin/
sudo chmod +x /usr/local/bin/dhcp-monitor
```

## 🔐 Permissions et Exécution

### Windows
```cmd
# Exécuter en tant qu'administrateur
dhcp-monitor.exe
```

### Linux/macOS
```bash
# Exécuter avec sudo pour les privilèges réseau
sudo ./dhcp-monitor
```

## 📦 Packaging

L'application génère automatiquement des exécutables pour chaque plateforme :

- **Windows** : `.exe` (avec installer)
- **Linux** : `.AppImage` et `.deb`
- **macOS** : `.dmg`

## 🎯 Utilisation

1. **Lancer l'application** avec les privilèges administrateur
2. **Sélectionner l'interface réseau** dans la sidebar
3. **Démarrer la capture** avec le bouton vert
4. **Observer les logs** en temps réel dans l'onglet "Logs"
5. **Analyser l'Option 50** dans l'onglet dédié
6. **Consulter les statistiques** pour une vue d'ensemble

## 🏗️ Architecture Technique

### Stack Technique
- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Rust + Tauri
- **Capture réseau** : libpcap
- **Graphiques** : Recharts
- **Icons** : Lucide React

### Structure du Projet
```
dhcp-monitor/
├── src/                    # Code React/TypeScript
│   ├── components/         # Composants React
│   └── App.tsx            # Application principale
├── src-tauri/             # Code Rust/Tauri
│   ├── src/               # Code Rust
│   │   ├── main.rs        # Point d'entrée
│   │   ├── dhcp_capture.rs # Capture DHCP
│   │   └── network_interfaces.rs # Interfaces réseau
│   └── Cargo.toml         # Dépendances Rust
├── package.json           # Dépendances Node.js
└── README.md             # Documentation
```

## 🔧 Configuration

### Variables d'Environnement
- `TAURI_DEBUG` : Mode debug (développement)
- `RUST_LOG` : Niveau de log Rust

### Paramètres de l'Application
- **Intervalle d'actualisation** : 500ms - 10s
- **Nombre maximum de logs** : 100 - 10000
- **Affichage des données brutes** : Optionnel
- **Thème** : Auto/Sombre/Clair

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de permissions** :
   - Windows : Exécuter en tant qu'administrateur
   - Linux/macOS : Utiliser `sudo`

2. **Aucune interface détectée** :
   - Vérifier les privilèges réseau
   - Redémarrer l'application

3. **Pas de paquets capturés** :
   - Vérifier que l'interface est active
   - S'assurer qu'il y a du trafic DHCP

### Logs de Debug

```bash
# Activer les logs détaillés
RUST_LOG=debug npm run tauri dev
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Tauri** pour le framework multiplateforme
- **React** pour l'interface utilisateur
- **libpcap** pour la capture réseau
- **Recharts** pour les graphiques
- **Tailwind CSS** pour le styling

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation technique
- Vérifier les logs de debug

---

**DHCP Monitor - Option 50 Tracker** - Surveillance DHCP moderne et performante