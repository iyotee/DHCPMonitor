@echo off
REM Script de redirection vers scripts/install.bat
cd /d "%~dp0"
call scripts\install.bat %* 