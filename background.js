// סיומות קבצים לכל שפה
const EXTENSIONS = {
  'python': '.py',
  'python3': '.py',
  'java': '.java',
  'javascript': '.js',
  'c++': '.cpp',
  'c': '.c',
  'c#': '.cs',
  'go': '.go',
  'rust': '.rs',
  'ruby': '.rb',
  'php': '.php',
  'swift': '.swift',
  'kotlin': '.kt',
  'scala': '.scala',
  'typescript': '.ts',
  'unknown': '.txt'
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'uploadToGithub') {
    console.log('Background: Received upload request');
    uploadToGithub(request.data)
      .then(result => {
        console.log('Background: Upload result:', result);
        sendResponse({ success: result });
      })
      .catch(error => {
        console.error('Background: Upload error:', error);
        sendResponse({ success: false });
      });
    return true; // חשוב לשמירת החיבור
  }
});

async function uploadToGithub(problemData) {
  try {
    console.log('Getting settings...');
    const settings = await chrome.storage.sync.get(['githubToken', 'githubRepo', 'githubOwner']);
    
    if (!settings.githubToken || !settings.githubRepo || !settings.githubOwner) {
      console.error('Missing GitHub settings');
      showNotification('Error', 'Please configure GitHub settings in extension popup');
      return false;
    }
    
    console.log('Settings OK, creating file...');
    const fileName = createFileName(problemData);
    const fileContent = createFileContent(problemData);
    
    console.log('Uploading file:', fileName);
    const success = await uploadFile(settings, fileName, fileContent, problemData);
    
    if (success) {
      showNotification('Success! 🎉', `"${problemData.title}" uploaded to GitHub`);
      return true;
    } else {
      showNotification('Upload Failed', 'Could not upload to GitHub');
      return false;
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    showNotification('Error', 'Upload failed: ' + error.message);
    return false;
  }
}

function createFileName(problemData) {
  // ניקוי שם הבעיה
  const cleanTitle = problemData.title
    .replace(/[^\w\s-]/g, '') // הסרת תווים מיוחדים
    .replace(/\s+/g, '-') // החלפת רווחים במקפים
    .toLowerCase();
  
  // קביעת סיומת לפי שפה
  const language = problemData.language.toLowerCase();
  const extension = EXTENSIONS[language] || '.txt';
  
  console.log('File name:', cleanTitle + extension, 'Language:', language);
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

async function uploadFile(settings, fileName, content, problemData) {
  try {
    const apiUrl = `https://api.github.com/repos/${settings.githubOwner}/${settings.githubRepo}/contents/${fileName}`;
    
    console.log('API URL:', apiUrl);
    
    // בדיקה אם הקובץ קיים (לעדכון)
    let sha = null;
    try {
      const checkResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${settings.githubToken}`,
          'User-Agent': 'LeetCode-Extension'
        }
      });
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
        console.log('File exists, will update. SHA:', sha);
      }
    } catch (e) {
      console.log('File does not exist, will create new');
    }
    
    // יצירת הבקשה
    const requestBody = {
      message: sha ? `Update LeetCode solution: ${problemData.title}` : `Add LeetCode solution: ${problemData.title}`,
      content: btoa(unescape(encodeURIComponent(content))), // קידוד Base64
      branch: 'main'
    };
    
    if (sha) {
      requestBody.sha = sha; // נדרש לעדכון קובץ קיים
    }
    
    console.log('Sending request to GitHub...');
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${settings.githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LeetCode-Extension'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('GitHub response status:', response.status);
    
    if (response.ok) {
      console.log('Upload successful!');
      return true;
    } else {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      return false;
    }
    
  } catch (error) {
    console.error('Upload error:', error);
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
    console.log('Notification failed:', error);
  }
}