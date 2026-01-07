/**
 * Centralized application configuration
 * All config values should be accessed through this module
 */

export const config = {
  // App info
  app: {
    name: 'Linch PC Base',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  },

  // Sentry error reporting
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    enabled: !!import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  },

  // Logging
  logging: {
    level: import.meta.env.PROD ? 'warn' : 'debug',
  },

  // Auto update
  update: {
    // Check for updates on startup
    checkOnStartup: true,
    // Delay before checking (ms)
    checkDelay: 2000,
  },

  // Feature flags (can be extended)
  features: {
    // Add feature flags here
  },
} as const;

// Type for the config object
export type AppConfig = typeof config;
