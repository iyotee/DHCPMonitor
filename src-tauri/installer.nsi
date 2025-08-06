!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

; Application information
Name "DHCP Monitor Pro"
OutFile "DHCP Monitor Pro Setup.exe"
InstallDir "$PROGRAMFILES\DHCP Monitor Pro"
RequestExecutionLevel admin

; Interface settings
!define MUI_ABORTWARNING
!define MUI_ICON "icons\icon.ico"
!define MUI_UNICON "icons\icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Variables
Var NpcapInstalled

Section "Main Application" SecMain
    SetOutPath "$INSTDIR"
    
    ; Copy application files
    File "dhcp-monitor.exe"
    File "wpcap.dll"
    File "packet.dll"
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Create desktop shortcut
    CreateShortCut "$DESKTOP\DHCP Monitor Pro.lnk" "$INSTDIR\dhcp-monitor.exe"
    
    ; Create start menu shortcut
    CreateDirectory "$SMPROGRAMS\DHCP Monitor Pro"
    CreateShortCut "$SMPROGRAMS\DHCP Monitor Pro\DHCP Monitor Pro.lnk" "$INSTDIR\dhcp-monitor.exe"
    CreateShortCut "$SMPROGRAMS\DHCP Monitor Pro\Uninstall.lnk" "$INSTDIR\uninstall.exe"
    
    ; Registry entries
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro" "DisplayName" "DHCP Monitor Pro"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro" "DisplayIcon" "$INSTDIR\dhcp-monitor.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro" "Publisher" "DHCP Monitor Pro"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro" "DisplayVersion" "1.0.0"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro" "NoRepair" 1
SectionEnd

Section "Npcap Installation" SecNpcap
    ; Check if Npcap is already installed
    ${If} ${FileExists} "$SYSDIR\wpcap.dll"
        StrCpy $NpcapInstalled "1"
        DetailPrint "Npcap is already installed"
    ${Else}
        StrCpy $NpcapInstalled "0"
        DetailPrint "Npcap not found, will install"
        
        ; Download Npcap installer
        DetailPrint "Downloading Npcap..."
        inetc::get "https://github.com/nmap/npcap/releases/download/v1.80/npcap-1.80.exe" "$TEMP\npcap-installer.exe" /END
        Pop $0
        ${If} $0 == "OK"
            DetailPrint "Npcap downloaded successfully"
            
            ; Install Npcap silently
            DetailPrint "Installing Npcap..."
            ExecWait '"$TEMP\npcap-installer.exe" /S' $0
            ${If} $0 == "0"
                DetailPrint "Npcap installed successfully"
                StrCpy $NpcapInstalled "1"
            ${Else}
                DetailPrint "Failed to install Npcap"
                StrCpy $NpcapInstalled "0"
            ${EndIf}
            
            ; Clean up
            Delete "$TEMP\npcap-installer.exe"
        ${Else}
            DetailPrint "Failed to download Npcap"
            StrCpy $NpcapInstalled "0"
        ${EndIf}
    ${EndIf}
SectionEnd

Section "Uninstall"
    ; Remove application files
    Delete "$INSTDIR\dhcp-monitor.exe"
    Delete "$INSTDIR\wpcap.dll"
    Delete "$INSTDIR\packet.dll"
    Delete "$INSTDIR\uninstall.exe"
    
    ; Remove shortcuts
    Delete "$DESKTOP\DHCP Monitor Pro.lnk"
    Delete "$SMPROGRAMS\DHCP Monitor Pro\DHCP Monitor Pro.lnk"
    Delete "$SMPROGRAMS\DHCP Monitor Pro\Uninstall.lnk"
    RMDir "$SMPROGRAMS\DHCP Monitor Pro"
    
    ; Remove installation directory
    RMDir "$INSTDIR"
    
    ; Remove registry entries
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DHCP Monitor Pro"
SectionEnd

Function .onInstSuccess
    ${If} $NpcapInstalled == "0"
        MessageBox MB_OK|MB_ICONEXCLAMATION "Npcap installation failed. Please install Npcap manually from https://npcap.com/ to use DHCP Monitor Pro."
    ${EndIf}
FunctionEnd 