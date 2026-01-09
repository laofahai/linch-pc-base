import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook that debounces a value
 *
 * @param value - value to debounce
 * @param delay - delay in milliseconds
 * @returns debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     search(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function
 *
 * @param callback - function to debounce
 * @param delay - delay in milliseconds
 * @returns debounced function and cancel function
 *
 * @example
 * ```tsx
 * const [debouncedSearch, cancel] = useDebouncedCallback(
 *   (term: string) => performSearch(term),
 *   300
 * );
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): [(...args: Args) => void, () => void] {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Args) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return [debouncedCallback, cancel];
}

/**
 * Hook that throttles a value
 *
 * @param value - value to throttle
 * @param interval - interval in milliseconds
 * @returns throttled value
 *
 * @example
 * ```tsx
 * const [position, setPosition] = useState({ x: 0, y: 0 });
 * const throttledPosition = useThrottle(position, 100);
 * ```
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Hook that returns a throttled callback function
 *
 * @param callback - function to throttle
 * @param interval - interval in milliseconds
 * @returns throttled function
 *
 * @example
 * ```tsx
 * const throttledScroll = useThrottledCallback(
 *   () => console.log('scrolled'),
 *   100
 * );
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', throttledScroll);
 *   return () => window.removeEventListener('scroll', throttledScroll);
 * }, [throttledScroll]);
 * ```
 */
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  interval: number
): (...args: Args) => void {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useMemo(
    () =>
      (...args: Args) => {
        const now = Date.now();

        if (now - lastRan.current >= interval) {
          callbackRef.current(...args);
          lastRan.current = now;
        } else {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(
            () => {
              callbackRef.current(...args);
              lastRan.current = Date.now();
            },
            interval - (now - lastRan.current)
          );
        }
      },
    [interval]
  );
}
