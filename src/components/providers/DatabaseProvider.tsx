import { createContext, useContext, ReactNode } from 'react';
import { useDatabaseInit } from '@/hooks/use-database';

interface DatabaseContextValue {
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function DatabaseProvider({ children, fallback }: DatabaseProviderProps) {
  const { isReady, error } = useDatabaseInit();

  if (error) {
    console.error('Database initialization error:', error);
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="text-destructive text-lg font-semibold">
            Database Error
          </div>
          <p className="text-muted-foreground text-sm max-w-md">
            {error.message || String(error)}
          </p>
          <pre className="text-xs text-left bg-muted p-4 rounded max-w-lg overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
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
