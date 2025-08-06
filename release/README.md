# DHCP Monitor - Release v1.0.0

## 📦 Fichiers de Release

### 🚀 Version Portable (Recommandée pour Test)
- **`DHCPMonitor.exe`** - Exécutable portable (8.3 MB)
- **`packet.dll`** - DLL Npcap requise (108 KB)
- **`wpcap.dll`** - DLL WinPcap requise (370 KB)

### 📦 Version Installée
- **`DHCP Monitor Pro_0.0.0_x64-setup.exe`** - Installateur NSIS (2.0 MB)
- **`DHCP Monitor Pro_0.0.0_x64_en-US.msi`** - Package MSI pour déploiement (3.1 MB)

## 🚀 Installation

### Option 1 : Version Portable (Recommandée)
1. **Télécharger** tous les fichiers : `DHCPMonitor.exe`, `packet.dll`, `wpcap.dll`
2. **Placer** tous les fichiers dans le même dossier
3. **Exécuter** `DHCPMonitor.exe` en tant qu'administrateur
4. **Aucune installation** requise !

### Option 2 : Installateur NSIS
1. Télécharger `DHCP Monitor Pro_0.0.0_x64-setup.exe`
2. Exécuter en tant qu'administrateur
3. Suivre l'assistant d'installation
4. Lancer l'application depuis le menu Démarrer

### Option 3 : Package MSI
1. Télécharger `DHCP Monitor Pro_0.0.0_x64_en-US.msi`
2. Double-cliquer pour installer
3. Ou utiliser en ligne de commande : `msiexec /i "DHCP Monitor Pro_0.0.0_x64_en-US.msi"`

## ⚠️ Prerequisites

- **Windows 10/11** (64-bit)
- **Privilèges administrateur** requis pour la capture réseau
- **Npcap** inclus dans les DLLs (version portable) ou installateur

## 🔧 Utilisation

1. **Lancer l'application** avec privilèges administrateur
2. **Sélectionner l'interface réseau** dans la sidebar
3. **Démarrer la capture** avec le bouton vert
4. **Observer les logs** en temps réel
5. **Analyser l'Option 50** dans l'onglet dédié

## 📋 Structure des Fichiers

### Version Portable
```
DHCPMonitor/
├── DHCPMonitor.exe    # Application principale
├── packet.dll         # DLL Npcap
├── wpcap.dll          # DLL WinPcap
└── README.md          # Ce fichier
```

### Version Installée
- **Installateur NSIS** : Installation complète avec raccourcis
- **Package MSI** : Déploiement en entreprise

## 🐛 Support

- Consulter le [README principal](https://github.com/iyotee/DHCPMonitor#readme)
- Ouvrir une [issue](https://github.com/iyotee/DHCPMonitor/issues) en cas de problème

---

**DHCP Monitor - Option 50 Tracker**  
Surveillance DHCP moderne et performante 