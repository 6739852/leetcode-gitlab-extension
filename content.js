// זיהוי הצלחת פתרון ב-LeetCode
let isSubmissionSuccessful = false;

// מאזין לשינויים בעמוד
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      checkForSuccessfulSubmission();
    }
  });
});

// התחלת המעקב
observer.observe(document.body, {
  childList: true,
  subtree: true
});

function checkForSuccessfulSubmission() {
  // חיפוש אחר הודעת הצלחה - מספר אפשרויות
  const successSelectors = [
    '[data-e2e-locator="submission-result"]',
    '.text-green-s',
    '.text-success',
    '[data-cy="submission-result"]'
  ];
  
  let successElement = null;
  for (const selector of successSelectors) {
    successElement = document.querySelector(selector);
    if (successElement) break;
  }
  
  // חיפוש טקסט "Accepted"
  const acceptedElements = document.querySelectorAll('*');
  let hasAccepted = false;
  for (const el of acceptedElements) {
    if (el.textContent && el.textContent.includes('Accepted')) {
      hasAccepted = true;
      break;
    }
  }
  
  if ((successElement || hasAccepted) && !isSubmissionSuccessful) {
    isSubmissionSuccessful = true;
    console.log('פתרון מוצלח זוהה!');
    
    // חילוץ פרטי הבעיה
    const problemData = extractProblemData();
    
    if (problemData) {
      // שליחה ל-background script
      chrome.runtime.sendMessage({
        action: 'uploadToGitlab',
        data: problemData
      });
    }
  }
}

function extractProblemData() {
  try {
    // חילוץ שם הבעיה - מספר אפשרויות
    const titleSelectors = [
      '[data-cy="question-title"]',
      'h1',
      '.css-v3d350',
      '[data-testid="question-title"]',
      '.question-title'
    ];
    
    let titleElement = null;
    for (const selector of titleSelectors) {
      titleElement = document.querySelector(selector);
      if (titleElement && titleElement.textContent.trim()) break;
    }
    
    // חילוץ הקוד - מספר אפשרויות
    const codeSelectors = [
      '.monaco-editor textarea',
      'textarea[data-mode-id]',
      '.CodeMirror-code',
      '.view-lines',
      '[data-testid="code-editor"] textarea'
    ];
    
    let codeElement = null;
    let code = '';
    
    for (const selector of codeSelectors) {
      codeElement = document.querySelector(selector);
      if (codeElement) {
        code = codeElement.value || codeElement.textContent;
        if (code && code.trim()) break;
      }
    }
    
    // אם לא מצאנו קוד, ננסה לחלץ מ-Monaco Editor
    if (!code) {
      const monacoLines = document.querySelectorAll('.view-line');
      if (monacoLines.length > 0) {
        code = Array.from(monacoLines).map(line => line.textContent).join('\n');
      }
    }
    
    // חילוץ שפת התכנות
    const languageSelectors = [
      '[data-cy="lang-select"]',
      '.ant-select-selection-item',
      '[data-testid="lang-select"]',
      '.language-selector'
    ];
    
    let languageElement = null;
    for (const selector of languageSelectors) {
      languageElement = document.querySelector(selector);
      if (languageElement && languageElement.textContent.trim()) break;
    }
    
    if (!titleElement || !codeElement) {
      console.error('לא ניתן לחלץ את פרטי הבעיה');
      return null;
    }
    
    const title = titleElement.textContent.trim();
    const code = codeElement.value || codeElement.textContent;
    const language = languageElement ? languageElement.textContent.trim() : 'unknown';
    const url = window.location.href;
    
    return {
      title,
      code,
      language,
      url,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('שגיאה בחילוץ נתוני הבעיה:', error);
    return null;
  }
}

// איפוס הסטטוס כשעוברים לבעיה חדשה
window.addEventListener('beforeunload', () => {
  isSubmissionSuccessful = false;
});