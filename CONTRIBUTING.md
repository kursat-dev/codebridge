# Contributing to CoreBridge

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/kursat-dev/corebridge.git
cd corebridge
npm install
npm run build
```

## Project Structure

- `packages/core` — Platform-agnostic business logic
- `packages/contracts` — OpenAPI specs and JSON Schemas
- `packages/cli` — Command-line tool
- `packages/adapter-web` — Web platform adapter
- `packages/adapter-mobile` — Mobile platform adapter

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit with clear messages
7. Push and create a Pull Request

## Code Style

- TypeScript strict mode
- ESLint + Prettier for formatting
- Meaningful variable names
- JSDoc comments for public APIs

## Pull Request Guidelines

- One feature per PR
- Include tests for new functionality
- Update documentation as needed
- Keep commits atomic and well-described

## Questions?

Open an issue for discussion before large changes.
