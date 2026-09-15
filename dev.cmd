@echo off
set "PATH=%USERPROFILE%\dev-tools\node;%USERPROFILE%\dev-tools\mingit\cmd;%PATH%"
cd /d "%~dp0"
call npm run dev
