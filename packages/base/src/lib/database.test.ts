import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock functions need to be defined before vi.mock
const mockExecute = vi.fn();
const mockSelect = vi.fn();
const mockClose = vi.fn();
const mockLoad = vi.fn();

// Mock the Tauri SQL plugin
vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: (...args: unknown[]) => mockLoad(...args),
  },
}));

// Mock logger to avoid console noise
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Database', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mock database instance
    mockLoad.mockResolvedValue({
      execute: mockExecute,
      select: mockSelect,
      close: mockClose,
    });

    // Default: no migrations applied
    mockSelect.mockResolvedValue([]);

    // Reset module state by re-importing
    vi.resetModules();
  });

  describe('initDatabase', () => {
    it('should initialize database with default name', async () => {
      const { initDatabase } = await import('./database');

      await initDatabase();

      expect(mockLoad).toHaveBeenCalledWith('sqlite:app.db');
    });

    it('should initialize database with custom name', async () => {
      const { initDatabase } = await import('./database');

      await initDatabase({ name: 'custom.db' });

      expect(mockLoad).toHaveBeenCalledWith('sqlite:custom.db');
    });

    it('should run base migrations', async () => {
      const { initDatabase, baseMigrations } = await import('./database');

      await initDatabase();

      // Should create migrations table
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS _migrations')
      );

      // Should run all base migrations
      for (const migration of baseMigrations) {
        expect(mockExecute).toHaveBeenCalledWith(migration.up);
      }
    });

    it('should skip already applied migrations', async () => {
      // Simulate all migrations already applied
      mockSelect.mockResolvedValue([{ version: 1 }, { version: 2 }, { version: 3 }]);

      const { initDatabase, baseMigrations } = await import('./database');

      await initDatabase();

      // Should NOT run any base migrations again
      for (const migration of baseMigrations) {
        expect(mockExecute).not.toHaveBeenCalledWith(migration.up);
      }
    });

    it('should run custom migrations after base migrations', async () => {
      const { initDatabase } = await import('./database');

      const customMigration = {
        version: 100,
        name: 'custom_table',
        up: 'CREATE TABLE custom (id INTEGER PRIMARY KEY)',
      };

      await initDatabase({ migrations: [customMigration] });

      expect(mockExecute).toHaveBeenCalledWith(customMigration.up);
    });

    it('should return same instance on subsequent calls', async () => {
      const { initDatabase } = await import('./database');

      const db1 = await initDatabase();
      const db2 = await initDatabase();

      expect(db1).toBe(db2);
    });
  });

  describe('getDatabase', () => {
    it('should throw if database not initialized', async () => {
      const { getDatabase } = await import('./database');

      expect(() => getDatabase()).toThrow('Database not initialized');
    });

    it('should return database after initialization', async () => {
      const { initDatabase, getDatabase } = await import('./database');

      await initDatabase();
      const db = getDatabase();

      expect(db).toBeDefined();
    });
  });

  describe('closeDatabase', () => {
    it('should close database connection', async () => {
      const { initDatabase, closeDatabase } = await import('./database');

      await initDatabase();
      await closeDatabase();

      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle closing when not initialized', async () => {
      const { closeDatabase } = await import('./database');

      // Should not throw
      await expect(closeDatabase()).resolves.toBeUndefined();
    });
  });

  describe('Settings API', () => {
    describe('getSetting', () => {
      it('should return null for non-existent setting', async () => {
        const { initDatabase, getSetting } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([]);

        const result = await getSetting('nonexistent');

        expect(result).toBeNull();
      });

      it('should return string value', async () => {
        const { initDatabase, getSetting } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([{ value: 'dark' }]);

        const result = await getSetting('theme');

        expect(result).toBe('dark');
      });

      it('should parse JSON value', async () => {
        const { initDatabase, getSetting } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([{ value: '{"enabled":true}' }]);

        const result = await getSetting<{ enabled: boolean }>('config');

        expect(result).toEqual({ enabled: true });
      });

      it('should return raw value if JSON parse fails', async () => {
        const { initDatabase, getSetting } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([{ value: 'not-json' }]);

        const result = await getSetting('raw');

        expect(result).toBe('not-json');
      });
    });

    describe('setSetting', () => {
      it('should save string value', async () => {
        const { initDatabase, setSetting } = await import('./database');
        await initDatabase();

        await setSetting('theme', 'dark');

        expect(mockExecute).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO settings'),
          ['theme', 'dark']
        );
      });

      it('should serialize object to JSON', async () => {
        const { initDatabase, setSetting } = await import('./database');
        await initDatabase();

        await setSetting('config', { enabled: true });

        expect(mockExecute).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO settings'),
          ['config', '{"enabled":true}']
        );
      });
    });

    describe('deleteSetting', () => {
      it('should delete setting by key', async () => {
        const { initDatabase, deleteSetting } = await import('./database');
        await initDatabase();

        await deleteSetting('theme');

        expect(mockExecute).toHaveBeenCalledWith(
          'DELETE FROM settings WHERE key = $1',
          ['theme']
        );
      });
    });

    describe('getAllSettings', () => {
      it('should return empty object when no settings', async () => {
        const { initDatabase, getAllSettings } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([]);

        const result = await getAllSettings();

        expect(result).toEqual({});
      });

      it('should return all settings as object', async () => {
        const { initDatabase, getAllSettings } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([
          { key: 'theme', value: 'dark' },
          { key: 'language', value: '"en"' },
        ]);

        const result = await getAllSettings();

        expect(result).toEqual({
          theme: 'dark',
          language: 'en',
        });
      });
    });
  });

  describe('App State API', () => {
    describe('getAppState', () => {
      it('should return null for non-existent state', async () => {
        const { initDatabase, getAppState } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([]);

        const result = await getAppState('sidebar');

        expect(result).toBeNull();
      });

      it('should return null for null value', async () => {
        const { initDatabase, getAppState } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([{ value: null }]);

        const result = await getAppState('sidebar');

        expect(result).toBeNull();
      });

      it('should parse JSON value', async () => {
        const { initDatabase, getAppState } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([{ value: '{"collapsed":true}' }]);

        const result = await getAppState<{ collapsed: boolean }>('sidebar');

        expect(result).toEqual({ collapsed: true });
      });
    });

    describe('setAppState', () => {
      it('should save state with JSON serialization', async () => {
        const { initDatabase, setAppState } = await import('./database');
        await initDatabase();

        await setAppState('sidebar', { collapsed: true });

        expect(mockExecute).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO app_state'),
          ['sidebar', '{"collapsed":true}']
        );
      });

      it('should handle null value', async () => {
        const { initDatabase, setAppState } = await import('./database');
        await initDatabase();

        await setAppState('sidebar', null);

        expect(mockExecute).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO app_state'),
          ['sidebar', null]
        );
      });
    });

    describe('deleteAppState', () => {
      it('should delete state by key', async () => {
        const { initDatabase, deleteAppState } = await import('./database');
        await initDatabase();

        await deleteAppState('sidebar');

        expect(mockExecute).toHaveBeenCalledWith(
          'DELETE FROM app_state WHERE key = $1',
          ['sidebar']
        );
      });
    });
  });

  describe('Query Helpers', () => {
    describe('query', () => {
      it('should execute SELECT query', async () => {
        const { initDatabase, query } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([{ id: 1, name: 'Test' }]);

        const result = await query('SELECT * FROM users WHERE id = $1', [1]);

        expect(mockSelect).toHaveBeenCalledWith(
          'SELECT * FROM users WHERE id = $1',
          [1]
        );
        expect(result).toEqual([{ id: 1, name: 'Test' }]);
      });

      it('should work without parameters', async () => {
        const { initDatabase, query } = await import('./database');
        await initDatabase();

        mockSelect.mockResolvedValueOnce([]);

        await query('SELECT * FROM users');

        expect(mockSelect).toHaveBeenCalledWith('SELECT * FROM users', []);
      });
    });

    describe('execute', () => {
      it('should execute INSERT/UPDATE/DELETE query', async () => {
        const { initDatabase, execute } = await import('./database');
        await initDatabase();

        mockExecute.mockResolvedValueOnce({
          rowsAffected: 1,
          lastInsertId: 5,
        });

        const result = await execute(
          'INSERT INTO users (name) VALUES ($1)',
          ['Test']
        );

        expect(result).toEqual({
          rowsAffected: 1,
          lastInsertId: 5,
        });
      });

      it('should default lastInsertId to 0', async () => {
        const { initDatabase, execute } = await import('./database');
        await initDatabase();

        mockExecute.mockResolvedValueOnce({
          rowsAffected: 1,
          lastInsertId: undefined,
        });

        const result = await execute('DELETE FROM users WHERE id = $1', [1]);

        expect(result.lastInsertId).toBe(0);
      });
    });

    describe('transaction', () => {
      it('should commit on success', async () => {
        const { initDatabase, transaction } = await import('./database');
        await initDatabase();

        const callback = vi.fn().mockResolvedValue('result');

        const result = await transaction(callback);

        expect(mockExecute).toHaveBeenCalledWith('BEGIN TRANSACTION');
        expect(callback).toHaveBeenCalled();
        expect(mockExecute).toHaveBeenCalledWith('COMMIT');
        expect(result).toBe('result');
      });

      it('should rollback on error', async () => {
        const { initDatabase, transaction } = await import('./database');
        await initDatabase();

        const error = new Error('Transaction failed');
        const callback = vi.fn().mockRejectedValue(error);

        await expect(transaction(callback)).rejects.toThrow('Transaction failed');

        expect(mockExecute).toHaveBeenCalledWith('BEGIN TRANSACTION');
        expect(mockExecute).toHaveBeenCalledWith('ROLLBACK');
      });
    });
  });

  describe('baseMigrations', () => {
    it('should have correct structure', async () => {
      const { baseMigrations } = await import('./database');

      expect(baseMigrations).toHaveLength(3);

      for (const migration of baseMigrations) {
        expect(migration).toHaveProperty('version');
        expect(migration).toHaveProperty('name');
        expect(migration).toHaveProperty('up');
        expect(typeof migration.version).toBe('number');
        expect(typeof migration.name).toBe('string');
        expect(typeof migration.up).toBe('string');
      }
    });

    it('should have sequential versions', async () => {
      const { baseMigrations } = await import('./database');

      const versions = baseMigrations.map((m) => m.version);
      expect(versions).toEqual([1, 2, 3]);
    });
  });
});
