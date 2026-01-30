// Generated TypeScript types from OpenAPI/JSON Schema

// ============ User Types ============

export interface CreateUserRequest {
  name: string;
}

export interface UserResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Project Types ============

export interface CreateProjectRequest {
  name: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Error Types ============

export type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'RESOURCE_EXISTS' | 'UNAUTHORIZED' | 'FORBIDDEN';

export interface ApiError {
  code: ErrorCode;
  message: string;
}
