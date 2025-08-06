# Scripts de Lancement - DHCP Monitor Pro

Ce projet inclut **3 scripts essentiels** pour Windows et Linux pour faciliter le développement et l'installation de l'application DHCP Monitor.

## 🎯 **Scripts Principaux**

### **Windows**

#### 1. `build.bat` - Build Complet
```cmd
build.bat
```
**Fonctionnalités** :
- ✅ Vérification des dépendances (Node.js, npm, Rust)
- ✅ Nettoyage des builds précédents
- ✅ Installation des dépendances npm
- ✅ Build de l'application Tauri
- ✅ **Inclusion automatique des DLLs Npcap**
- ✅ Création des packages (.exe, .msi, installateur)

#### 2. `install.bat` - Installation Complète
```cmd
install.bat
```
**Fonctionnalités** :
- ✅ Vérification des privilèges administrateur
- ✅ **Installation automatique de Npcap** (si nécessaire)
- ✅ Copie de l'exécutable dans Program Files
- ✅ **Copie des DLLs Npcap** (si disponibles)
- ✅ Création des raccourcis (bureau + menu Démarrer)
- ✅ Option de lancement automatique

#### 3. `start.bat` - Développement
```cmd
start.bat
```
**Fonctionnalités** :
- ✅ Vérification des privilèges administrateur
- ✅ Arrêt des processus existants
- ✅ Configuration des variables d'environnement
- ✅ Vérification de Npcap
- ✅ Démarrage du serveur de développement
- ✅ Lancement de l'application Tauri

### **Linux**

#### 1. `build.sh` - Build Complet
```bash
./build.sh
```
**Fonctionnalités** :
- ✅ Vérification des dépendances
- ✅ Nettoyage des builds précédents
- ✅ Installation des dépendances npm
- ✅ Build de l'application Tauri
- ✅ Instructions d'installation

#### 2. `start.sh` - Développement
```bash
./start.sh
```
**Fonctionnalités** :
- ✅ Vérification des privilèges root
- ✅ Élévation automatique avec sudo
- ✅ Arrêt des processus existants
- ✅ Vérification de libpcap
- ✅ Démarrage automatique des services
- ✅ Nettoyage automatique à la fermeture

## 🚀 **Workflow Recommandé**

### **Développement**
```cmd
# Lancement en mode développement
start.bat
```

### **Build et Distribution**
```cmd
# 1. Build complet avec DLLs incluses
build.bat

# 2. Installation automatique
install.bat
```

## 📦 **Packages Générés**

Après `build.bat`, vous obtenez :
- ✅ **dhcp-monitor.exe** (exécutable principal)
- ✅ **wpcap.dll** et **packet.dll** (DLLs Npcap incluses)
- ✅ **DHCP Monitor Pro_0.0.0_x64-setup.exe** (installateur)
- ✅ **DHCP Monitor Pro_0.0.0_x64_en-US.msi** (package MSI)

## 🔧 **Prérequis**

### Windows
- Node.js et npm
- Rust et Cargo
- Npcap (installé automatiquement si nécessaire)

### Linux
- Node.js et npm
- Rust et Cargo
- libpcap-dev

## 📋 **Notes Importantes**

1. **DLLs Incluses** : Le build inclut automatiquement les DLLs Npcap nécessaires
2. **Installation Npcap** : L'installateur installe automatiquement Npcap si nécessaire
3. **Privilèges Requis** : L'application nécessite des privilèges administrateur/root
4. **Package Autonome** : L'exécutable fonctionne sans installation Npcap séparée

## 🎯 **Avantages de cette Approche**

- ✅ **Simplicité** : Seulement 3 scripts essentiels
- ✅ **Autonomie** : DLLs incluses dans le build
- ✅ **Automatisation** : Installation Npcap automatique
- ✅ **Fiabilité** : Vérifications complètes des dépendances
- ✅ **Distribution** : Packages prêts à l'emploi 