import { createContext, useContext, type ReactNode } from 'react';
import { useDatabaseInit } from '../../hooks/use-database';
import type { Migration } from '../../lib/database';

interface DatabaseContextValue {
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export interface DatabaseProviderProps {
  children: ReactNode;
  /**
   * Custom database name (default: 'app.db')
   */
  dbName?: string;
  /**
   * Additional migrations to run
   */
  migrations?: Migration[];
  /**
   * Custom loading fallback
   */
  fallback?: ReactNode;
}

export function DatabaseProvider({
  children,
  dbName,
  migrations,
  fallback,
}: DatabaseProviderProps) {
  const { isReady, error } = useDatabaseInit({ name: dbName, migrations });

  if (error) {
    console.error('Database initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-lg">
          <div className="text-destructive text-lg font-semibold">
            Database Error
          </div>
          <p className="text-muted-foreground text-sm">
            {errorMessage || 'Failed to initialize database'}
          </p>
          {errorStack && (
            <pre className="text-xs text-left bg-muted p-2 rounded overflow-auto max-h-40">
              {errorStack}
            </pre>
          )}
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <>
        {fallback || (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-muted-foreground text-sm">
              Initializing...
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
