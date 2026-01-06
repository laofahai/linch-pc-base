import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// ============================================================================
// API Client
// ============================================================================

export function createApiClient(config: ApiConfig) {
  const { baseUrl, timeout = 30000, headers: defaultHeaders = {} } = config;

  async function request<T>(
    method: string,
    endpoint: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      schema?: z.ZodType<T>;
      signal?: AbortSignal;
    } = {}
  ): Promise<T> {
    const { body, headers, schema, signal } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new ApiException(response.status, response.statusText, errorData);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      const data = JSON.parse(text);

      // Validate response with zod schema if provided
      if (schema) {
        const result = schema.safeParse(data);
        if (!result.success) {
          console.error('API response validation failed:', result.error);
          throw new ApiException(
            500,
            'Response validation failed',
            result.error.errors
          );
        }
        return result.data;
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiException(408, 'Request timeout');
      }

      throw new ApiException(
        0,
        error instanceof Error ? error.message : 'Network error'
      );
    }
  }

  return {
    get<T>(endpoint: string, options?: { headers?: Record<string, string>; schema?: z.ZodType<T>; signal?: AbortSignal }) {
      return request<T>('GET', endpoint, options);
    },

    post<T>(endpoint: string, body?: unknown, options?: { headers?: Record<string, string>; schema?: z.ZodType<T>; signal?: AbortSignal }) {
      return request<T>('POST', endpoint, { ...options, body });
    },

    put<T>(endpoint: string, body?: unknown, options?: { headers?: Record<string, string>; schema?: z.ZodType<T>; signal?: AbortSignal }) {
      return request<T>('PUT', endpoint, { ...options, body });
    },

    patch<T>(endpoint: string, body?: unknown, options?: { headers?: Record<string, string>; schema?: z.ZodType<T>; signal?: AbortSignal }) {
      return request<T>('PATCH', endpoint, { ...options, body });
    },

    delete<T>(endpoint: string, options?: { headers?: Record<string, string>; schema?: z.ZodType<T>; signal?: AbortSignal }) {
      return request<T>('DELETE', endpoint, options);
    },

    // Update base config
    setHeader(key: string, value: string) {
      defaultHeaders[key] = value;
    },

    removeHeader(key: string) {
      delete defaultHeaders[key];
    },
  };
}

// ============================================================================
// Default API instance (configure baseUrl before using)
// ============================================================================

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
});

// ============================================================================
// Helper: Type-safe API endpoint builder
// ============================================================================

export function defineEndpoint<
  TParams extends Record<string, string | number> | void,
  TBody,
  TResponse,
>(config: {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string | ((params: TParams) => string);
  responseSchema?: z.ZodType<TResponse>;
}) {
  return async (
    client: ReturnType<typeof createApiClient>,
    params: TParams,
    body?: TBody
  ): Promise<TResponse> => {
    const path = typeof config.path === 'function'
      ? config.path(params)
      : config.path;

    const options = { schema: config.responseSchema };

    switch (config.method) {
      case 'GET':
        return client.get<TResponse>(path, options);
      case 'POST':
        return client.post<TResponse>(path, body, options);
      case 'PUT':
        return client.put<TResponse>(path, body, options);
      case 'PATCH':
        return client.patch<TResponse>(path, body, options);
      case 'DELETE':
        return client.delete<TResponse>(path, options);
    }
  };
}
