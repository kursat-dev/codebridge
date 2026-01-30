import { ZodError } from 'zod';
import {
    CreateUserInput,
    CreateUserInputSchema,
    User,
    UserResponse,
    toUserResponse,
} from '../../domain/models/User.js';
import { ConflictError, ValidationError, FieldError } from '../../domain/errors/DomainError.js';
import { IUserRepository } from '../../ports/IUserRepository.js';
import { IPasswordService, IIdGenerator, IDateTimeService } from '../../ports/IServices.js';

/**
 * Dependencies for CreateUser use case
 */
export interface CreateUserDeps {
    userRepository: IUserRepository;
    passwordService: IPasswordService;
    idGenerator: IIdGenerator;
    dateTimeService: IDateTimeService;
}

/**
 * CreateUser use case result
 */
export interface CreateUserResult {
    user: UserResponse;
}

/**
 * Create a new user
 *
 * Business rules:
 * 1. Email must be unique
 * 2. Password must be hashed before storage
 * 3. Input must pass validation schema
 */
export async function createUser(
    input: CreateUserInput,
    deps: CreateUserDeps
): Promise<CreateUserResult> {
    // Validate input
    try {
        CreateUserInputSchema.parse(input);
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

    // Check email uniqueness
    const emailExists = await deps.userRepository.emailExists(input.email);
    if (emailExists) {
        throw new ConflictError('A user with this email already exists', 'email');
    }

    // Hash password
    const passwordHash = await deps.passwordService.hash(input.password);

    // Create user
    const now = deps.dateTimeService.now();
    const user: User = {
        id: deps.idGenerator.generate(),
        email: input.email.toLowerCase().trim(),
        name: input.name.trim(),
        passwordHash,
        createdAt: now,
        updatedAt: now,
    };

    const createdUser = await deps.userRepository.create(user);

    return {
        user: toUserResponse(createdUser),
    };
}
