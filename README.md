# CoreBridge

> 🚀 Extract platform-agnostic business logic. Generate contracts. Scaffold adapters.

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-cli-commands">Commands</a> •
  <a href="#-package-overview">Packages</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🎯 What is CoreBridge?

**CoreBridge** is a CLI tool that helps you **reduce duplicated business logic** when expanding your application to multiple platforms (web, mobile, desktop).

When organizations expand from web to mobile, they often:

1. **Duplicate business logic** across platforms (validation, auth flows, domain rules)
2. **Drift API contracts** between platforms over time
3. **Couple platform concerns** with core business rules
4. **Lose consistency** in how operations behave across clients

CoreBridge addresses this by enforcing a clean separation between **what your application does** (core) and **how platforms consume it** (adapters).

---

## 📦 What You Get

| Package | Description |
|---------|-------------|
| **@corebridge/core** | Pure business logic with zero platform dependencies |
| **@corebridge/contracts** | OpenAPI 3.1 specs and JSON Schemas |
| **@corebridge/adapter-web** | Web adapter with session auth, CSRF, cursor pagination |
| **@corebridge/adapter-mobile** | Mobile adapter with token auth, offline support |
| **corebridge** | CLI tool for init, analyze, and generate |

---

## ⚠️ What CoreBridge Does NOT Do

> CoreBridge is honest about its limitations.

| ❌ Does Not | Explanation |
|------------|-------------|
| Generate UI | No screens, components, or views |
| Auto-convert to mobile | You still write platform clients |
| Handle platform APIs | Push notifications, file pickers are your job |
| Replace architecture decisions | You decide how adapters work |
| Support all languages | MVP is Node.js/TypeScript only |

---

## 🚀 Quick Start

### Installation

```bash
# Clone and setup
git clone https://github.com/kursat-dev/corebridge.git
cd corebridge
npm install
npm run build

# Run CLI
node packages/cli/dist/cli.js --help
```

### Usage

```bash
# Initialize in your project
corebridge init

# Analyze your codebase
corebridge analyze --verbose

# Generate packages
corebridge generate

> 📖 **Read the detailed [Usage Guide](docs/USAGE.md) for a complete walkthrough.**
```

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Platform Clients                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Web (SPA)  │  │ Mobile (RN)  │  │  Desktop (Electron)    │ │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘ │
└─────────┼────────────────┼──────────────────────┼──────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Platform Adapters                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Web Adapter │  │Mobile Adapter│  │   Desktop Adapter      │ │
│  │             │  │              │  │                        │ │
│  │ - Session   │  │ - Offline    │  │ - Local Storage        │ │
│  │ - Cookies   │  │ - Push       │  │ - Native Menus         │ │
│  │ - CORS      │  │ - Biometric  │  │ - File System          │ │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘ │
└─────────┼────────────────┼──────────────────────┼──────────────┘
          │                │                      │
          └────────────────┼──────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Core                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Use Cases                             │   │
│  │  createUser() | getProject() | validatePermissions()    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Domain Models                           │   │
│  │  User | Project | Permission | ValidationResult         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Repository Interfaces (Ports)               │   │
│  │  IUserRepository | IProjectRepository                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL   │  │     Redis      │  │  External APIs   │  │
│  │   Repository   │  │     Cache      │  │    (Payment)     │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow: Web vs Mobile

<details>
<summary><b>📱 Web Client Flow</b></summary>

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Web Client  │────▶│   Web Adapter   │────▶│  Application     │
│  (Browser)   │     │                 │     │  Core            │
└──────────────┘     └─────────────────┘     └──────────────────┘
       │                     │                       │
       │  POST /api/users    │                       │
       │  Cookie: session=x  │                       │
       │  {email, password}  │                       │
       │                     │                       │
       │                     │  1. Extract session   │
       │                     │  2. Validate CSRF     │
       │                     │  3. Transform request │
       │                     │                       │
       │                     │      CreateUserInput  │
       │                     │──────────────────────▶│
       │                     │                       │
       │                     │                       │  4. Validate input
       │                     │                       │  5. Check uniqueness
       │                     │                       │  6. Hash password
       │                     │                       │  7. Create user
       │                     │                       │
       │                     │      CreateUserResult │
       │                     │◀──────────────────────│
       │                     │                       │
       │  201 Created        │                       │
       │  Set-Cookie: ...    │                       │
       │  {user: {...}}      │                       │
       │◀────────────────────│                       │
```

</details>

<details>
<summary><b>📲 Mobile Client Flow</b></summary>

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│Mobile Client │────▶│  Mobile Adapter │────▶│  Application     │
│  (App)       │     │                 │     │  Core            │
└──────────────┘     └─────────────────┘     └──────────────────┘
       │                     │                       │
       │  POST /api/users    │                       │
       │  X-Device-ID: abc   │                       │
       │  X-App-Version: 2.1 │                       │
       │  Authorization: ... │                       │
       │  {email, password}  │                       │
       │                     │                       │
       │                     │  1. Validate token    │
       │                     │  2. Log device info   │
       │                     │  3. Transform request │
       │                     │                       │
       │                     │      CreateUserInput  │
       │                     │──────────────────────▶│
       │                     │                       │
       │                     │      (same as web)    │
       │                     │                       │
       │                     │      CreateUserResult │
       │                     │◀──────────────────────│
       │                     │                       │
       │  201 Created        │                       │
       │  {                  │                       │
       │    user: {...},     │                       │
       │    tokens: {        │                       │
       │      access: "...", │                       │
       │      refresh: "..." │                       │
       │    },               │                       │
       │    _offline: {      │                       │
       │      cacheable:true │                       │
       │    }                │                       │
       │  }                  │                       │
       │◀────────────────────│                       │
```

