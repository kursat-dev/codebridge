import { User } from '../domain/models/User.js';

/**
 * User repository interface (port)
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Check if email exists (optionally excluding a user ID)
   */
  emailExists(email: string, excludeUserId?: string): Promise<boolean>;

  /**
   * Create a new user
   */
  create(data: User): Promise<User>;

  /**
   * Update an existing user
   */
  update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;
}
