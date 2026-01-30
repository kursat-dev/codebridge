import { ProjectResponse, toProjectResponse } from '../../domain/models/Project.js';
import { IProjectRepository, PaginationInput } from '../../ports/IProjectRepository.js';

/**
 * Dependencies for ListProjects use case
 */
export interface ListProjectsDeps {
    projectRepository: IProjectRepository;
}

/**
 * ListProjects input
 */
export interface ListProjectsInput {
    limit?: number;
    offset?: number;
    cursor?: string;
}

/**
 * ListProjects use case result
 */
export interface ListProjectsResult {
    projects: ProjectResponse[];
    total: number;
    hasMore: boolean;
}

/**
 * List projects for a user
 */
export async function listProjects(
    ownerId: string,
    input: ListProjectsInput,
    deps: ListProjectsDeps
): Promise<ListProjectsResult> {
    const pagination: PaginationInput = {
        limit: Math.min(input.limit ?? 20, 100), // Cap at 100
        offset: input.offset,
        cursor: input.cursor,
    };

    const result = await deps.projectRepository.findByOwnerId(ownerId, pagination);

    return {
        projects: result.items.map(toProjectResponse),
        total: result.total,
        hasMore: result.hasMore,
    };
}
