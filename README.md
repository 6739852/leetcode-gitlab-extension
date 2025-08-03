# 🚀 LeetCode to GitHub Extension

A powerful Chrome extension that automatically uploads your LeetCode solutions to GitHub with proper syntax highlighting and organization.

## ✨ Features

- 🎯 **Smart Detection** - Automatically detects when you submit a successful solution
- 📁 **Proper File Extensions** - Creates files with correct extensions (.py, .cpp, .java, .js, etc.)
- 🎨 **Syntax Highlighting** - Your code looks beautiful on GitHub with proper language detection
- 📊 **GitHub Stats** - Contributes to your GitHub language statistics
- 🔄 **Auto-Update** - Updates existing files if you solve the same problem again
- 🌐 **Multi-Language Support** - Works with all LeetCode supported languages
- 📝 **Rich Headers** - Adds problem details, date, and URL to each file

## 🛠️ Installation

1. **Download the Extension**
   ```bash
   git clone https://github.com/6739852/leetcode-gitlab-extension.git
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the extension folder

3. **Configure GitHub Settings**
   - Click the extension icon in your browser
   - Enter your GitHub details:
     - **GitHub Username**: Your GitHub username
     - **Repository Name**: Repository where solutions will be stored
     - **Personal Access Token**: [Create one here](https://github.com/settings/tokens)

## 🔑 GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
4. Copy the token and paste it in the extension settings

## 🎮 How to Use

1. **Solve a Problem** on LeetCode
2. **Click Submit** - The extension detects your submission
3. **Get "Accepted"** - A green upload button appears
4. **Click Upload** - Your solution is automatically uploaded to GitHub!

## 📂 File Structure

Your solutions will be organized like this:

```
your-repo/
├── two-sum.py
├── reverse-integer.cpp
├── palindrome-number.java
└── longest-substring.js
```

Each file includes:
```python
/**
 * LeetCode Problem: Two Sum
 * Language: Python
 * Date: 8/3/2025 at 04:48 PM
 * URL: https://leetcode.com/problems/two-sum/
 * 
 * Solution:
 */

def twoSum(nums, target):
    # Your solution here
    pass
```

## 🌍 Supported Languages

| Language | Extension | Status |
|----------|-----------|--------|
| Python | `.py` | ✅ |
| C++ | `.cpp` | ✅ |
| Java | `.java` | ✅ |
| JavaScript | `.js` | ✅ |
| C | `.c` | ✅ |
| C# | `.cs` | ✅ |
| Go | `.go` | ✅ |
| Rust | `.rs` | ✅ |
| Ruby | `.rb` | ✅ |
| PHP | `.php` | ✅ |
| Swift | `.swift` | ✅ |
| Kotlin | `.kt` | ✅ |
| Scala | `.scala` | ✅ |
| TypeScript | `.ts` | ✅ |

## 🔧 Troubleshooting

### Extension not working?
- Make sure you're on a LeetCode problem page
- Check that your GitHub token has the right permissions
- Open Developer Tools (F12) and check the Console for errors

### Code not uploading?
- Verify your GitHub repository exists and is accessible
- Ensure your Personal Access Token hasn't expired
- Check your internet connection

### Wrong file extension?
- The extension auto-detects language from LeetCode's interface
- If detection fails, it falls back to analyzing your code
- Open Console (F12) to see language detection logs

## 🤝 Contributing

Found a bug or want to add a feature? Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⭐ Show Your Support

If this extension helped you organize your LeetCode solutions, please give it a star! ⭐

---

**Happy Coding!** 🎉 Keep solving problems and building your GitHub portfolio!