/**
 * Password hashing service interface
 */
export interface IPasswordService {
    /**
     * Hash a plain text password
     */
    hash(password: string): Promise<string>;

    /**
     * Verify a password against a hash
     */
    verify(password: string, hash: string): Promise<boolean>;
}

/**
 * ID generation service interface
 */
export interface IIdGenerator {
    /**
     * Generate a new unique ID (UUID v4)
     */
    generate(): string;
}

/**
 * Date/time service interface (for testability)
 */
export interface IDateTimeService {
    /**
     * Get current date/time
     */
    now(): Date;
}
