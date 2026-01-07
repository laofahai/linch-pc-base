import { createContext, useContext, type ReactNode } from 'react';
import type { LinchDesktopConfig } from '../types';

// Default config values
const defaultConfig: LinchDesktopConfig = {
  brand: {
    name: 'App',
  },
  nav: [],
  features: {
    updater: true,
    database: true,
    sentry: false,
    devtools: import.meta.env.DEV,
  },
  layout: {
    sidebar: {
      width: 180,
      position: 'left',
      collapsible: true,
      defaultCollapsed: false,
    },
    titleBar: {
      height: 48,
      showWindowControls: true,
      draggable: true,
    },
    content: {
      padding: 24,
      maxWidth: 0, // 0 = no limit
    },
  },
};

// Merge configs deeply
function mergeConfig(
  base: LinchDesktopConfig,
  override: Partial<LinchDesktopConfig>
): LinchDesktopConfig {
  return {
    ...base,
    ...override,
    brand: { ...base.brand, ...override.brand },
    features: { ...base.features, ...override.features },
    theme: { ...base.theme, ...override.theme },
    layout: {
      sidebar: { ...base.layout?.sidebar, ...override.layout?.sidebar },
      titleBar: { ...base.layout?.titleBar, ...override.layout?.titleBar },
      content: { ...base.layout?.content, ...override.layout?.content },
    },
    slots: { ...base.slots, ...override.slots },
    components: { ...base.components, ...override.components },
    i18n: { ...base.i18n, ...override.i18n },
    database: { ...base.database, ...override.database },
    sentry: { ...base.sentry, ...override.sentry },
  };
}

// Context
const ConfigContext = createContext<LinchDesktopConfig>(defaultConfig);

// Provider
export interface ConfigProviderProps {
  config: Partial<LinchDesktopConfig>;
  children: ReactNode;
}

export function ConfigProvider({ config, children }: ConfigProviderProps) {
  const mergedConfig = mergeConfig(defaultConfig, config);

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook
export function useConfig(): LinchDesktopConfig {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Export default config for reference
export { defaultConfig };
