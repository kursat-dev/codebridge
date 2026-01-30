import { Project } from '../domain/models/Project.js';

/**
 * Pagination input
 */
export interface PaginationInput {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

/**
 * Project repository interface (port)
 */
export interface IProjectRepository {
  /**
   * Find project by ID
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Find projects by owner ID with pagination
   */
  findByOwnerId(ownerId: string, pagination: PaginationInput): Promise<PaginatedResult<Project>>;

  /**
   * Check if project name exists for owner (optionally excluding a project ID)
   */
  nameExistsForOwner(name: string, ownerId: string, excludeProjectId?: string): Promise<boolean>;

  /**
   * Create a new project
   */
  create(data: Project): Promise<Project>;

  /**
   * Update an existing project
   */
  update(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'ownerId'>>): Promise<Project>;

  /**
   * Delete a project
   */
  delete(id: string): Promise<void>;
}