</details>

---

## 📂 Project Structure

```
corebridge/
├── packages/
│   ├── core/                     # Application Core (platform-agnostic)
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── models/       # User, Project with Zod validation
│   │   │   │   └── errors/       # DomainError, ValidationError, etc.
│   │   │   ├── use-cases/        # Business logic handlers
│   │   │   │   ├── user/         # CreateUser, GetUser, UpdateUser
│   │   │   │   └── project/      # CreateProject, GetProject, etc.
│   │   │   └── ports/            # Repository interfaces
│   │   └── package.json
│   │
│   ├── contracts/                # API Contracts
│   │   ├── openapi/              # OpenAPI 3.1 specifications
│   │   ├── schemas/              # JSON Schema files
│   │   └── src/                  # Generated TypeScript types
│   │
│   ├── cli/                      # CLI Tool
│   │   └── src/
│   │       ├── commands/         # init, analyze, generate
│   │       └── generators/       # Core, contracts, adapters generators
│   │
│   ├── adapter-web/              # Web Platform Adapter
│   │   └── src/
│   │       ├── middleware/       # Auth (session), CSRF, CORS, errorHandler
│   │       ├── controllers/      # UserController, ProjectController
│   │       ├── transformers/     # Request/Response transformation
│   │       └── extensions/       # Cursor-based pagination
│   │
│   └── adapter-mobile/           # Mobile Platform Adapter
│       └── src/
│           ├── middleware/       # Auth (token), version check, errorHandler
│           ├── controllers/      # UserController, ProjectController
│           ├── transformers/     # Request/Response with tokens
│           └── extensions/       # Offline flags, offset pagination
│
├── corebridge.config.json        # Tool configuration
├── package.json                  # Monorepo root with npm workspaces
└── tsconfig.json                 # Base TypeScript configuration
```

---

## 🔧 CLI Commands

### `corebridge init`

Initialize CoreBridge in your project:

```bash
corebridge init [--force]
```

Creates `corebridge.config.json` with default settings.

### `corebridge analyze`

Analyze your codebase to identify extractable business logic:

```bash
corebridge analyze [--config <path>] [--verbose]
```

Outputs:
- Services/Use Cases count
- Domain Models count
- Validators count
- Utilities count

### `corebridge generate`

Generate packages based on configuration:

```bash
corebridge generate [--config <path>] [--core-only] [--contracts-only] [--adapters-only]
```

---

## ⚙️ Configuration

Example `corebridge.config.json`:

```json
{
  "$schema": "https://corebridge.dev/schema/config.json",
  "sourceDir": "./src",
  "outputDir": "./packages",
  "domains": ["user", "project"],
  "adapters": ["web", "mobile"],
  "contracts": {
    "format": "openapi",
    "version": "3.1.0"
  },
  "analysis": {
    "include": ["**/*.ts"],
    "exclude": ["**/*.test.ts", "**/*.spec.ts", "**/node_modules/**", "**/dist/**"]
  }
}
```

---

## 📋 Core vs Adapter Responsibilities

### Application Core Handles

| Responsibility | Example |
|---------------|---------|
| Business validation | Email format, password strength |
| Domain rules | User can only update own profile |
| Authorization logic | Check permissions before action |
| Use case orchestration | Validate → Check → Execute → Return |

### Application Core Does NOT Handle

- HTTP status codes
- Session/cookie management
- Platform-specific error formats
- Push notifications
- File system operations

### Platform Adapters

| Feature | Web Adapter | Mobile Adapter |
|---------|-------------|----------------|
| Authentication | Session/Cookie | Bearer Token |
| CSRF Protection | ✅ Token validation | N/A |
| CORS | ✅ Configurable origins | N/A |
| Pagination | Cursor-based (infinite scroll) | Offset-based (with totals) |
| Offline Support | N/A | ✅ Caching hints |
| Device Tracking | N/A | ✅ X-Device-ID, X-App-Version |
| Version Check | N/A | ✅ Minimum version enforcement |

---

## 🚧 Limitations

> [!WARNING]
> CoreBridge is not magic. Read these carefully.

### Technical

- **TypeScript only** — Other languages require community contributions
- **Static analysis** — Cannot perfectly identify all business logic
- **No migrations** — Database schema changes are your responsibility

### Architectural

- **Not a framework** — Generates code, doesn't dictate runtime
- **No deployment** — You handle infrastructure
- **One-time generation** — Re-running overwrites (use git!)

### Requires Manual Work

| Task | Reason |
|------|--------|
| Repository implementations | Database-specific |
| Auth providers (OAuth, SAML) | Platform-specific |
| File uploads | Storage backends vary |
| Background jobs | Queue systems vary |
| Notifications | Push/Email/SMS differ |

---

## 🗺️ Roadmap

- [x] TypeScript/Node.js analysis
- [x] OpenAPI 3.1 contract generation
- [x] JSON Schema generation
- [x] Web adapter (session, CSRF, CORS)
- [x] Mobile adapter (token, offline, version)
- [ ] AST-based advanced analysis
- [ ] Python support
- [ ] GraphQL contracts
- [ ] Desktop adapter (Electron)
- [ ] Plugin system
- [ ] VS Code extension

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Development setup
git clone https://github.com/kursat-dev/corebridge.git
cd corebridge
npm install
npm run build
npm run lint
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
