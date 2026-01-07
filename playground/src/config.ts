import { Inbox, Calculator } from 'lucide-react';
import type { LinchDesktopConfig } from '@linch-tech/desktop-core';

export const config: Partial<LinchDesktopConfig> = {
  brand: {
    name: 'app.name',
    version: 'v0.1.2',
  },

  nav: [
    { title: 'app.dashboard', path: '/', icon: Inbox },
    { title: 'app.demo', path: '/demo', icon: Calculator },
  ],

  features: {
    updater: true,
    database: true,
    sentry: false,
  },

  layout: {
    sidebar: {
      width: 180,
    },
  },

  i18n: {
    defaultLanguage: 'zh',
    resources: {
      en: {
        app: {
          name: 'Playground',
          dashboard: 'Dashboard',
          demo: 'Demo',
        },
      },
      zh: {
        app: {
          name: 'Playground',
          dashboard: '仪表盘',
          demo: '演示',
        },
      },
    },
  },
};
