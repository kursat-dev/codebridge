import { ZodError } from 'zod';
import {
    CreateProjectInput,
    CreateProjectInputSchema,
    Project,
    ProjectResponse,
    ProjectStatus,
    toProjectResponse,
} from '../../domain/models/Project.js';
import { ConflictError, ValidationError, FieldError } from '../../domain/errors/DomainError.js';
import { IProjectRepository } from '../../ports/IProjectRepository.js';
import { IIdGenerator, IDateTimeService } from '../../ports/IServices.js';

/**
 * Dependencies for CreateProject use case
 */
export interface CreateProjectDeps {
    projectRepository: IProjectRepository;
    idGenerator: IIdGenerator;
    dateTimeService: IDateTimeService;
}

/**
 * CreateProject use case result
 */
export interface CreateProjectResult {
    project: ProjectResponse;
}

/**
 * Create a new project
 *
 * Business rules:
 * 1. Project name must be unique per owner
 * 2. New projects start with 'draft' status
 * 3. Input must pass validation schema
 */
export async function createProject(
    input: CreateProjectInput,
    ownerId: string,
    deps: CreateProjectDeps
): Promise<CreateProjectResult> {
    // Validate input
    try {
        CreateProjectInputSchema.parse(input);
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

    // Check project name uniqueness for this owner
    const nameExists = await deps.projectRepository.nameExistsForOwner(input.name, ownerId);
    if (nameExists) {
        throw new ConflictError('A project with this name already exists', 'name');
    }

    // Create project
    const now = deps.dateTimeService.now();
    const project: Project = {
        id: deps.idGenerator.generate(),
        name: input.name.trim(),
        description: input.description?.trim(),
        ownerId,
        status: ProjectStatus.DRAFT,
        createdAt: now,
        updatedAt: now,
    };

    const createdProject = await deps.projectRepository.create(project);

    return {
        project: toProjectResponse(createdProject),
    };
}
