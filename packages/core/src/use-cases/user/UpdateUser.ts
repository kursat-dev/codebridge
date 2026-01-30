import { ZodError } from 'zod';
import {
    UpdateUserInput,
    UpdateUserInputSchema,
    UserResponse,
    toUserResponse,
} from '../../domain/models/User.js';
import {
    ConflictError,
    NotFoundError,
    ValidationError,
    FieldError,
} from '../../domain/errors/DomainError.js';
import { IUserRepository } from '../../ports/IUserRepository.js';
import { IDateTimeService } from '../../ports/IServices.js';

/**
 * Dependencies for UpdateUser use case
 */
export interface UpdateUserDeps {
    userRepository: IUserRepository;
    dateTimeService: IDateTimeService;
}

/**
 * UpdateUser use case result
 */
export interface UpdateUserResult {
    user: UserResponse;
}

/**
 * Update an existing user
 *
 * Business rules:
 * 1. User must exist
 * 2. If email is changed, new email must be unique
 * 3. Input must pass validation schema
 */
export async function updateUser(
    userId: string,
    input: UpdateUserInput,
    deps: UpdateUserDeps
): Promise<UpdateUserResult> {
    // Validate input
    try {
        UpdateUserInputSchema.parse(input);
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

    // Check user exists
    const existingUser = await deps.userRepository.findById(userId);
    if (!existingUser) {
        throw new NotFoundError('User', userId);
    }

    // Check email uniqueness if email is being changed
    if (input.email && input.email !== existingUser.email) {
        const emailExists = await deps.userRepository.emailExists(input.email, userId);
        if (emailExists) {
            throw new ConflictError('A user with this email already exists', 'email');
        }
    }

    // Update user
    const updatedUser = await deps.userRepository.update(userId, {
        ...(input.name && { name: input.name.trim() }),
        ...(input.email && { email: input.email.toLowerCase().trim() }),
    });

    return {
        user: toUserResponse(updatedUser),
    };
}
