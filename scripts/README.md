# Scripts utilitaires

Ce dossier contient les scripts utilitaires pour le projet DHCP Monitor.

## Scripts disponibles

### `create-portable.bat`
Script Windows pour créer une version portable de l'application.
- Copie les DLLs nécessaires (wpcap.dll, packet.dll)
- Crée un package portable avec l'exécutable

### `elevate.vbs`
Script VBScript pour élever les privilèges administrateur.
- Utilisé pour les opérations nécessitant des droits administrateur
- Principalement pour la capture de paquets réseau

## Utilisation

Ces scripts sont appelés automatiquement par les scripts principaux à la racine du projet :
- `start.bat` - Démarrage de l'application
- `build.bat` - Construction de l'application
- `install.bat` - Installation des dépendances

## Processus de Release

### 🚀 **Release automatique via GitHub Actions**

Votre projet utilise déjà un workflow GitHub Actions configuré dans `.github/workflows/build.yml` qui :

1. **Se déclenche automatiquement** quand vous poussez un tag Git
2. **Construit l'application** pour toutes les plateformes (Windows, macOS, Linux)
3. **Crée les packages** (installateurs, versions portables, AppImage, DMG, etc.)
4. **Gère les artefacts** automatiquement

### 📋 **Comment faire une release**

```bash
# 1. Commiter tous les changements
git add .
git commit -m "Update to version 1.1.36"

# 2. Créer et pousser le tag
git tag v1.1.36
git push origin v1.1.36
```

### ✅ **Ce qui se passe automatiquement**

- GitHub Actions se déclenche sur le tag `v1.1.36`
- Build automatique pour Windows, macOS et Linux
- Création des packages d'installation
- Upload des artefacts dans GitHub Actions

### 📖 **Vérification**

- **Actions** : https://github.com/iyotee/DHCPMonitor/actions
- **Releases** : https://github.com/iyotee/DHCPMonitor/releases

## Note

Les scripts principaux (`start.bat`, `build.bat`, `install.bat`) sont conservés à la racine du projet pour faciliter l'accès et l'utilisation.

**Aucun script supplémentaire n'est nécessaire** - GitHub Actions gère tout automatiquement ! 🚀
