# Structure du Projet DHCP Monitor

## 📁 Organisation des Dossiers

### 🚀 **Racine du Projet**
```
DHCPMonitor/
├── 📁 src/                    # Code source React/TypeScript
├── 📁 src-tauri/              # Code source Rust/Tauri
├── 📁 dist/                   # Build de production
├── 📁 node_modules/           # Dépendances Node.js
├── 📁 .github/                # GitHub Actions
├── 📁 scripts/                # Scripts de build et d'installation
├── 📁 config/                 # Fichiers de configuration
├── 📁 docs/                   # Documentation
├── 📁 tools/                  # Outils utilitaires
├── 📄 package.json            # Configuration Node.js
├── 📄 package-lock.json       # Verrouillage des dépendances
├── 📄 README.md               # Documentation principale
├── 📄 index.html              # Point d'entrée HTML
└── 📄 .gitignore              # Fichiers ignorés par Git
```

### 🔧 **Dossier Scripts** (`scripts/`)
```
scripts/
├── 🪟 start.bat              # Démarrage Windows
├── 🪟 build.bat              # Build Windows
├── 🪟 install.bat            # Installation Windows
├── 🪟 create-portable.bat    # Création version portable
├── 🐧 start.sh               # Démarrage Linux/macOS
├── 🐧 build.sh               # Build Linux/macOS
├── 🐧 build-macos.sh         # Build spécifique macOS
└── 🪟 elevate.vbs            # Élévation de privilèges Windows
```

### ⚙️ **Dossier Configuration** (`config/`)
```
config/
├── 📄 tailwind.config.js     # Configuration Tailwind CSS
├── 📄 postcss.config.js      # Configuration PostCSS
├── 📄 tsconfig.json          # Configuration TypeScript
├── 📄 tsconfig.node.json     # Configuration TypeScript Node
└── 📄 vite.config.ts         # Configuration Vite
```

### 📚 **Dossier Documentation** (`docs/`)
```
docs/
├── 📄 STRUCTURE.md           # Ce fichier
└── 📄 LICENSE                # Licence du projet
```

## 🔗 **Compatibilité**

### **Scripts de Redirection**
Les scripts principaux restent disponibles à la racine pour maintenir la compatibilité :
- `start.bat` → `scripts/start.bat`
- `build.bat` → `scripts/build.bat`
- `install.bat` → `scripts/install.bat`
- `start.sh` → `scripts/start.sh`
- `build.sh` → `scripts/build.sh`

### **Configuration**
Les fichiers de configuration utilisent des liens vers le dossier `config/` :
- `tailwind.config.js` → `config/tailwind.config.js`
- `postcss.config.js` → `config/postcss.config.js`
- `tsconfig.json` → `config/tsconfig.json`
- `tsconfig.node.json` → `config/tsconfig.node.json`
- `vite.config.ts` → `config/vite.config.ts`

## 🚀 **Utilisation**

### **Développement**
```bash
# Démarrage (Windows)
start.bat

# Démarrage (Linux/macOS)
./start.sh

# Ou directement depuis le dossier scripts
scripts/start.bat
scripts/start.sh
```

### **Build**
```bash
# Build (Windows)
build.bat

# Build (Linux/macOS)
./build.sh

# Ou directement depuis le dossier scripts
scripts/build.bat
scripts/build.sh
```

### **Installation**
```bash
# Installation (Windows)
install.bat

# Ou directement depuis le dossier scripts
scripts/install.bat
```

## 📝 **Avantages de cette Structure**

1. **🧹 Organisation** : Fichiers regroupés par type
2. **🔗 Compatibilité** : Scripts principaux toujours accessibles
3. **📚 Documentation** : Structure claire et documentée
4. **🔧 Maintenance** : Plus facile de trouver et modifier les fichiers
5. **🚀 Développement** : Séparation claire entre code, config et scripts

## 🎯 **Conventions**

- **Scripts** : Toujours dans `scripts/`
- **Configuration** : Toujours dans `config/`
- **Documentation** : Toujours dans `docs/`
- **Outils** : Toujours dans `tools/`
- **Code source** : Toujours dans `src/` et `src-tauri/` 