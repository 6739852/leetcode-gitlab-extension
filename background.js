// מאזין להודעות מ-content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'uploadToGitlab') {
    uploadToGitlab(request.data);
  }
});

async function uploadToGitlab(problemData) {
  try {
    // קבלת הגדרות מהאחסון
    const settings = await chrome.storage.sync.get(['gitlabToken', 'gitlabProjectId', 'gitlabUrl']);
    
    if (!settings.gitlabToken || !settings.gitlabProjectId) {
      console.error('חסרות הגדרות GitLab');
      showNotification('שגיאה', 'אנא הגדר את פרטי GitLab בהגדרות התוסף');
      return;
    }
    
    // יצירת שם קובץ
    const fileName = createFileName(problemData);
    const fileContent = createFileContent(problemData);
    
    // העלאה ל-GitLab
    const success = await uploadFile(settings, fileName, fileContent, problemData);
    
    if (success) {
      showNotification('הצלחה!', `הבעיה "${problemData.title}" הועלתה ל-GitLab`);
    } else {
      showNotification('שגיאה', 'נכשל בהעלאה ל-GitLab');
    }
    
  } catch (error) {
    console.error('שגיאה בהעלאה:', error);
    showNotification('שגיאה', 'שגיאה בהעלאה ל-GitLab');
  }
}

function createFileName(problemData) {
  // ניקוי שם הבעיה לשם קובץ תקין
  const cleanTitle = problemData.title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  
  // קביעת סיומת לפי שפה
  const extensions = {
    'python': '.py',
    'python3': '.py',
    'java': '.java',
    'javascript': '.js',
    'typescript': '.ts',
    'c++': '.cpp',
    'c': '.c',
    'c#': '.cs',
    'go': '.go',
    'rust': '.rs',
    'ruby': '.rb',
    'php': '.php',
    'swift': '.swift',
    'kotlin': '.kt',
    'scala': '.scala'
  };
  
  const extension = extensions[problemData.language.toLowerCase()] || '.txt';
  return `${cleanTitle}${extension}`;
}

function createFileContent(problemData) {
  const header = `/*
 * בעיה: ${problemData.title}
 * קישור: ${problemData.url}
 * שפה: ${problemData.language}
 * תאריך פתרון: ${new Date(problemData.timestamp).toLocaleDateString('he-IL')}
 */

`;
  
  return header + problemData.code;
}

async function uploadFile(settings, fileName, content, problemData) {
  try {
    const gitlabUrl = settings.gitlabUrl || 'https://gitlab.com';
    const apiUrl = `${gitlabUrl}/api/v4/projects/${settings.gitlabProjectId}/repository/files/${encodeURIComponent(fileName)}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': settings.gitlabToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        branch: 'main',
        content: content,
        commit_message: `Add LeetCode solution: ${problemData.title}`,
        encoding: 'text'
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('שגיאה ב-API של GitLab:', error);
    return false;
  }
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: title,
    message: message
  });
}