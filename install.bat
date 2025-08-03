@echo off
chcp 65001 >nul
echo.
echo ================================
echo   LeetCode to GitLab Extension
echo ================================
echo.
echo התוסף מוכן להתקנה!
echo.
echo שלבי ההתקנה:
echo 1. פתח את Chrome
echo 2. עבור לכתובת: chrome://extensions/
echo 3. הפעל "Developer mode"
echo 4. לחץ "Load unpacked"
echo 5. בחר את התיקייה הזו: %~dp0
echo.
echo לאחר ההתקנה:
echo - לחץ על אייקון התוסף
echo - הגדר את פרטי GitLab שלך
echo - בדוק חיבור
echo - התחל לפתור בעיות ב-LeetCode!
echo.
echo האם תרצה לפתוח את Chrome Extensions? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    start chrome://extensions/
    echo Chrome נפתח בעמוד Extensions
) else (
    echo בהצלחה עם התוסף!
)
echo.
pause