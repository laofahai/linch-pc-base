import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { createApiClient, ApiException } from './api';

describe('API Client', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const api = createApiClient({
    baseUrl: 'https://api.example.com',
    timeout: 5000,
  });

  describe('GET requests', () => {
    it('should make GET request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
      });

      await api.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should return parsed JSON response', async () => {
      const responseData = { id: 1, name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(responseData)),
      });

      const result = await api.get('/users/1');

      expect(result).toEqual(responseData);
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      const body = { name: 'New User' };
      await api.post('/users', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw ApiException on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'User not found' }),
      });

      await expect(api.get('/users/999')).rejects.toThrow(ApiException);
    });

    it('should include error details in ApiException', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ errors: ['Invalid email'] }),
      });

      try {
        await api.post('/users', {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(400);
        expect((error as ApiException).data).toEqual({ errors: ['Invalid email'] });
      }
    });
  });

  describe('Schema validation', () => {
    it('should validate response with zod schema', async () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1, name: 'Test' })),
      });

      const result = await api.get('/users/1', { schema: userSchema });

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should throw on schema validation failure', async () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 'invalid', name: 123 })),
      });

      await expect(api.get('/users/1', { schema: userSchema })).rejects.toThrow(
        ApiException
      );
    });
  });

  describe('Headers', () => {
    it('should allow setting custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{}'),
      });

      api.setHeader('Authorization', 'Bearer token123');
      await api.get('/protected');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
          }),
        })
      );
    });
  });
});
