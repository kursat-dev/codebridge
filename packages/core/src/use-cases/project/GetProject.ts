import { ProjectResponse, toProjectResponse } from '../../domain/models/Project.js';
import { NotFoundError, ForbiddenError } from '../../domain/errors/DomainError.js';
import { IProjectRepository } from '../../ports/IProjectRepository.js';

/**
 * Dependencies for GetProject use case
 */
export interface GetProjectDeps {
    projectRepository: IProjectRepository;
}

/**
 * GetProject use case result
 */
export interface GetProjectResult {
    project: ProjectResponse;
}

/**
 * Get a project by ID
 *
 * Business rules:
 * 1. Project must exist
 * 2. Requester must be the owner (basic authorization)
 */
export async function getProject(
    projectId: string,
    requesterId: string,
    deps: GetProjectDeps
): Promise<GetProjectResult> {
    const project = await deps.projectRepository.findById(projectId);

    if (!project) {
        throw new NotFoundError('Project', projectId);
    }

    // Basic authorization - only owner can view
    if (project.ownerId !== requesterId) {
        throw new ForbiddenError('You do not have access to this project');
    }

    return {
        project: toProjectResponse(project),
    };
}
