@echo off
chcp 65001 >nul
title Artdict - Trinh khoi dong
cd /d "%~dp0"

echo ============================================
echo   ARTDICT - DANG KHOI DONG HE THONG...
echo ============================================
echo.
echo  1) Bat may chu backend (cua so moi)
echo  2) Bat may chu web      (cua so moi)
echo  3) Tu mo trinh duyet sau vai giay
echo.
echo  KHONG DONG 2 cua so do trong khi dang ban hang!
echo ============================================

REM --- May chu backend (API + admin). /D = thu muc khoi chay ---
start "Artdict BACKEND - dung dong" /D "%~dp0backend" cmd /k npm run dev

REM --- May chu web (trang khach + trang admin) ---
start "Artdict WEB - dung dong" /D "%~dp0" cmd /k python -m http.server 8000

REM --- Cho 5 giay cho 2 may chu san sang roi mo trinh duyet ---
timeout /t 5 /nobreak >nul

start "" http://localhost:8000/
start "" http://localhost:8000/admin/login.html

echo.
echo  Da mo trinh duyet. Cua so nay co the dong.
timeout /t 3 /nobreak >nul
