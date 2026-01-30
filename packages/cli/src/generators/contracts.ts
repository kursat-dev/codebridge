import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import { CoreBridgeConfig } from '../config.js';

/**
 * Generate the contracts package with OpenAPI spec
 */
export async function generateContracts(
    config: CoreBridgeConfig,
    outputDir: string
): Promise<void> {
    const contractsDir = path.join(outputDir, 'contracts');

    // Create directory structure
    await fs.ensureDir(path.join(contractsDir, 'openapi'));
    await fs.ensureDir(path.join(contractsDir, 'schemas'));
    await fs.ensureDir(path.join(contractsDir, 'src'));

    // Generate package.json
    const packageJson = {
        name: '@corebridge/contracts',
        version: '0.1.0',
        description: 'OpenAPI specs and JSON Schemas',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        files: ['dist', 'openapi', 'schemas'],
        scripts: {
            build: 'tsc',
            clean: 'rm -rf dist',
        },
        license: 'MIT',
    };

    await fs.writeJson(path.join(contractsDir, 'package.json'), packageJson, { spaces: 2 });

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

    await fs.writeJson(path.join(contractsDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

    // Generate OpenAPI spec
    const openApiSpec = generateOpenApiSpec(config);
    await fs.writeFile(
        path.join(contractsDir, 'openapi', 'openapi.yaml'),
        YAML.stringify(openApiSpec)
    );

    // Generate JSON Schemas
    for (const domain of config.domains) {
        const schema = generateJsonSchema(capitalize(domain));
        await fs.writeJson(
            path.join(contractsDir, 'schemas', `${capitalize(domain)}.schema.json`),
            schema,
            { spaces: 2 }
        );
    }

    // Generate TypeScript types
    const typesContent = generateTypeScriptTypes(config);
    await fs.writeFile(path.join(contractsDir, 'src', 'index.ts'), typesContent);
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateOpenApiSpec(config: CoreBridgeConfig): object {
    const paths: Record<string, object> = {};
    const schemas: Record<string, object> = {};

    for (const domain of config.domains) {
        const name = capitalize(domain);
        const plural = domain + 's';

        // Add paths
        paths[`/${plural}`] = {
            get: {
                operationId: `list${name}s`,
                summary: `List ${plural}`,
                responses: {
                    '200': {
                        description: 'Success',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        items: { type: 'array', items: { $ref: `#/components/schemas/${name}Response` } },
                                        total: { type: 'integer' },
                                        hasMore: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                operationId: `create${name}`,
                summary: `Create ${domain}`,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/Create${name}Request` },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Created',
                        content: {
                            'application/json': {
                                schema: { $ref: `#/components/schemas/${name}Response` },
                            },
                        },
                    },
                },
            },
        };

        paths[`/${plural}/{${domain}Id}`] = {
            get: {
                operationId: `get${name}`,
                summary: `Get ${domain} by ID`,
                parameters: [
                    {
                        name: `${domain}Id`,
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Success',
                        content: {
                            'application/json': {
                                schema: { $ref: `#/components/schemas/${name}Response` },
                            },
                        },
                    },
                },
            },
        };

        // Add schemas
        schemas[`Create${name}Request`] = {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string' },
            },
        };

        schemas[`${name}Response`] = {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        };
    }

    return {
        openapi: config.contracts.version,
        info: {
            title: 'CoreBridge API',
            version: '1.0.0',
            description: 'Platform-agnostic API',
        },
        servers: [{ url: '/api/v1' }],
        paths,
        components: {
            schemas,
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    };
}

function generateJsonSchema(name: string): object {
    return {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: `https://corebridge.dev/schemas/${name}`,
        title: name,
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'createdAt', 'updatedAt'],
    };
}

function generateTypeScriptTypes(config: CoreBridgeConfig): string {
    let content = '// Generated TypeScript types from OpenAPI/JSON Schema\n\n';

    for (const domain of config.domains) {
        const name = capitalize(domain);

        content += `// ============ ${name} Types ============\n\n`;

        content += `export interface Create${name}Request {\n`;
        content += `  name: string;\n`;
        content += `}\n\n`;

        content += `export interface ${name}Response {\n`;
        content += `  id: string;\n`;
        content += `  name: string;\n`;
        content += `  createdAt: string;\n`;
        content += `  updatedAt: string;\n`;
        content += `}\n\n`;
    }

    content += `// ============ Error Types ============\n\n`;
    content += `export type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'RESOURCE_EXISTS' | 'UNAUTHORIZED' | 'FORBIDDEN';\n\n`;
    content += `export interface ApiError {\n`;
    content += `  code: ErrorCode;\n`;
    content += `  message: string;\n`;
    content += `}\n`;

    return content;
}
