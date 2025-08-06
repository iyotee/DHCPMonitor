@echo off
REM DHCP Monitor - Option 50 Tracker
REM Build script for Windows

echo DHCP Monitor - Build Script
echo ===========================
echo

REM Force change to script directory
cd /d "%~dp0"

echo Checking dependencies...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Recommended installation: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    echo Recommended installation: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Rust is installed
cargo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Rust is not installed
    echo Recommended installation: https://rustup.rs/
    pause
    exit /b 1
)

echo All dependencies are installed
echo

echo Cleaning previous builds...
if exist "src-tauri\target" rmdir /s /q "src-tauri\target"
if exist "dist" rmdir /s /q "dist"
echo Cleaning completed
echo

echo Installing npm dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install npm dependencies
    pause
    exit /b 1
)
echo Npm dependencies installed
echo

echo Configuring environment variables...
set RUSTFLAGS=
echo Environment variables configured
echo

echo Checking Npcap...
if exist "C:\Program Files\Npcap" (
    echo Npcap found in Program Files
) else (
    echo WARNING: Npcap is not installed
    echo Recommended installation: https://npcap.com/
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

echo Building Tauri application...
echo This operation may take several minutes...

REM Copy DLLs before build
if exist "%SystemRoot%\System32\wpcap.dll" (
    if not exist "src-tauri\target\release" mkdir "src-tauri\target\release"
    copy "%SystemRoot%\System32\wpcap.dll" "src-tauri\target\release\" >nul
    copy "%SystemRoot%\System32\packet.dll" "src-tauri\target\release\" >nul
    echo ✅ Npcap DLLs copied before build
    
    REM Also copy to src-tauri for bundle resources
    copy "%SystemRoot%\System32\wpcap.dll" "src-tauri\" >nul
    copy "%SystemRoot%\System32\packet.dll" "src-tauri\" >nul
    echo ✅ Npcap DLLs copied to src-tauri for bundle
) else (
    echo ❌ Npcap DLLs not found in System32
    echo Please install Npcap from https://npcap.com/
    pause
    exit /b 1
)

REM Build the application
npx @tauri-apps/cli build

REM Copy DLLs to packages
if exist "src-tauri\target\release\bundle\msi" (
    copy "src-tauri\target\release\wpcap.dll" "src-tauri\target\release\bundle\msi\" >nul
    copy "src-tauri\target\release\packet.dll" "src-tauri\target\release\bundle\msi\" >nul
    echo ✅ DLLs copied to MSI package
)

REM Create custom NSIS installer with Npcap
if exist "src-tauri\target\release\bundle\nsis" (
    echo 🔄 Creating custom NSIS installer with Npcap...
    
    REM Copy files to NSIS directory
    copy "src-tauri\target\release\dhcp-monitor.exe" "src-tauri\target\release\bundle\nsis\" >nul
    copy "%SystemRoot%\System32\wpcap.dll" "src-tauri\target\release\bundle\nsis\" >nul
    copy "%SystemRoot%\System32\packet.dll" "src-tauri\target\release\bundle\nsis\" >nul
    
    REM Build custom installer
    cd "src-tauri\target\release\bundle\nsis"
    makensis "../../../../../src-tauri/installer.nsi"
    cd "../../../../../"
    
    echo ✅ Custom NSIS installer created with Npcap
)

if %errorlevel% equ 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo Application compiled in:
    echo   - src-tauri\target\release\dhcp-monitor.exe
    echo   - src-tauri\target\release\bundle\
    echo.
    echo Packages created:
    echo   - DHCP Monitor Pro_0.0.0_x64-setup.exe (installer)
    echo   - DHCP Monitor Pro_0.0.0_x64_en-US.msi (MSI package)
    echo.
    echo To install: run install.bat
) else (
    echo.
    echo ❌ Build failed
    echo.
    echo Check the errors above and try again.
    echo Make sure all dependencies are installed:
    echo   - Npcap
    echo   - Visual Studio Build Tools
    echo   - Windows SDK
)

pause 