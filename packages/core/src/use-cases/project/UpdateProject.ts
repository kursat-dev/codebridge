import { ZodError } from 'zod';
import {
    UpdateProjectInput,
    UpdateProjectInputSchema,
    ProjectResponse,
    toProjectResponse,
} from '../../domain/models/Project.js';
import {
    ConflictError,
    NotFoundError,
    ForbiddenError,
    ValidationError,
    FieldError,
} from '../../domain/errors/DomainError.js';
import { IProjectRepository } from '../../ports/IProjectRepository.js';
import { IDateTimeService } from '../../ports/IServices.js';

/**
 * Dependencies for UpdateProject use case
 */
export interface UpdateProjectDeps {
    projectRepository: IProjectRepository;
    dateTimeService: IDateTimeService;
}

/**
 * UpdateProject use case result
 */
export interface UpdateProjectResult {
    project: ProjectResponse;
}

/**
 * Update an existing project
 *
 * Business rules:
 * 1. Project must exist
 * 2. Requester must be the owner
 * 3. If name is changed, new name must be unique for owner
 */
export async function updateProject(
    projectId: string,
    requesterId: string,
    input: UpdateProjectInput,
    deps: UpdateProjectDeps
): Promise<UpdateProjectResult> {
    // Validate input
    try {
        UpdateProjectInputSchema.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const fields: FieldError[] = error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            throw new ValidationError('Invalid input', fields);
        }
        throw error;
    }

    // Check project exists
    const existingProject = await deps.projectRepository.findById(projectId);
    if (!existingProject) {
        throw new NotFoundError('Project', projectId);
    }

    // Authorization
    if (existingProject.ownerId !== requesterId) {
        throw new ForbiddenError('You do not have access to this project');
    }

    // Check name uniqueness if name is being changed
    if (input.name && input.name !== existingProject.name) {
        const nameExists = await deps.projectRepository.nameExistsForOwner(
            input.name,
            requesterId,
            projectId
        );
        if (nameExists) {
            throw new ConflictError('A project with this name already exists', 'name');
        }
    }

    // Update project
    const updatedProject = await deps.projectRepository.update(projectId, {
        ...(input.name && { name: input.name.trim() }),
        ...(input.description !== undefined && { description: input.description?.trim() }),
        ...(input.status && { status: input.status }),
    });

    return {
        project: toProjectResponse(updatedProject),
    };
}
