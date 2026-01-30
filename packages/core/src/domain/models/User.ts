import { z } from 'zod';

/**
 * User validation schema
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  passwordHash: z.string(),
  name: z.string().min(1).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Branded UserId type for type safety
 */
export type UserId = string & { readonly __brand: 'UserId' };

/**
 * CreateUser input schema
 */
export const CreateUserInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

/**
 * UpdateUser input schema
 */
export const UpdateUserInputSchema = z.object({
  email: z.string().email().max(255).optional(),
  name: z.string().min(1).max(100).optional(),
}).refine(data => data.email || data.name, {
  message: 'At least one field must be provided',
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

/**
 * User response (public-facing, no password hash)
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform User entity to response
 */
export function toUserResponse(entity: User): UserResponse {
  return {
    id: entity.id,
    email: entity.email,
    name: entity.name,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
