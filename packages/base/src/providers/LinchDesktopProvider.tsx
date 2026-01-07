import { type ReactNode, useEffect, useLayoutEffect } from 'react';
import { ConfigProvider } from '../context/config';
import { DatabaseProvider } from '../components/providers/DatabaseProvider';
import { ErrorBoundary } from '../components/providers/ErrorBoundary';
import { initSentry } from '../lib/sentry';
import { initI18n } from '../i18n/config';
import { baseMigrations } from '../lib/database';
import { logUpdateNotice } from '../lib/version-check';
import type { LinchDesktopConfig } from '../types';

export interface LinchDesktopProviderProps {
  /**
   * Application configuration
   */
  config: Partial<LinchDesktopConfig>;

  /**
   * Children to render
   */
  children: ReactNode;
}

/**
 * Main provider for Linch Desktop Core.
 * Wraps your app with all necessary providers:
 * - Config context
 * - Error boundary
 * - Database (optional)
 * - Sentry (optional)
 * - i18n
 */
export function LinchDesktopProvider({
  config,
  children,
}: LinchDesktopProviderProps) {
  const features = config.features ?? {};
  const sentryConfig = config.sentry;
  const i18nConfig = config.i18n;
  const dbConfig = config.database;

  // Add app-specific i18n resources (i18n is already initialized at module load)
  useLayoutEffect(() => {
    initI18n(i18nConfig?.defaultLanguage, i18nConfig?.resources);
  }, [i18nConfig?.defaultLanguage, i18nConfig?.resources]);

  // Initialize Sentry if enabled
  useEffect(() => {
    if (features.sentry !== false && sentryConfig?.dsn) {
      initSentry({
        dsn: sentryConfig.dsn,
        tracesSampleRate: sentryConfig.tracesSampleRate,
      });
    }
  }, [features.sentry, sentryConfig]);

  // Check for core updates in dev mode
  useEffect(() => {
    logUpdateNotice();
  }, []);

  // Merge base migrations with app migrations
  const allMigrations = [
    ...baseMigrations,
    ...(dbConfig?.migrations ?? []),
  ];

  // Build the provider tree
  let content = children;

  // Wrap with DatabaseProvider if enabled
  if (features.database !== false) {
    content = (
      <DatabaseProvider
        dbName={dbConfig?.name}
        migrations={allMigrations}
      >
        {content}
      </DatabaseProvider>
    );
  }

  return (
    <ConfigProvider config={config}>
      <ErrorBoundary>
        {content}
      </ErrorBoundary>
    </ConfigProvider>
  );
}
