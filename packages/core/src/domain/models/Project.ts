import { z } from 'zod';

/**
 * Project status enum
 */
export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/**
 * Project validation schema
 */
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  ownerId: z.string().uuid(),
  status: z.nativeEnum(ProjectStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Branded ProjectId type for type safety
 */
export type ProjectId = string & { readonly __brand: 'ProjectId' };

/**
 * CreateProject input schema
 */
export const CreateProjectInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

/**
 * UpdateProject input schema
 */
export const UpdateProjectInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
}).refine(data => data.name || data.description !== undefined || data.status, {
  message: 'At least one field must be provided',
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;

/**
 * Project response (public-facing)
 */
export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform Project entity to response
 */
export function toProjectResponse(entity: Project): ProjectResponse {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    ownerId: entity.ownerId,
    status: entity.status,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
