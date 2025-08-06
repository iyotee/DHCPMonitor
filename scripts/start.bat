@echo off
REM Vérifier si on a les privilèges administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Cette application nécessite des privilèges administrateur pour capturer les paquets DHCP.
    echo Relancement en tant qu'administrateur...
    echo.
    echo ATTENTION: Windows va demander l'autorisation d'élévation.
    echo Cliquez sur "Oui" pour continuer.
    echo.
    pause
    echo Tentative d'élévation avec VBS...
    cscript //nologo "%~dp0\elevate.vbs" "%~dp0"
    exit /b
)

REM Forcer le changement vers le répertoire du script
cd /d "%~dp0"

echo DHCP Monitor - Option 50 Tracker
echo ================================
echo.

echo Arrêt des processus existants...
echo Recherche des processus sur le port 1420...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :1420') do (
    echo Arrêt du processus PID: %%a
    taskkill /f /pid %%a 2>nul
)

echo Arrêt des processus Node.js...
taskkill /f /im node.exe 2>nul

echo Arrêt des processus Vite...
taskkill /f /im vite.exe 2>nul

echo Processus arrêtés avec succès
echo.

echo Configuration des variables d'environnement pcap...
set LIB=C:\Program Files\npcap-sdk-1.15\Lib\x64;%LIB%
set INCLUDE=C:\Program Files\npcap-sdk-1.15\Include;%INCLUDE%
echo Variables pcap configurées.
echo.
echo Vérification de Npcap...
if exist "C:\Program Files\Npcap" (
    echo Npcap trouvé dans Program Files
) else (
    echo Npcap non trouvé
)

echo.
echo Vérification des dépendances...
echo.

echo Démarrage de l'application en mode développement...
echo.

echo NOTE: Application lancée avec privilèges administrateur
echo pour capturer les paquets DHCP.
echo.

echo Démarrage du serveur de développement...
echo Attente du démarrage du serveur...

start /B npm run dev

timeout /t 5 /nobreak >nul

echo Démarrage de l'application Tauri...

npx @tauri-apps/cli dev

pause