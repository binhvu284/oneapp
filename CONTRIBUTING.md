# Contributing to OneApp

Thank you for your interest in contributing to OneApp! This document provides guidelines for contributing to the project.

## Development Setup

Please follow the setup instructions in `SETUP.md` to get your development environment ready.

## Code Style

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the existing component structure

### Backend
- Follow RESTful API conventions
- Use proper HTTP status codes
- Implement error handling
- Add input validation
- Document API endpoints

## Git Workflow

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
   - Write clean, commented code
   - Follow existing patterns
   - Test your changes

3. Commit your changes
   ```bash
   git commit -m "Add: description of your changes"
   ```
   Use clear commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

4. Push to your branch
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request
   - Provide a clear description
   - Reference any related issues
   - Wait for review

## Module Development

When creating a new module:

1. **Plan First**
   - Define the module's purpose
   - Identify dependencies
   - Design the data model
   - Plan API endpoints

2. **Follow Structure**
   - Use the module structure defined in `MODULES.md`
   - Create frontend components
   - Create backend routes
   - Add database migrations

3. **Integration**
   - Register module in database
   - Add navigation/routing
   - Integrate with AI assistant (if applicable)
   - Add to analytics

4. **Documentation**
   - Document API endpoints
   - Add code comments
   - Update module documentation
   - Create user guide (if needed)

## Testing

- Test your changes locally
- Verify frontend and backend work together
- Test error cases
- Check for TypeScript errors
- Verify database operations

## Documentation

- Update relevant documentation files
- Add comments to complex code
- Update README if needed
- Document new modules in `MODULES.md`

## Questions?

If you have questions or need help:
- Check existing documentation
- Review code examples in the codebase
- Ask for clarification

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

Thank you for contributing to OneApp! 🚀

