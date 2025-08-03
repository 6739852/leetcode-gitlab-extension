let uploadButton = null;
let hasShownButton = false;

// מעקב אחר לחיצה על כפתור Submit
document.addEventListener('click', function(event) {
  const target = event.target;
  
  // בדיקה אם לחצו על כפתור Submit
  if (target && (
    target.textContent.includes('Submit') || 
    target.getAttribute('data-e2e-locator') === 'console-submit-button' ||
    target.className.includes('submit') ||
    target.type === 'submit'
  )) {
    console.log('Submit button clicked!');
    hasShownButton = false;
    
    // המתנה לתוצאה
    setTimeout(() => {
      checkForAccepted();
    }, 3000);
  }
});

function checkForAccepted() {
  if (hasShownButton) return;
  
  const pageText = document.body.textContent || document.body.innerText || '';
  
  if (pageText.includes('Accepted') && !pageText.includes('Not Accepted')) {
    console.log('Accepted found! Showing button...');
    hasShownButton = true;
    showUploadButton();
  } else {
    // נסה שוב אחרי שנייה
    setTimeout(checkForAccepted, 1000);
  }
}

function showUploadButton() {
  // הסר כפתור קיים
  if (uploadButton) {
    uploadButton.remove();
  }
  
  uploadButton = document.createElement('button');
  uploadButton.innerHTML = '🎉 Upload Solution to GitHub';
  uploadButton.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 99999 !important;
    background: #28a745 !important;
    color: white !important;
    border: none !important;
    padding: 15px 20px !important;
    border-radius: 25px !important;
    cursor: pointer !important;
    font-size: 16px !important;
    font-weight: bold !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
  `;
  
  uploadButton.onclick = function() {
    uploadButton.innerHTML = '⏳ Uploading...';
    uploadButton.disabled = true;
    uploadSolution();
  };
  
  document.body.appendChild(uploadButton);
  
  // הסר אחרי 30 שניות
  setTimeout(() => {
    if (uploadButton) {
      uploadButton.remove();
      uploadButton = null;
    }
  }, 30000);
}

function uploadSolution() {
  console.log('Starting upload...');
  
  const problemData = extractAllData();
  console.log('Extracted data:', problemData);
  
  if (!problemData.code || problemData.code.length < 5) {
    showResult(false, 'No code found');
    return;
  }
  
  chrome.runtime.sendMessage({
    action: 'uploadToGithub',
    data: problemData
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError);
      showResult(false, 'Connection error');
    } else if (response && response.success) {
      showResult(true, 'Upload successful!');
    } else {
      showResult(false, 'Upload failed');
    }
  });
}

function extractAllData() {
  const title = extractTitle();
  const code = extractCode();
  const language = extractLanguage();
  
  console.log('Title:', title);
  console.log('Code length:', code.length);
  console.log('Language:', language);
  
  return {
    title: title,
    code: code,
    language: language,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
}

function extractTitle() {
  // מה-URL
  const pathParts = window.location.pathname.split('/');
  const problemSlug = pathParts[pathParts.indexOf('problems') + 1];
  let title = problemSlug ? problemSlug.replace(/-/g, ' ') : 'Unknown Problem';
  
  // מהעמוד
  const selectors = ['h1', '[data-cy="question-title"]', '.css-v3d350'];
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      title = element.textContent.trim();
      break;
    }
  }
  
  return title;
}

function extractCode() {
  console.log('Extracting code...');
  
  // שיטה 1: Monaco Editor
  const monacoEditor = document.querySelector('.monaco-editor');
  if (monacoEditor) {
    console.log('Found Monaco editor');
    
    // textarea
    const textarea = monacoEditor.querySelector('textarea');
    if (textarea && textarea.value) {
      console.log('Got code from textarea:', textarea.value.length, 'chars');
      return textarea.value;
    }
    
    // Monaco API
    try {
      if (window.monaco && window.monaco.editor) {
        const editors = window.monaco.editor.getEditors();
        if (editors && editors.length > 0) {
          const code = editors[0].getValue();
          if (code) {
            console.log('Got code from Monaco API:', code.length, 'chars');
            return code;
          }
        }
      }
    } catch (e) {
      console.log('Monaco API failed:', e);
    }
    
    // View lines
    const lines = Array.from(monacoEditor.querySelectorAll('.view-line'));
    if (lines.length > 0) {
      const codeText = lines.map(line => line.textContent || '').join('\n');
      if (codeText.trim()) {
        console.log('Got code from view lines:', codeText.length, 'chars');
        return codeText.trim();
      }
    }
  }
  
  // שיטה 2: כל textarea
  const textareas = document.querySelectorAll('textarea');
  for (const textarea of textareas) {
    const text = textarea.value || '';
    if (text.length > 10) {
      console.log('Got code from textarea:', text.length, 'chars');
      return text;
    }
  }
  
  console.log('No code found');
  return '';
}

function extractLanguage() {
  console.log('Extracting language...');
  
  // שיטה 1: מהממשק - יותר אפשרויות
  const langSelectors = [
    '.ant-select-selection-item',
    '[data-cy="lang-select"] .ant-select-selection-item',
    '.language-selector',
    '[class*="lang"] [class*="item"]',
    '[aria-label*="language"]'
  ];
  
  for (const selector of langSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const lang = element.textContent || element.innerText || '';
      if (lang && lang.trim() && lang.length < 20 && !lang.includes('Select')) {
        console.log('Language from UI selector:', selector, '=', lang.trim());
        return lang.trim();
      }
    }
  }
  
  // שיטה 2: חיפוש בכל העמוד אחר שמות שפות
  const pageText = document.body.textContent || '';
  const languages = ['Python3', 'Python', 'Java', 'C++', 'JavaScript', 'C#', 'Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'TypeScript'];
  
  for (const lang of languages) {
    if (pageText.includes(lang)) {
      console.log('Language from page text:', lang);
      return lang;
    }
  }
  
  // שיטה 3: זיהוי מהקוד עצמו
  const code = extractCode();
  if (code) {
    if (code.includes('#include') || code.includes('std::') || code.includes('cout')) {
      console.log('Language detected from code: C++');
      return 'C++';
    }
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
      console.log('Language detected from code: Python');
      return 'Python';
    }
    if (code.includes('public class') || code.includes('System.out')) {
      console.log('Language detected from code: Java');
      return 'Java';
    }
    if (code.includes('function ') || code.includes('console.log') || code.includes('const ')) {
      console.log('Language detected from code: JavaScript');
      return 'JavaScript';
    }
    if (code.includes('printf') || code.includes('scanf')) {
      console.log('Language detected from code: C');
      return 'C';
    }
  }
  
  console.log('Language detection failed, using unknown');
  return 'unknown';
}

function showResult(success, message) {
  if (!uploadButton) return;
  
  if (success) {
    uploadButton.innerHTML = '✅ Success!';
    uploadButton.style.background = '#28a745';
  } else {
    uploadButton.innerHTML = '❌ ' + message;
    uploadButton.style.background = '#dc3545';
  }
  
  setTimeout(() => {
    if (uploadButton) {
      uploadButton.remove();
      uploadButton = null;
    }
  }, 3000);
}

// איפוס כשעוברים לעמוד חדש
window.addEventListener('beforeunload', () => {
  hasShownButton = false;
  if (uploadButton) {
    uploadButton.remove();
    uploadButton = null;
  }
});