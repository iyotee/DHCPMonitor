@echo off
REM Script de redirection vers scripts/start.bat
cd /d "%~dp0"
call scripts\start.bat %* 