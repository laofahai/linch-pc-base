import { Home, Settings } from 'lucide-react';
import type { LinchDesktopConfig } from '@linch-tech/desktop-core';

export const config: Partial<LinchDesktopConfig> = {
  brand: {
    name: 'app.name',
    version: 'v0.1.0',
  },

  nav: [
    { title: 'app.home', path: '/', icon: Home },
    { title: 'settings.title', path: '/settings', icon: Settings },
  ],

  features: {
    updater: true,
    database: true,
    sentry: false,
  },

  i18n: {
    defaultLanguage: 'zh',
    supportedLanguages: ['zh', 'en'],
    resources: {
      en: {
        app: {
          name: '{{displayName}}',
          home: 'Home',
          welcome: 'Welcome to {{displayName}}',
          description: 'Start building your desktop application',
        },
      },
      zh: {
        app: {
          name: '{{displayName}}',
          home: '首页',
          welcome: '欢迎使用 {{displayName}}',
          description: '开始构建你的桌面应用',
        },
      },
    },
  },
};
