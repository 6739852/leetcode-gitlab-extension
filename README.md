# LeetCode to GitLab Extension

תוסף כרום שמעלה אוטומטית פתרונות LeetCode ל-GitLab.

## התקנה

1. פתח את Chrome ועבור ל-`chrome://extensions/`
2. הפעל "Developer mode" בפינה הימנית העליונה
3. לחץ על "Load unpacked" ובחר את תיקיית התוסף
4. התוסף יופיע ברשימת התוספים

## הגדרה

1. לחץ על אייקון התוסף בסרגל הכלים
2. מלא את הפרטים הנדרשים:
   - **GitLab URL**: כתובת השרת (השאר ריק עבור gitlab.com)
   - **Personal Access Token**: יצור ב-GitLab Settings > Access Tokens
   - **Project ID**: מזהה הפרויקט ב-GitLab

### יצירת Personal Access Token

1. עבור ל-GitLab.com
2. לחץ על התמונה שלך > Settings
3. בתפריט השמאלי בחר "Access Tokens"
4. צור token חדש עם הרשאות:
   - `api` (גישה מלאה ל-API)
   - `write_repository` (כתיבה למאגר)

### מציאת Project ID

1. עבור לעמוד הפרויקט ב-GitLab
2. המספר מופיע מתחת לשם הפרויקט
3. או בכתובת: `gitlab.com/username/project-name/-/settings/general`

## שימוש

1. פתור בעיה ב-LeetCode
2. לחץ על "Submit"
3. כשהפתרון מתקבל, התוסף יעלה אותו אוטומטית ל-GitLab
4. תקבל התראה על הצלחת ההעלאה

## תכונות

- זיהוי אוטומטי של פתרונות מוצלחים
- העלאה אוטומטית ל-GitLab
- תמיכה בכל שפות התכנות של LeetCode
- הוספת מידע על הבעיה בתחילת הקובץ
- התראות על סטטוס ההעלאה

## פתרון בעיות

- ודא שה-Personal Access Token תקף ובעל הרשאות מתאימות
- בדוק שמזהה הפרויקט נכון
- ודא שיש לך הרשאות כתיבה לפרויקט
- בדוק את ה-Console של הדפדפן לשגיאות