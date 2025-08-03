document.addEventListener('DOMContentLoaded', async () => {
  // טעינת הגדרות קיימות
  const settings = await chrome.storage.sync.get(['gitlabToken', 'gitlabProjectId', 'gitlabUrl']);
  
  if (settings.gitlabUrl) {
    document.getElementById('gitlabUrl').value = settings.gitlabUrl;
  }
  if (settings.gitlabToken) {
    document.getElementById('gitlabToken').value = settings.gitlabToken;
  }
  if (settings.gitlabProjectId) {
    document.getElementById('gitlabProjectId').value = settings.gitlabProjectId;
  }
});

// שמירת הגדרות
document.getElementById('saveBtn').addEventListener('click', async () => {
  const gitlabUrl = document.getElementById('gitlabUrl').value || 'https://gitlab.com';
  const gitlabToken = document.getElementById('gitlabToken').value;
  const gitlabProjectId = document.getElementById('gitlabProjectId').value;
  
  if (!gitlabToken || !gitlabProjectId) {
    showStatus('אנא מלא את כל השדות הנדרשים', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      gitlabUrl,
      gitlabToken,
      gitlabProjectId
    });
    
    showStatus('הגדרות נשמרו בהצלחה!', 'success');
  } catch (error) {
    showStatus('שגיאה בשמירת ההגדרות', 'error');
  }
});

// בדיקת חיבור
document.getElementById('testBtn').addEventListener('click', async () => {
  const gitlabUrl = document.getElementById('gitlabUrl').value || 'https://gitlab.com';
  const gitlabToken = document.getElementById('gitlabToken').value;
  const gitlabProjectId = document.getElementById('gitlabProjectId').value;
  
  if (!gitlabToken || !gitlabProjectId) {
    showStatus('אנא מלא את כל השדות הנדרשים', 'error');
    return;
  }
  
  showStatus('בודק חיבור...', 'success');
  
  try {
    const apiUrl = `${gitlabUrl}/api/v4/projects/${gitlabProjectId}`;
    const response = await fetch(apiUrl, {
      headers: {
        'PRIVATE-TOKEN': gitlabToken
      }
    });
    
    if (response.ok) {
      const project = await response.json();
      showStatus(`חיבור מוצלח! פרויקט: ${project.name}`, 'success');
    } else {
      showStatus('שגיאה בחיבור - בדוק את הפרטים', 'error');
    }
  } catch (error) {
    showStatus('שגיאה בחיבור לשרת', 'error');
  }
});

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  
  // הסתרת ההודעה אחרי 3 שניות
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = '';
  }, 3000);
}