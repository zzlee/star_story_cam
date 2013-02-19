@echo off

rem added by GZ
rem settings for star_server
set STAR_SERVER_PROJECT=D:\nodejs_projects\star_server

rem settings for star_ae_server
set STAR_AE_SERVER_ID=gance_Feltmeng_pc
set STAR_AE_SERVER_PROJECT=D:\nodejs_projects\star_ae_server
set AE_BIN=C:\Program Files\Adobe\Adobe After Effects CS6\Support Files
set FFMPEG_BIN=C:\ffmpeg\bin

rem settings for star_dooh
set STAR_DOOH_ID=DOOH_gance_Feltmeng_pc
set SATR_DOOH_PROJECT=D:\nodejs_projects\star_dooh
set DOOH_PLAYER=C:\Program Files\Windows Media Player\wmplayer.exe

rem settings for star_story_cam
set STAR_STORY_CAM_CONTROLLER_ID=story_cam_gance_Feltmeng_pc
set STAR_STORY_CAM_CONTROLLER_PROJECT=D:\nodejs_projects\star_story_cam
set MENCODER_BIN=C:\mplayer-svn-35738

rem settings for star_dooh & star_ae_server
set HOST_STAR_SERVER=http://192.168.5.112
set STAR_FTP_ID=miixcard
set STAR_FTP_PSW=53768608


rem Not used for now

set HOME=C:\Users\Gance
set HOST_STAR_AE_SERVER=http://192.168.5.101

rem Ensure this Node.js and NPM are first in the PATH
::set PATH=%APPDATA%\npm;%~dp0;%PATH%
set PATH=%APPDATA%\npm;%~dp0;%PATH%;%AE_BIN%;%FFMPEG_BIN%;%MENCODER_BIN%

rem Figure out node version and architecture and print it.
setlocal
pushd "%~dp0"
set print_version=.\node.exe -p -e "process.versions.node + ' (' + process.arch + ')'"
for /F "usebackq delims=" %%v in (`%print_version%`) do set version=%%v
echo Your environment has been set up for using Node.js %version% and NPM
popd
endlocal

rem If we're in the node.js directory, change to the user's home dir.
::if "%CD%\"=="%~dp0" cd /d "%HOMEDRIVE%%HOMEPATH%"
if "%CD%\"=="%~dp0" d: && cd /d "%STAR_SERVER_PROJECT%"
::if "%CD%\"=="%~dp0" d: && cd /d "%DOOH_PROJECT%"
