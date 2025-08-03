let isSubmissionSuccessful = false;
let uploadButton = null;

// מעקב אחר שינויים בעמוד
const observer = new MutationObserver(() => {
  setTimeout(checkForSuccess, 1000);
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

function checkForSuccess() {
  if (!window.location.href.includes('leetcode.com/problems/')) return;
  
  const pageText = document.body.textContent || '';
  const hasAccepted = pageText.includes('Accepted') && !pageText.includes('Not Accepted');
  
  if (hasAccepted && !isSubmissionSuccessful) {
    isSubmissionSuccessful = true;
    showButton();
  }
}

function showButton() {
  if (uploadButton) uploadButton.remove();
  
  uploadButton = document.createElement('button');
  uploadButton.innerHTML = '🎉 Upload to GitHub';
  uploadButton.style.position = 'fixed';
  uploadButton.style.bottom = '20px';
  uploadButton.style.right = '20px';
  uploadButton.style.zIndex = '9999';
  uploadButton.style.background = '#28a745';
  uploadButton.style.color = 'white';
  uploadButton.style.border = 'none';
  uploadButton.style.padding = '15px 20px';
  uploadButton.style.borderRadius = '25px';
  uploadButton.style.cursor = 'pointer';
  uploadButton.style.fontSize = '16px';
  uploadButton.style.fontWeight = 'bold';
  
  uploadButton.onclick = () => {
    uploadButton.innerHTML = '⏳ Uploading...';
    uploadButton.disabled = true;
    uploadCode();
  };
  
  document.body.appendChild(uploadButton);
  
  setTimeout(() => {
    if (uploadButton) {
      uploadButton.remove();
      uploadButton = null;
    }
  }, 30000);
}

function uploadCode() {
  const data = getProblemData();
  
  if (data && data.code && data.code.length > 5) {
    chrome.runtime.sendMessage({
      action: 'uploadToGithub',
      data: data
    }, (response) => {
      if (response && response.success) {
        showResult(true);
      } else {
        showResult(false);
      }
    });
  } else {
    showResult(false);
  }
}

function showResult(success) {
  if (!uploadButton) return;
  
  if (success) {
    uploadButton.innerHTML = '✅ Success!';
    uploadButton.style.background = '#28a745';
  } else {
    uploadButton.innerHTML = '❌ Failed';
    uploadButton.style.background = '#dc3545';
  }
  
  setTimeout(() => {
    if (uploadButton) {
      uploadButton.remove();
      uploadButton = null;
    }
  }, 3000);
}

function getProblemData() {
  const title = getTitle();
  const code = getCode();
  const language = getLanguage(code);
  
  return {
    title: title,
    code: code,
    language: language,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
}

function getTitle() {
  const titleElement = document.querySelector('h1') || 
                      document.querySelector('[data-cy="question-title"]');
  
  if (titleElement && titleElement.textContent) {
    return titleElement.textContent.trim();
  }
  
  const urlParts = window.location.pathname.split('/');
  const slug = urlParts[urlParts.indexOf('problems') + 1];
  return slug ? slug.replace(/-/g, ' ') : 'Unknown Problem';
}

function getCode() {
  console.log('Starting code extraction...');
  
  // שיטה 1: Monaco Editor
  const monacoEditor = document.querySelector('.monaco-editor');
  if (monacoEditor) {
    console.log('Found Monaco editor');
    
    // נסה textarea
    const textarea = monacoEditor.querySelector('textarea');
    if (textarea && textarea.value) {
      console.log('Code from textarea:', textarea.value.length, 'chars');
      return textarea.value;
    }
    
    // נסה Monaco API
    if (window.monaco && window.monaco.editor) {
      const editors = window.monaco.editor.getEditors();
      if (editors && editors.length > 0) {
        const code = editors[0].getValue();
        if (code) {
          console.log('Code from Monaco API:', code.length, 'chars');
          return code;
        }
      }
    }
    
    // נסה view lines
    const lines = monacoEditor.querySelectorAll('.view-line');
    if (lines.length > 0) {
      const codeLines = [];
      lines.forEach(line => {
        const text = line.textContent || '';
        codeLines.push(text);
      });
      const code = codeLines.join('\n').trim();
      if (code && code.length > 10) {
        console.log('Code from view lines:', code.length, 'chars');
        return code;
      }
    }
  }
  
  // שיטה 2: כל textarea בעמוד
  const textareas = document.querySelectorAll('textarea');
  for (const textarea of textareas) {
    const text = textarea.value || '';
    if (text && text.length > 10 && hasCodeKeywords(text)) {
      console.log('Code from textarea:', text.length, 'chars');
      return text;
    }
  }
  
  // שיטה 3: אלמנטי קוד
  const codeElements = document.querySelectorAll('pre, code, [class*="code"]');
  for (const element of codeElements) {
    const text = element.textContent || '';
    if (text && text.length > 20 && hasCodeKeywords(text)) {
      console.log('Code from element:', text.length, 'chars');
      return text;
    }
  }
  
  console.log('No code found');
  return '';
}

function hasCodeKeywords(text) {
  const keywords = [
    'function', 'return', 'if (', 'for (', 'while (', 'class ',
    'def ', 'import ', '#include', 'public ', 'private ',
    'int ', 'string', 'void', 'const ', 'let ', 'var '
  ];
  
  return keywords.some(keyword => text.includes(keyword));
}

function getLanguage(code) {
  // חיפוש בממשק
  const langElement = document.querySelector('.ant-select-selection-item');
  if (langElement && langElement.textContent) {
    const lang = langElement.textContent.trim();
    if (lang && lang.length < 20) {
      console.log('Language from UI:', lang);
      return lang;
    }
  }
  
  // זיהוי מהקוד
  if (code) {
    if (code.includes('#include') || code.includes('std::')) return 'C++';
    if (code.includes('def ') || code.includes('import ')) return 'Python';
    if (code.includes('public class') || code.includes('System.out')) return 'Java';
    if (code.includes('function ') || code.includes('console.log')) return 'JavaScript';
    if (code.includes('printf') || code.includes('scanf')) return 'C';
  }
  
  return 'unknown';
}

// איפוס כשעוברים לעמוד חדש
window.addEventListener('beforeunload', () => {
  isSubmissionSuccessful = false;
  if (uploadButton) {
    uploadButton.remove();
    uploadButton = null;
  }
});