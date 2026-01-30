# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-30

### Added

- Initial release of CoreBridge CLI
- `corebridge init` command for project initialization
- `corebridge analyze` command for pattern-based codebase analysis
- `corebridge generate` command for package generation
- `@corebridge/core` package with:
  - Domain models (User, Project) with Zod validation
  - Domain errors (DomainError, ValidationError, NotFoundError, etc.)
  - Repository interfaces (IUserRepository, IProjectRepository)
  - Use cases (CreateUser, GetUser, UpdateUser, CreateProject, etc.)
- `@corebridge/contracts` package with:
  - OpenAPI 3.1 specification
  - JSON Schema files
  - TypeScript type definitions
- `@corebridge/adapter-web` package with:
  - Session-based authentication middleware
  - CSRF protection
  - CORS handling
  - Cursor-based pagination extension
- `@corebridge/adapter-mobile` package with:
  - Token-based authentication middleware
  - App version check middleware
  - Offline support extension with caching hints
  - Offset-based pagination extension
- Full TypeScript support with strict mode
- Monorepo structure with npm workspaces
- ESLint + Prettier configuration
