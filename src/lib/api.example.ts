/**
 * API Usage Examples
 *
 * This file demonstrates how to use the API client with zod validation.
 * Delete this file when you start implementing your actual API calls.
 */

import { z } from 'zod';
import { createApiClient, defineEndpoint, ApiException } from './api';

// ============================================================================
// 1. Define your schemas
// ============================================================================

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

const UsersResponseSchema = z.array(UserSchema);

type User = z.infer<typeof UserSchema>;

// ============================================================================
// 2. Create API client instance
// ============================================================================

const apiClient = createApiClient({
  baseUrl: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'X-App-Version': '1.0.0',
  },
});

// ============================================================================
// 3. Direct usage with schema validation
// ============================================================================

export async function getUsers(): Promise<User[]> {
  return apiClient.get('/users', {
    schema: UsersResponseSchema,
  });
}

export async function getUser(id: number): Promise<User> {
  return apiClient.get(`/users/${id}`, {
    schema: UserSchema,
  });
}

export async function createUser(data: { name: string; email: string }): Promise<User> {
  return apiClient.post('/users', data, {
    schema: UserSchema,
  });
}

// ============================================================================
// 4. Using defineEndpoint for reusable endpoints
// ============================================================================

const getUserEndpoint = defineEndpoint<{ id: number }, void, User>({
  method: 'GET',
  path: (params) => `/users/${params.id}`,
  responseSchema: UserSchema,
});

const createUserEndpoint = defineEndpoint<void, { name: string; email: string }, User>({
  method: 'POST',
  path: '/users',
  responseSchema: UserSchema,
});

// Usage:
// const user = await getUserEndpoint(apiClient, { id: 1 });
// const newUser = await createUserEndpoint(apiClient, undefined, { name: 'John', email: 'john@example.com' });

// ============================================================================
// 5. Error handling example
// ============================================================================

export async function fetchWithErrorHandling(): Promise<User | null> {
  try {
    return await getUser(1);
  } catch (error) {
    if (error instanceof ApiException) {
      switch (error.status) {
        case 401:
          console.error('Unauthorized - redirect to login');
          break;
        case 404:
          console.error('User not found');
          break;
        case 408:
          console.error('Request timeout');
          break;
        default:
          console.error(`API Error: ${error.message}`, error.data);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

// ============================================================================
// 6. With authentication token
// ============================================================================

export function setAuthToken(token: string) {
  apiClient.setHeader('Authorization', `Bearer ${token}`);
}

export function clearAuthToken() {
  apiClient.removeHeader('Authorization');
}
