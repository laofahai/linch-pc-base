import * as Sentry from '@sentry/react';

// Sentry DSN should be configured via environment variable
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.debug('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,

    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session replay (optional, can be enabled later)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,

    // Only send errors in production
    enabled: import.meta.env.PROD,

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
      if (import.meta.env.DEV) {
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
