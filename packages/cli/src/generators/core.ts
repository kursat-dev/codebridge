import fs from 'fs-extra';
import path from 'path';
import { CoreBridgeConfig } from '../config.js';

/**
 * Generate the core package structure
 */
export async function generateCore(config: CoreBridgeConfig, outputDir: string): Promise<void> {
    const coreDir = path.join(outputDir, 'core');

    // Create directory structure
    await fs.ensureDir(path.join(coreDir, 'src', 'domain', 'models'));
    await fs.ensureDir(path.join(coreDir, 'src', 'domain', 'errors'));
    await fs.ensureDir(path.join(coreDir, 'src', 'ports'));
    await fs.ensureDir(path.join(coreDir, 'src', 'use-cases'));

    // Generate package.json
    const packageJson = {
        name: '@corebridge/core',
        version: '0.1.0',
        description: 'Platform-agnostic business logic core',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            clean: 'rm -rf dist',
        },
        dependencies: {
            zod: '^3.22.4',
        },
        devDependencies: {
            typescript: '^5.3.0',
            '@types/node': '^20.10.0',
        },
        license: 'MIT',
    };

    await fs.writeJson(path.join(coreDir, 'package.json'), packageJson, { spaces: 2 });

    // Generate tsconfig.json
    const tsConfig = {
        compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            declaration: true,
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist'],
    };

    await fs.writeJson(path.join(coreDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

    // Generate domain model template for each domain
    for (const domain of config.domains) {
        const domainName = capitalize(domain);
        const modelContent = generateModelTemplate(domainName);
        await fs.writeFile(
            path.join(coreDir, 'src', 'domain', 'models', `${domainName}.ts`),
            modelContent
        );
    }

    // Generate index.ts
    const indexContent = `// Domain Models
${config.domains.map(d => `export * from './domain/models/${capitalize(d)}.js';`).join('\n')}

// Domain Errors
export * from './domain/errors/DomainError.js';

// Ports
export * from './ports/index.js';

// Use Cases
export * from './use-cases/index.js';
`;

    await fs.writeFile(path.join(coreDir, 'src', 'index.ts'), indexContent);

    // Generate error types
    await fs.writeFile(
        path.join(coreDir, 'src', 'domain', 'errors', 'DomainError.ts'),
        DOMAIN_ERROR_TEMPLATE
    );

    // Generate ports index
    await fs.writeFile(
        path.join(coreDir, 'src', 'ports', 'index.ts'),
        config.domains.map(d => `export * from './I${capitalize(d)}Repository.js';`).join('\n') + '\n'
    );

    // Generate repository interface for each domain
    for (const domain of config.domains) {
        const domainName = capitalize(domain);
        const repoContent = generateRepositoryTemplate(domainName);
        await fs.writeFile(
            path.join(coreDir, 'src', 'ports', `I${domainName}Repository.ts`),
            repoContent
        );
    }

    // Generate use-cases index
    await fs.ensureDir(path.join(coreDir, 'src', 'use-cases'));
    await fs.writeFile(
        path.join(coreDir, 'src', 'use-cases', 'index.ts'),
        config.domains.map(d => `export * from './${d}/index.js';`).join('\n') + '\n'
    );

    // Generate use case directories
    for (const domain of config.domains) {
        await fs.ensureDir(path.join(coreDir, 'src', 'use-cases', domain));
        await fs.writeFile(
            path.join(coreDir, 'src', 'use-cases', domain, 'index.ts'),
            `export * from './Create${capitalize(domain)}.js';\nexport * from './Get${capitalize(domain)}.js';\n`
        );
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateModelTemplate(name: string): string {
    return `import { z } from 'zod';

/**
 * ${name} validation schema
 */
export const ${name}Schema = z.object({
  id: z.string().uuid(),
  // Add your fields here
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ${name} = z.infer<typeof ${name}Schema>;

/**
 * Create${name} input schema
 */
export const Create${name}InputSchema = z.object({
  // Add your creation fields here
});

export type Create${name}Input = z.infer<typeof Create${name}InputSchema>;

/**
 * ${name} response (public-facing)
 */
export interface ${name}Response {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export function to${name}Response(entity: ${name}): ${name}Response {
  return {
    id: entity.id,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
`;
}

function generateRepositoryTemplate(name: string): string {
    return `import { ${name} } from '../domain/models/${name}.js';

/**
 * ${name} repository interface
 */
export interface I${name}Repository {
  findById(id: string): Promise<${name} | null>;
  create(data: Omit<${name}, 'id' | 'createdAt' | 'updatedAt'>): Promise<${name}>;
  update(id: string, data: Partial<${name}>): Promise<${name}>;
  delete(id: string): Promise<void>;
}
`;
}

const DOMAIN_ERROR_TEMPLATE = `/**
 * Base domain error
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): { code: string; message: string } {
    return { code: this.code, message: this.message };
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resourceType: string, id: string) {
    super(\`\${resourceType} with id '\${id}' not found\`);
  }
}

export class ConflictError extends DomainError {
  readonly code = 'RESOURCE_EXISTS';
  readonly statusCode = 409;
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;
}
`;
