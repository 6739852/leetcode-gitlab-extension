document.addEventListener('DOMContentLoaded', async () => {
  try {
    // טעינת הגדרות קיימות
    const settings = await chrome.storage.sync.get(['githubToken', 'githubRepo', 'githubOwner']);
    
    if (settings.githubOwner) {
      document.getElementById('githubOwner').value = settings.githubOwner;
    }
    if (settings.githubRepo) {
      document.getElementById('githubRepo').value = settings.githubRepo;
    }
    if (settings.githubToken) {
      document.getElementById('githubToken').value = settings.githubToken;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
});

function validateInputs() {
  const githubOwner = document.getElementById('githubOwner').value.trim();
  const githubRepo = document.getElementById('githubRepo').value.trim();
  const githubToken = document.getElementById('githubToken').value.trim();
  
  if (!githubOwner || !githubRepo || !githubToken) {
    showStatus('אנא מלא את כל השדות הנדרשים', 'error');
    return null;
  }
  
  return { githubOwner, githubRepo, githubToken };
}

// שמירת הגדרות
document.getElementById('saveBtn').addEventListener('click', async () => {
  const inputs = validateInputs();
  if (!inputs) return;
  
  try {
    await chrome.storage.sync.set(inputs);
    showStatus('הגדרות נשמרו בהצלחה!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('שגיאה בשמירת ההגדרות', 'error');
  }
});

// בדיקת חיבור
document.getElementById('testBtn').addEventListener('click', async () => {
  const inputs = validateInputs();
  if (!inputs) return;
  
  showStatus('בודק חיבור...', 'success');
  
  try {
    const apiUrl = `https://api.github.com/repos/${inputs.githubOwner}/${inputs.githubRepo}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${inputs.githubToken}`
      }
    });
    
    if (response.ok) {
      const repo = await response.json();
      showStatus(`חיבור מוצלח! Repository: ${repo.name}`, 'success');
    } else {
      const errorData = await response.json();
      showStatus(`שגיאה בחיבור: ${errorData.message || 'בדוק את הפרטים'}`, 'error');
    }
  } catch (error) {
    console.error('Connection test error:', error);
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