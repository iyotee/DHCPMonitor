@echo off
REM Script de redirection vers scripts/build.bat
cd /d "%~dp0"
call scripts\build.bat %* 