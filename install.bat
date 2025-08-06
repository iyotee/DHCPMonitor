@echo off
REM DHCP Monitor Pro - Installation Script
REM Copy executable to Program Files and create shortcuts

echo DHCP Monitor Pro - Installation
echo ===============================
echo

REM Check administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This installation requires administrator privileges.
    echo Restarting as administrator...
    echo.
    echo WARNING: Windows will ask for elevation permission.
    echo Click "Yes" to continue.
    echo.
    pause
    echo Attempting elevation with VBS...
    cscript //nologo elevate.vbs "%~dp0"
    exit /b
)

REM Force change to script directory
cd /d "%~dp0"

echo Checking executable...
if not exist "src-tauri\target\release\dhcp-monitor.exe" (
    echo ERROR: Executable does not exist.
    echo Please compile the application first with build.bat
    pause
    exit /b 1
)

echo Checking Npcap...
if not exist "%SystemRoot%\System32\wpcap.dll" (
    echo Npcap is not installed. Automatic installation...
    echo.
    echo Downloading Npcap...
    if not exist "temp" mkdir temp
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/nmap/npcap/releases/download/v1.80/npcap-1.80.exe' -OutFile 'temp\npcap-installer.exe'}"
    if %errorlevel% equ 0 (
        echo Installing Npcap...
        temp\npcap-installer.exe /S
        if exist "temp" rmdir /s /q "temp"
        echo ✅ Npcap installed successfully
    ) else (
        echo ⚠️ Failed to install Npcap automatically
        echo Please install Npcap manually from https://npcap.com/
        echo.
        set /p continue="Continue installation? (Y/N): "
        if /i not "%continue%"=="Y" (
            pause
            exit /b 1
        )
    )
) else (
    echo ✅ Npcap is already installed
)

echo Creating installation directory...
if not exist "C:\Program Files\DHCP Monitor Pro" (
    mkdir "C:\Program Files\DHCP Monitor Pro"
)

echo Copying executable...
copy "src-tauri\target\release\dhcp-monitor.exe" "C:\Program Files\DHCP Monitor Pro\DHCP Monitor Pro.exe"

if %errorlevel% neq 0 (
    echo ERROR: Failed to copy executable
    pause
    exit /b 1
)

echo Copying required Npcap DLLs...
REM Try to copy from package first, then from System32 as fallback
if exist "src-tauri\target\release\bundle\msi\wpcap.dll" (
    copy "src-tauri\target\release\bundle\msi\wpcap.dll" "C:\Program Files\DHCP Monitor Pro\" >nul
    copy "src-tauri\target\release\bundle\msi\packet.dll" "C:\Program Files\DHCP Monitor Pro\" >nul
    echo ✅ Npcap DLLs copied from package
) else if exist "src-tauri\target\release\bundle\nsis\wpcap.dll" (
    copy "src-tauri\target\release\bundle\nsis\wpcap.dll" "C:\Program Files\DHCP Monitor Pro\" >nul
    copy "src-tauri\target\release\bundle\nsis\packet.dll" "C:\Program Files\DHCP Monitor Pro\" >nul
    echo ✅ Npcap DLLs copied from package
) else (
    copy "%SystemRoot%\System32\wpcap.dll" "C:\Program Files\DHCP Monitor Pro\" 2>nul
    copy "%SystemRoot%\System32\packet.dll" "C:\Program Files\DHCP Monitor Pro\" 2>nul
    echo ✅ Npcap DLLs copied from System32
)

echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\DHCP Monitor Pro.lnk'); $Shortcut.TargetPath = 'C:\Program Files\DHCP Monitor Pro\DHCP Monitor Pro.exe'; $Shortcut.WorkingDirectory = 'C:\Program Files\DHCP Monitor Pro'; $Shortcut.Description = 'DHCP Monitor Pro - Option 50 Tracker'; $Shortcut.Save()"

if %errorlevel% neq 0 (
    echo WARNING: Failed to create desktop shortcut
    echo You can manually create a shortcut to:
    echo C:\Program Files\DHCP Monitor Pro\DHCP Monitor Pro.exe
)

echo Creating Start Menu shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\DHCP Monitor Pro.lnk'); $Shortcut.TargetPath = 'C:\Program Files\DHCP Monitor Pro\DHCP Monitor Pro.exe'; $Shortcut.WorkingDirectory = 'C:\Program Files\DHCP Monitor Pro'; $Shortcut.Description = 'DHCP Monitor Pro - Option 50 Tracker'; $Shortcut.Save()"

echo.
echo ✅ Installation completed successfully!
echo.
echo Application installed in:
echo   C:\Program Files\DHCP Monitor Pro\DHCP Monitor Pro.exe
echo.
echo Shortcuts created:
echo   - Desktop: DHCP Monitor Pro.lnk
echo   - Start Menu: DHCP Monitor Pro
echo.
echo To launch the application:
echo   1. Double-click the desktop shortcut
echo   2. Or search for "DHCP Monitor Pro" in Start Menu
echo.
echo NOTE: Application requires administrator privileges
echo to capture DHCP packets.
echo.

set /p launch="Do you want to launch the application now? (Y/N): "
if /i "%launch%"=="Y" (
    echo Launching DHCP Monitor Pro...
    start "" "C:\Program Files\DHCP Monitor Pro\DHCP Monitor Pro.exe"
)

pause 