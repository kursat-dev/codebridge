/**
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

/**
 * Wrap data with offline flags
 */
export function wrapWithOfflineFlags<T>(data: T, operation: string): T & { _offline: OfflineFlags } {
  return {
    ...data,
    _offline: getOfflineFlags(operation),
  };
}

/**
 * Wrap data with no-cache flag
 */
export function noCache<T>(data: T): T & { _offline: { cacheable: false } } {
  return {
    ...data,
    _offline: {
      cacheable: false,
    },
  };
}
