# GitHub Repository Setup

This guide will help you connect your local OneApp project to GitHub and push your code.

## Repository Information

- **GitHub URL**: https://github.com/binhvu284/oneapp
- **Repository**: `binhvu284/oneapp`

## Initial Setup

### 1. Initialize Git (if not already done)

```bash
git init
```

### 2. Add Remote Repository

```bash
git remote add origin https://github.com/binhvu284/oneapp.git
```

Verify the remote:
```bash
git remote -v
```

### 3. Create Initial Commit

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: OneApp project setup"
```

### 4. Push to GitHub

**First time push:**
```bash
# Set main branch as default
git branch -M main

# Push to GitHub
git push -u origin main
```

**Subsequent pushes:**
```bash
git add .
git commit -m "Your commit message"
git push
```

## Git Workflow

### Daily Development Workflow

1. **Check status:**
   ```bash
   git status
   ```

2. **Add changes:**
   ```bash
   git add .
   # Or add specific files: git add path/to/file
   ```

3. **Commit changes:**
   ```bash
   git commit -m "Description of your changes"
   ```

4. **Push to GitHub:**
   ```bash
   git push
   ```

### Branch Workflow (Recommended)

For feature development:

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes, then:
git add .
git commit -m "Add: your feature description"
git push -u origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Commit Message Guidelines

Use clear, descriptive commit messages:

- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for updates to existing features
- `Refactor:` for code refactoring
- `Docs:` for documentation changes
- `Style:` for formatting changes
- `Test:` for adding tests

Examples:
```bash
git commit -m "Add: AI assistant chat interface"
git commit -m "Fix: authentication token expiration issue"
git commit -m "Update: improve error handling in API routes"
git commit -m "Docs: update setup instructions"
```

## Important Files to Track

The following files are tracked:
- ✅ All source code (`frontend/`, `backend/`)
- ✅ Configuration files (`package.json`, `tsconfig.json`, etc.)
- ✅ Documentation (`README.md`, `SETUP.md`, etc.)
- ✅ Database schemas (`database/`)

## Files NOT Tracked (in .gitignore)

- ❌ `node_modules/` - Dependencies (install with `npm install`)
- ❌ `.env` files - Environment variables (use `.env.example`)
- ❌ `dist/` and `build/` - Build outputs
- ❌ `.DS_Store`, `Thumbs.db` - OS files
- ❌ Logs and temporary files

## Environment Variables

**Never commit `.env` files!**

Instead:
1. Use `.env.example` files as templates
2. Each developer creates their own `.env` file locally
3. For production, set environment variables in your hosting platform (Vercel, etc.)

## GitHub Actions

The project includes a CI workflow (`.github/workflows/ci.yml`) that:
- Runs on push and pull requests
- Installs dependencies
- Runs linting
- Performs type checking

## Pull Requests

When creating a Pull Request:

1. Use a descriptive title
2. Fill out the PR template
3. Reference related issues (e.g., "Fixes #123")
4. Request review before merging
5. Ensure CI passes

## Troubleshooting

### Remote Already Exists

If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/binhvu284/oneapp.git
```

### Authentication Issues

If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` permissions
3. Use token as password when pushing

**Option 2: Use SSH**
```bash
git remote set-url origin git@github.com:binhvu284/oneapp.git
```

### Large Files

If you accidentally commit large files:
```bash
# Remove from git history (be careful!)
git rm --cached large-file.txt
git commit -m "Remove large file"
git push
```

## Best Practices

1. **Commit Often**: Make small, frequent commits
2. **Write Good Messages**: Clear, descriptive commit messages
3. **Pull Before Push**: Always pull latest changes before pushing
4. **Use Branches**: Create branches for features/fixes
5. **Review Changes**: Review `git diff` before committing
6. **Keep .env Safe**: Never commit environment variables

## Quick Reference

```bash
# Check status
git status

# See changes
git diff

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull latest
git pull

# Create branch
git checkout -b feature/name

# Switch branch
git checkout main

# See commit history
git log --oneline
```

## Next Steps

1. ✅ Connect to GitHub (you're here!)
2. ✅ Push initial code
3. ✅ Set up branch protection (optional)
4. ✅ Configure GitHub Actions secrets (for CI/CD)
5. ✅ Set up deployment (Vercel, etc.)

Happy coding! 🚀

