import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseAsyncReturn<T, Args extends unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing async operations with loading, error, and data states
 *
 * @param asyncFunction - async function to execute
 * @param immediate - whether to execute immediately on mount
 * @returns async state and control functions
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useAsync(
 *   async (id: number) => fetchUser(id),
 *   false
 * );
 *
 * // Execute manually
 * const handleClick = () => execute(123);
 *
 * // Or execute immediately
 * const { data, isLoading } = useAsync(() => fetchUsers(), true);
 * ```
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate = false
): UseAsyncReturn<T, Args> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
  });

  // Track if component is mounted
  const isMounted = useRef(true);
  const lastCallId = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      const callId = ++lastCallId.current;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
      }));

      try {
        const result = await asyncFunction(...args);

        // Only update state if this is the latest call and component is mounted
        if (isMounted.current && callId === lastCallId.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
        }

        return result;
      } catch (error) {
        // Only update state if this is the latest call and component is mounted
        if (isMounted.current && callId === lastCallId.current) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }

        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  // Execute immediately if requested (only on mount)
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Simplified hook for fetching data on mount
 *
 * @param asyncFunction - async function that returns data
 * @param deps - dependency array to trigger refetch
 * @returns async state
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useFetch(() => fetchUsers());
 * const { data } = useFetch(() => fetchUser(id), [id]);
 * ```
 */
export function useFetch<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> & { refetch: () => Promise<T | null> } {
  const { execute, ...state } = useAsync(asyncFunction, false);

  useEffect(() => {
    execute();
    // deps is intentionally used as the dependency array
  }, [...deps, execute]);

  return {
    ...state,
    refetch: execute,
  };
}
