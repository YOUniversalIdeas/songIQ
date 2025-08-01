# Contributing to songIQ

Thank you for your interest in contributing to songIQ! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/songiq.git
   cd songiq
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp songiq/server/env.example songiq/server/.env
   cp songiq/client/env.example songiq/client/.env
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper type annotations
- Avoid `any` type - use `unknown` if needed
- Use generic types where appropriate

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Use proper prop types and interfaces
- Follow React best practices and patterns
- Use proper error boundaries

### Backend

- Use async/await over promises
- Implement proper error handling
- Use middleware for common functionality
- Follow REST API conventions
- Implement proper validation

### General

- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Use consistent formatting

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies
- Maintain good test coverage

## Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code style guidelines
   - Write tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### Submitting the PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link any related issues
   - Request reviews from maintainers

3. **Address feedback**
   - Respond to review comments
   - Make requested changes
   - Update the PR as needed

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable
- **Console logs**: Any error messages

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use case**: Why this feature is needed
- **Proposed solution**: How you think it should work
- **Alternatives**: Any alternative solutions considered

## Development Guidelines

### Frontend Development

- **Components**: Create reusable, composable components
- **State Management**: Use React hooks for local state
- **Styling**: Use Tailwind CSS classes
- **Accessibility**: Follow WCAG guidelines
- **Performance**: Optimize for performance

### Backend Development

- **API Design**: Follow REST conventions
- **Validation**: Validate all inputs
- **Error Handling**: Provide meaningful error messages
- **Security**: Follow security best practices
- **Database**: Use proper indexing and queries

### Database Changes

- **Migrations**: Create proper database migrations
- **Indexing**: Add appropriate indexes
- **Validation**: Use Mongoose validation
- **Performance**: Optimize queries

## Code Review Process

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

### Review Guidelines

- Be constructive and respectful
- Focus on the code, not the person
- Suggest improvements, not just point out issues
- Explain the reasoning behind suggestions

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Steps

1. **Update version numbers**
2. **Update CHANGELOG.md**
3. **Create release notes**
4. **Tag the release**
5. **Deploy to staging**
6. **Deploy to production**

## Getting Help

- **Documentation**: Check the README and SETUP guides
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Chat**: Join our community chat

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing to songIQ, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to songIQ! 🎵 