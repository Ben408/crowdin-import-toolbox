# Contributing to Crowdin SRX Automation App

Thank you for your interest in contributing to the Crowdin SRX Automation App! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- Git
- Basic knowledge of TypeScript and NestJS
- Understanding of Crowdin Apps development

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/crowdin-srx-automation-app.git`
3. Install dependencies: `npm install`
4. Set up environment variables (copy `env.example` to `.env`)
5. Run the development server: `npm run start:dev`

## 📝 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Follow NestJS architectural patterns
- Write meaningful commit messages using conventional commits

### Testing
- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve test coverage
- Run tests with: `npm test`

### Git Workflow
1. Create a feature branch from `main`
2. Make your changes
3. Commit with conventional commit messages
4. Push to your fork
5. Create a Pull Request

## 🔧 Project Structure

```
src/
├── config/           # Configuration files
├── controller/       # HTTP controllers
├── decorator/        # Custom decorators
├── entity/           # Database entities
├── guard/            # Authentication guards
├── migration/        # Database migrations
├── model/            # Data models
├── service/          # Business logic services
└── main.ts          # Application entry point
```

## 📋 Pull Request Process

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Error handling is implemented

### PR Description
- Clear description of changes
- Link to related issues
- Screenshots for UI changes
- Testing instructions

### Review Process
- At least one maintainer must approve
- All CI checks must pass
- Address review comments promptly

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g. Windows 10]
- Node.js version: [e.g. 16.14.0]
- App version: [e.g. 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Problem Statement**
Clear description of the problem

**Proposed Solution**
Description of the proposed solution

**Alternative Solutions**
Any alternative solutions considered

**Additional Context**
Screenshots, mockups, or examples
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 📚 Resources

- [NestJS Documentation](https://nestjs.com/)
- [Crowdin Apps Documentation](https://support.crowdin.com/developer/crowdin-apps-about)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Questions?

- Open an issue for questions
- Join our discussions
- Check existing documentation

Thank you for contributing! 🎉
