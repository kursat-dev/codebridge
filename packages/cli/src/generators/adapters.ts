import fs from 'fs-extra';
import path from 'path';
import { CoreBridgeConfig } from '../config.js';

/**
 * Generate platform adapter packages
 */
export async function generateAdapters(
    config: CoreBridgeConfig,
    outputDir: string,
    adapterType: string
): Promise<void> {
    const adapterDir = path.join(outputDir, `adapter-${adapterType}`);

    // Create directory structure
    await fs.ensureDir(path.join(adapterDir, 'src', 'middleware'));
    await fs.ensureDir(path.join(adapterDir, 'src', 'controllers'));
    await fs.ensureDir(path.join(adapterDir, 'src', 'transformers'));
    await fs.ensureDir(path.join(adapterDir, 'src', 'extensions'));

    // Generate package.json
    const packageJson = {
        name: `@corebridge/adapter-${adapterType}`,
        version: '0.1.0',
        description: `${capitalize(adapterType)} platform adapter for CoreBridge`,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            clean: 'rm -rf dist',
        },
        dependencies: {
            '@corebridge/core': '^0.1.0',
            '@corebridge/contracts': '^0.1.0',
            express: '^4.18.2',
        },
        devDependencies: {
            typescript: '^5.3.0',
            '@types/node': '^20.10.0',
            '@types/express': '^4.17.21',
        },
        license: 'MIT',
    };

    await fs.writeJson(path.join(adapterDir, 'package.json'), packageJson, { spaces: 2 });

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

    await fs.writeJson(path.join(adapterDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

    // Generate middleware
    await fs.writeFile(
        path.join(adapterDir, 'src', 'middleware', 'auth.ts'),
        generateAuthMiddleware(adapterType)
    );

    await fs.writeFile(
        path.join(adapterDir, 'src', 'middleware', 'errorHandler.ts'),
        ERROR_HANDLER_TEMPLATE
    );

    // Generate transformers
    await fs.writeFile(
        path.join(adapterDir, 'src', 'transformers', 'request.ts'),
        REQUEST_TRANSFORMER_TEMPLATE
    );

    await fs.writeFile(
        path.join(adapterDir, 'src', 'transformers', 'response.ts'),
        generateResponseTransformer(adapterType)
    );

    // Generate extensions
    await fs.writeFile(
        path.join(adapterDir, 'src', 'extensions', 'pagination.ts'),
        generatePaginationExtension(adapterType)
    );

    if (adapterType === 'mobile') {
        await fs.writeFile(
            path.join(adapterDir, 'src', 'extensions', 'offline.ts'),
            OFFLINE_EXTENSION_TEMPLATE
        );
    }

    // Generate controllers for each domain
    for (const domain of config.domains) {
        const controllerContent = generateController(domain, adapterType);
        await fs.writeFile(
            path.join(adapterDir, 'src', 'controllers', `${capitalize(domain)}Controller.ts`),
            controllerContent
        );
    }

    // Generate index.ts
    const indexContent = generateAdapterIndex(config, adapterType);
    await fs.writeFile(path.join(adapterDir, 'src', 'index.ts'), indexContent);
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateAuthMiddleware(adapterType: string): string {
    if (adapterType === 'web') {
        return `import { Request, Response, NextFunction } from 'express';

/**
 * Web authentication middleware (session-based)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Web uses session-based auth
  const sessionId = req.cookies?.session;

  if (!sessionId) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }

  // Validate session and attach user to request
  // req.user = await validateSession(sessionId);

  next();
}
`;
    }

    return `import { Request, Response, NextFunction } from 'express';

/**
 * Mobile authentication middleware (token-based)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Mobile uses Bearer token auth
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);

  // Validate token and attach user to request
  // req.user = await validateToken(token);

  // Log device info for analytics
  const deviceId = req.headers['x-device-id'];
  const appVersion = req.headers['x-app-version'];

  next();
}
`;
}

const ERROR_HANDLER_TEMPLATE = `import { Request, Response, NextFunction } from 'express';
import { DomainError } from '@corebridge/core';

/**
 * Central error handler
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof DomainError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Unknown error
  console.error('Unhandled error:', error);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
`;

const REQUEST_TRANSFORMER_TEMPLATE = `import { Request } from 'express';

/**
 * Transform HTTP request to core input
 */
export function transformRequest<T>(req: Request): T {
  return {
    ...req.body,
    ...req.query,
    ...req.params,
  } as T;
}

/**
 * Extract user ID from authenticated request
 */
export function getUserId(req: Request): string {
  // Assumes auth middleware has attached user
  return (req as any).user?.id ?? '';
}
`;

function generateResponseTransformer(adapterType: string): string {
    if (adapterType === 'mobile') {
        return `import { Response } from 'express';

/**
 * Transform core output to HTTP response with mobile-specific additions
 */
export function sendResponse<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    ...data,
    _offline: {
      cacheable: true,
      ttl: 300,
    },
  });
}

/**
 * Send created response with tokens
 */
export function sendCreatedWithTokens<T>(
  res: Response,
  data: T,
  tokens: { access: string; refresh: string }
): void {
  res.status(201).json({
    ...data,
    tokens,
    _offline: {
      cacheable: false,
    },
  });
}
`;
    }

    return `import { Response } from 'express';

/**
 * Transform core output to HTTP response
 */
export function sendResponse<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(data);
}

/**
 * Send created response
 */
export function sendCreated<T>(res: Response, data: T): void {
  res.status(201).json(data);
}
`;
}

function generatePaginationExtension(adapterType: string): string {
    if (adapterType === 'web') {
        return `/**
 * Web pagination - cursor-based for infinite scroll
 */
export interface WebPaginationParams {
  cursor?: string;
  limit: number;
}

export interface WebPaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export function parseWebPagination(query: any): WebPaginationParams {
  return {
    cursor: query.cursor as string | undefined,
    limit: Math.min(parseInt(query.limit) || 20, 100),
  };
}

export function wrapWebPagination<T>(
  items: T[],
  hasMore: boolean,
  getCursor: (item: T) => string
): WebPaginatedResponse<T> {
  return {
    data: items,
    pagination: {
      hasMore,
      nextCursor: hasMore && items.length > 0 ? getCursor(items[items.length - 1]) : null,
    },
  };
}
`;
    }

    return `/**
 * Mobile pagination - offset-based with total count
 */
export interface MobilePaginationParams {
  offset: number;
  limit: number;
}

export interface MobilePaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

export function parseMobilePagination(query: any): MobilePaginationParams {
  return {
    offset: parseInt(query.offset) || 0,
    limit: Math.min(parseInt(query.limit) || 20, 100),
  };
}

export function wrapMobilePagination<T>(
  items: T[],
  total: number,
  offset: number,
  limit: number
): MobilePaginatedResponse<T> {
  return {
    data: items,
    pagination: {
      total,
      offset,
      limit,
      hasMore: offset + items.length < total,
    },
  };
}
`;
}

const OFFLINE_EXTENSION_TEMPLATE = `/**
 * Offline support for mobile adapter
 */
export interface OfflineFlags {
  cacheable: boolean;
  ttl: number;
  version: number;
}

const OFFLINE_SAFE_OPERATIONS = new Set([
  'getUser',
  'getProject',
  'listProjects',
]);

const QUEUEABLE_OPERATIONS = new Set([
  'createProject',
  'updateProject',
]);

export function getOfflineFlags(operation: string): OfflineFlags {
  return {
    cacheable: OFFLINE_SAFE_OPERATIONS.has(operation),
    ttl: getTTL(operation),
    version: Date.now(),
  };
}

export function canQueueOffline(operation: string): boolean {
  return QUEUEABLE_OPERATIONS.has(operation);
}

function getTTL(operation: string): number {
  const ttlMap: Record<string, number> = {
    getUser: 3600,
    listProjects: 300,
    getProject: 600,
  };
  return ttlMap[operation] ?? 600;
}
`;

function generateController(domain: string, adapterType: string): string {
    const name = capitalize(domain);

    return `import { Router, Request, Response, NextFunction } from 'express';
import { create${name}, get${name}, list${name}s } from '@corebridge/core';
import { transformRequest, getUserId } from '../transformers/request.js';
import { sendResponse, sendCreated } from '../transformers/response.js';

const router = Router();

/**
 * GET /${domain}s
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = transformRequest(req);

    // Call core use case
    // const result = await list${name}s(userId, input, deps);

    sendResponse(res, { message: 'List ${domain}s - implement me' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /${domain}s
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = transformRequest(req);

    // Call core use case
    // const result = await create${name}(input, userId, deps);

    sendCreated(res, { message: 'Create ${domain} - implement me' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /${domain}s/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Call core use case
    // const result = await get${name}(id, userId, deps);

    sendResponse(res, { message: 'Get ${domain} - implement me' });
  } catch (error) {
    next(error);
  }
});

export const ${domain}Router = router;
`;
}

function generateAdapterIndex(config: CoreBridgeConfig, adapterType: string): string {
    let content = `import { Router } from 'express';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
`;

    for (const domain of config.domains) {
        content += `import { ${domain}Router } from './controllers/${capitalize(domain)}Controller.js';\n`;
    }

    content += `
// Export middleware
export { authMiddleware } from './middleware/auth.js';
export { errorHandler } from './middleware/errorHandler.js';

// Export extensions
export * from './extensions/pagination.js';
`;

    if (adapterType === 'mobile') {
        content += `export * from './extensions/offline.js';\n`;
    }

    content += `
/**
 * Create ${adapterType} adapter router
 */
export function create${capitalize(adapterType)}Router(): Router {
  const router = Router();

  // Apply auth middleware
  router.use(authMiddleware);

  // Mount domain routers
`;

    for (const domain of config.domains) {
        content += `  router.use('/${domain}s', ${domain}Router);\n`;
    }

    content += `
  // Error handler
  router.use(errorHandler);

  return router;
}
`;

    return content;
}
