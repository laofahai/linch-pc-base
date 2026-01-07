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

// ============================================================================
// Database Manager
// ============================================================================

let db: Database | null = null;

const DB_NAME = 'sqlite:app.db';

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  try {
    db = await Database.load(DB_NAME);
    await runMigrations();
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

const migrations: Migration[] = [
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
  {
    version: 4,
    name: 'create_notes_table',
    up: `
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `,
    down: 'DROP TABLE IF EXISTS notes',
  },
  {
    version: 5,
    name: 'create_notes_index',
    up: 'CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC)',
    down: 'DROP INDEX IF EXISTS idx_notes_created_at',
  },
];

/**
 * Run pending migrations
 */
async function runMigrations(): Promise<void> {
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
