import { UserResponse, toUserResponse } from '../../domain/models/User.js';
import { NotFoundError } from '../../domain/errors/DomainError.js';
import { IUserRepository } from '../../ports/IUserRepository.js';

/**
 * Dependencies for GetUser use case
 */
export interface GetUserDeps {
    userRepository: IUserRepository;
}

/**
 * GetUser use case result
 */
export interface GetUserResult {
    user: UserResponse;
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string, deps: GetUserDeps): Promise<GetUserResult> {
    const user = await deps.userRepository.findById(userId);

    if (!user) {
        throw new NotFoundError('User', userId);
    }

    return {
        user: toUserResponse(user),
    };
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string, deps: GetUserDeps): Promise<GetUserResult> {
    const user = await deps.userRepository.findByEmail(email.toLowerCase().trim());

    if (!user) {
        throw new NotFoundError('User', email);
    }

    return {
        user: toUserResponse(user),
    };
}
