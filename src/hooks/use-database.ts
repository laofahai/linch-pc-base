import { useEffect, useState, useCallback } from 'react';
import {
  initDatabase,
  getSetting,
  setSetting,
  getAppState,
  setAppState,
} from '@/lib/database';

// ============================================================================
// Database Initialization Hook
// ============================================================================

interface UseDatabaseInit {
  isReady: boolean;
  error: Error | null;
}

/**
 * Hook to initialize database on app start
 */
export function useDatabaseInit(): UseDatabaseInit {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setIsReady(true))
      .catch((err) => {
        console.error('Database initialization failed:', err);
        setError(err);
      });
  }, []);

  return { isReady, error };
}

// ============================================================================
// Settings Hook
// ============================================================================

interface UseSettingOptions<T> {
  defaultValue?: T;
}

interface UseSettingReturn<T> {
  value: T | null;
  setValue: (value: T) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to read/write a single setting
 */
export function useSetting<T = string>(
  key: string,
  options: UseSettingOptions<T> = {}
): UseSettingReturn<T> {
  const { defaultValue } = options;
  const [value, setValueState] = useState<T | null>(defaultValue ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value
  useEffect(() => {
    getSetting<T>(key)
      .then((result) => {
        setValueState(result ?? defaultValue ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [key, defaultValue]);

  // Update value
  const setValue = useCallback(
    async (newValue: T) => {
      try {
        await setSetting(key, newValue);
        setValueState(newValue);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [key]
  );

  return { value, setValue, isLoading, error };
}

// ============================================================================
// App State Hook
// ============================================================================

interface UseAppStateReturn<T> {
  state: T | null;
  setState: (value: T) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook to persist UI state to database
 */
export function useAppState<T>(
  key: string,
  defaultValue?: T
): UseAppStateReturn<T> {
  const [state, setStateValue] = useState<T | null>(defaultValue ?? null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    getAppState<T>(key)
      .then((result) => {
        setStateValue(result ?? defaultValue ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load app state for key "${key}":`, err);
        setIsLoading(false);
      });
  }, [key, defaultValue]);

  // Update state
  const setState = useCallback(
    async (newValue: T) => {
      await setAppState(key, newValue);
      setStateValue(newValue);
    },
    [key]
  );

  return { state, setState, isLoading };
}
