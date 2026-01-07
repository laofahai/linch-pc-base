import * as Sentry from '@sentry/react';
import type { SentryConfig } from '../types';

export interface SentryInitOptions extends SentryConfig {
  /**
   * Environment name (e.g., 'development', 'production')
   */
  environment?: string;

  /**
   * Whether to enable Sentry (default: true when DSN is provided)
   */
  enabled?: boolean;
}

export function initSentry(options?: SentryInitOptions) {
  if (!options?.dsn) {
    console.debug('Sentry DSN not configured, skipping initialization');
    return;
  }

  const isDev = options.environment === 'development' || import.meta.env?.DEV;
  const isProd = options.environment === 'production' || import.meta.env?.PROD;

  Sentry.init({
    dsn: options.dsn,
    environment: options.environment ?? (isDev ? 'development' : 'production'),

    // Performance monitoring
    tracesSampleRate: options.tracesSampleRate ?? 0.1,

    // Session replay (optional, can be enabled later)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: isProd ? 1.0 : 0,

    // Enable based on option or DSN presence
    enabled: options.enabled ?? true,

    // Filter out known non-issues
    ignoreErrors: [
      // Browser extensions
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
      // User aborted requests
      'AbortError',
    ],

    beforeSend(event) {
      // Don't send events in development
      if (isDev) {
        console.debug('Sentry event (dev mode, not sent):', event);
        return null;
      }
      return event;
    },
  });
}

// Re-export Sentry for manual error capturing
export { Sentry };

// Helper to capture errors with context
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

// Helper to set user context
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user);
}

// Helper to add breadcrumb
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
}
