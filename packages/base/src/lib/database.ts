import Database from '@tauri-apps/plugin-sql';

// ============================================================================
// Types
// ============================================================================

export interface Migration {
  version: number;
  name: string;
  up: string;
  down?: string;
}

export interface QueryResult<T = unknown> {
  rows: T[];
  rowsAffected: number;
  lastInsertId: number;
}

export interface DatabaseInitOptions {
  /**
   * Database name (default: 'app.db')
   */
  name?: string;

  /**
   * Additional migrations to run after base migrations
   */
  migrations?: Migration[];
}

// ============================================================================
// Database Manager
// ============================================================================

let db: Database | null = null;
let currentDbName: string = 'sqlite:app.db';

/**
 * Base migrations provided by the core
 * These create essential tables: settings, app_state
 */
export const baseMigrations: Migration[] = [
  {
    version: 1,
    name: 'create_settings_table',
    up: `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `,
    down: 'DROP TABLE IF EXISTS settings',
  },
  {
    version: 2,
    name: 'create_app_state_table',
    up: `
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `,
    down: 'DROP TABLE IF EXISTS app_state',
  },
  {
    version: 3,
    name: 'create_app_state_index',
    up: 'CREATE INDEX IF NOT EXISTS idx_app_state_key ON app_state(key)',
    down: 'DROP INDEX IF EXISTS idx_app_state_key',
  },
];

/**
 * Initialize database connection
 */
export async function initDatabase(options?: DatabaseInitOptions): Promise<Database> {
  if (db) return db;

  const dbName = options?.name ?? 'app.db';
  currentDbName = `sqlite:${dbName}`;

  try {
    db = await Database.load(currentDbName);

    // Combine base migrations with custom migrations
    const allMigrations = [
      ...baseMigrations,
      ...(options?.migrations ?? []),
    ];

    await runMigrations(allMigrations);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get database instance (must call initDatabase first)
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

// ============================================================================
// Migration System
// ============================================================================

/**
 * Run pending migrations
 */
async function runMigrations(migrations: Migration[]): Promise<void> {
  const database = getDatabase();

  // Create migrations table if not exists
  await database.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Get applied migrations
  const applied = await database.select<{ version: number }[]>(
    'SELECT version FROM _migrations ORDER BY version'
  );
  const appliedVersions = new Set(applied.map((m) => m.version));

  // Run pending migrations
  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      console.log(`Running migration: ${migration.name}`);
      await database.execute(migration.up);
      await database.execute(
        'INSERT INTO _migrations (version, name) VALUES ($1, $2)',
        [migration.version, migration.name]
      );
    }
  }
}

// ============================================================================
// Settings API
// ============================================================================

export interface SettingsRow {
  key: string;
  value: string;
  updated_at: number;
}

/**
 * Get a setting value
 */
export async function getSetting<T = string>(key: string): Promise<T | null> {
  const database = getDatabase();
  const result = await database.select<SettingsRow[]>(
    'SELECT value FROM settings WHERE key = $1',
    [key]
  );

  if (result.length === 0) return null;

  try {
    return JSON.parse(result[0].value) as T;
  } catch {
    return result[0].value as T;
  }
}

/**
 * Set a setting value
 */
export async function setSetting<T = string>(key: string, value: T): Promise<void> {
  const database = getDatabase();
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);

  await database.execute(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, strftime('%s', 'now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = strftime('%s', 'now')`,
    [key, serialized]
  );
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<void> {
  const database = getDatabase();
  await database.execute('DELETE FROM settings WHERE key = $1', [key]);
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const database = getDatabase();
  const result = await database.select<SettingsRow[]>('SELECT key, value FROM settings');

  return result.reduce(
    (acc, row) => {
      try {
        acc[row.key] = JSON.parse(row.value);
      } catch {
        acc[row.key] = row.value;
      }
      return acc;
    },
    {} as Record<string, unknown>
  );
}

// ============================================================================
// App State API (for persisting UI state)
// ============================================================================

export interface AppStateRow {
  id: number;
  key: string;
  value: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Get app state value
 */
export async function getAppState<T = unknown>(key: string): Promise<T | null> {
  const database = getDatabase();
  const result = await database.select<AppStateRow[]>(
    'SELECT value FROM app_state WHERE key = $1',
    [key]
  );

  if (result.length === 0 || result[0].value === null) return null;

  try {
    return JSON.parse(result[0].value) as T;
  } catch {
    return result[0].value as unknown as T;
  }
}

/**
 * Set app state value
 */
export async function setAppState<T = unknown>(key: string, value: T): Promise<void> {
  const database = getDatabase();
  const serialized = value === null ? null : JSON.stringify(value);

  await database.execute(
    `INSERT INTO app_state (key, value, updated_at)
     VALUES ($1, $2, strftime('%s', 'now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = strftime('%s', 'now')`,
    [key, serialized]
  );
}

/**
 * Delete app state
 */
export async function deleteAppState(key: string): Promise<void> {
  const database = getDatabase();
  await database.execute('DELETE FROM app_state WHERE key = $1', [key]);
}

// ============================================================================
// Generic Query Helpers
// ============================================================================

/**
 * Execute a raw SELECT query
 */
export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = getDatabase();
  return database.select<T[]>(sql, params);
}

/**
 * Execute a raw INSERT/UPDATE/DELETE query
 */
export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<{ rowsAffected: number; lastInsertId: number }> {
  const database = getDatabase();
  const result = await database.execute(sql, params);
  return {
    rowsAffected: result.rowsAffected,
    lastInsertId: result.lastInsertId ?? 0,
  };
}

/**
 * Run multiple queries in a transaction
 */
export async function transaction<T>(
  callback: (db: Database) => Promise<T>
): Promise<T> {
  const database = getDatabase();

  await database.execute('BEGIN TRANSACTION');
  try {
    const result = await callback(database);
    await database.execute('COMMIT');
    return result;
  } catch (error) {
    await database.execute('ROLLBACK');
    throw error;
  }
}
