# Push Code to GitHub - Quick Guide

Your project is now connected to GitHub! Follow these steps to push your code.

## ✅ Already Done

- ✅ Git repository initialized
- ✅ Remote added: `https://github.com/binhvu284/oneapp.git`
- ✅ `.gitignore` configured
- ✅ GitHub workflows and templates created

## 🚀 Push Your Code

### Step 1: Stage All Files

```bash
git add .
```

### Step 2: Create Initial Commit

```bash
git commit -m "Initial commit: OneApp project setup with frontend, backend, and documentation"
```

### Step 3: Set Main Branch

```bash
git branch -M main
```

### Step 4: Push to GitHub

```bash
git push -u origin main
```

**Note:** You may be prompted for GitHub credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)
  - Go to: GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
  - Generate new token with `repo` scope
  - Use this token as your password

## 📝 Future Pushes

After the initial push, use these commands for future updates:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Add: your feature description"

# Push to GitHub
git push
```

## 🔐 Authentication Setup (One-Time)

### Option 1: Personal Access Token (Recommended)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "OneApp Development"
4. Select scopes: `repo` (full control)
5. Generate and copy the token
6. Use this token as your password when pushing

### Option 2: SSH (Alternative)

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to GitHub
# Copy public key: cat ~/.ssh/id_ed25519.pub
# Add to: GitHub Settings > SSH and GPG keys

# Change remote to SSH
git remote set-url origin git@github.com:binhvu284/oneapp.git
```

## 📋 Commit Message Guidelines

Use clear, descriptive messages:

- `Add:` - New features
- `Fix:` - Bug fixes  
- `Update:` - Updates to existing features
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes

Examples:
```bash
git commit -m "Add: AI assistant chat interface"
git commit -m "Fix: authentication token handling"
git commit -m "Update: improve error messages"
git commit -m "Docs: add GitHub setup guide"
```

## 🎯 What Gets Pushed

✅ **Will be pushed:**
- All source code (`frontend/`, `backend/`)
- Configuration files
- Documentation
- Database schemas
- GitHub workflows

❌ **Won't be pushed** (in `.gitignore`):
- `node_modules/` - Install with `npm install`
- `.env` files - Use `.env.example` as template
- Build outputs (`dist/`, `build/`)
- OS files (`.DS_Store`, `Thumbs.db`)

## 🔍 Verify Connection

Check your remote:
```bash
git remote -v
```

Should show:
```
origin  https://github.com/binhvu284/oneapp.git (fetch)
origin  https://github.com/binhvu284/oneapp.git (push)
```

## 🆘 Troubleshooting

### "Remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/binhvu284/oneapp.git
```

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH authentication

### "Permission denied"
- Make sure you have write access to the repository
- Check repository ownership/permissions on GitHub

### "Large file" warnings
- Large files should be in `.gitignore`
- If accidentally committed, remove with `git rm --cached filename`

## 📚 More Information

See `GITHUB_SETUP.md` for detailed GitHub workflow and best practices.

## ✨ Ready to Push!

Run these commands now:

```bash
git add .
git commit -m "Initial commit: OneApp project setup"
git branch -M main
git push -u origin main
```

Your code will be on GitHub! 🎉

