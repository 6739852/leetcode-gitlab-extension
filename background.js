const FILE_EXTENSIONS = {
  'python': '.py', 'python3': '.py', 'py': '.py',
  'java': '.java',
  'javascript': '.js', 'js': '.js',
  'c++': '.cpp', 'cpp': '.cpp',
  'c': '.c',
  'c#': '.cs', 'csharp': '.cs',
  'go': '.go', 'golang': '.go',
  'rust': '.rs',
  'ruby': '.rb',
  'php': '.php',
  'swift': '.swift',
  'kotlin': '.kt',
  'scala': '.scala'
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'uploadToGithub') {
    handleUpload(request.data)
      .then(success => sendResponse({ success }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }
});

async function handleUpload(problemData) {
  try {
    const settings = await chrome.storage.sync.get(['githubToken', 'githubRepo', 'githubOwner']);
    
    if (!settings.githubToken || !settings.githubRepo || !settings.githubOwner) {
      showNotification('Error', 'Please configure GitHub settings');
      return false;
    }
    
    const fileName = createFileName(problemData);
    const fileContent = createFileContent(problemData);
    
    const success = await uploadToGithub(settings, fileName, fileContent, problemData);
    
    if (success) {
      showNotification('Success!', `"${problemData.title}" uploaded to GitHub`);
      return true;
    } else {
      showNotification('Failed', 'Could not upload to GitHub');
      return false;
    }
    
  } catch (error) {
    showNotification('Error', 'Upload failed');
    return false;
  }
}

function createFileName(problemData) {
  const cleanTitle = problemData.title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  
  const extension = FILE_EXTENSIONS[problemData.language.toLowerCase()] || '.txt';
  return cleanTitle + extension;
}

function createFileContent(problemData) {
  const date = new Date(problemData.timestamp);
  const dateStr = date.toLocaleDateString('en-US');
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const header = `/**
 * LeetCode Problem: ${problemData.title}
 * Language: ${problemData.language}
 * Date: ${dateStr} at ${timeStr}
 * URL: ${problemData.url}
 * 
 * Solution:
 */

`;
  
  return header + problemData.code;
}

async function uploadToGithub(settings, fileName, content, problemData) {
  try {
    const apiUrl = `https://api.github.com/repos/${settings.githubOwner}/${settings.githubRepo}/contents/${fileName}`;
    
    // בדיקה אם הקובץ קיים
    let sha = null;
    try {
      const checkResponse = await fetch(apiUrl, {
        headers: { 'Authorization': `token ${settings.githubToken}` }
      });
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        sha = data.sha;
      }
    } catch (e) {
      // הקובץ לא קיים
    }
    
    const body = {
      message: `Add LeetCode solution: ${problemData.title}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: 'main'
    };
    
    if (sha) {
      body.sha = sha;
      body.message = `Update LeetCode solution: ${problemData.title}`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${settings.githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    return response.ok;
    
  } catch (error) {
    return false;
  }
}

function showNotification(title, message) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      title: title,
      message: message
    });
  } catch (error) {
    // אם notifications לא עובד
  }
}