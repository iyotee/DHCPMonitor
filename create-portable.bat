@echo off
REM Create portable package for DHCP Monitor Pro

echo Creating portable package...
echo.

REM Check if executable exists
if not exist "src-tauri\target\release\dhcp-monitor.exe" (
    echo ERROR: Executable does not exist.
    echo Please compile the application first with build.bat
    pause
    exit /b 1
)

REM Create portable directory
if exist "portable" rmdir /s /q "portable"
mkdir "portable"

REM Copy executable
copy "src-tauri\target\release\dhcp-monitor.exe" "portable\DHCP Monitor Pro.exe"

REM Copy DLLs
copy "%SystemRoot%\System32\wpcap.dll" "portable\" >nul
copy "%SystemRoot%\System32\packet.dll" "portable\" >nul

REM Create README
echo DHCP Monitor Pro - Portable Version > "portable\README.txt"
echo ================================== >> "portable\README.txt"
echo. >> "portable\README.txt"
echo This is a portable version of DHCP Monitor Pro. >> "portable\README.txt"
echo. >> "portable\README.txt"
echo Requirements: >> "portable\README.txt"
echo - Windows 10 or later >> "portable\README.txt"
echo - Npcap installed (https://npcap.com/) >> "portable\README.txt"
echo - Administrator privileges to capture packets >> "portable\README.txt"
echo. >> "portable\README.txt"
echo Usage: >> "portable\README.txt"
echo 1. Right-click "DHCP Monitor Pro.exe" >> "portable\README.txt"
echo 2. Select "Run as administrator" >> "portable\README.txt"
echo 3. Select your network interface >> "portable\README.txt"
echo 4. Start capturing DHCP packets >> "portable\README.txt"
echo. >> "portable\README.txt"
echo Note: This portable version includes the required Npcap DLLs. >> "portable\README.txt"

echo ✅ Portable package created in "portable" directory
echo.
echo Package includes:
echo - DHCP Monitor Pro.exe
echo - wpcap.dll
echo - packet.dll
echo - README.txt
echo.
echo To distribute: Copy the entire "portable" folder
echo.

pause 