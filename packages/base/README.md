# @linch-tech/desktop-core

Tauri v2 + React 19 桌面应用核心库。

## 安装

```bash
# 推荐：使用脚手架
pnpm create linch-app my-app

# 或手动安装
pnpm add @linch-tech/desktop-core
pnpm add i18next react-i18next i18next-browser-languagedetector
```

## 基本使用

```tsx
// App.tsx
import { LinchDesktopProvider, Shell } from '@linch-tech/desktop-core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <LinchDesktopProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LinchDesktopProvider>
  );
}
```

如果不使用 `LinchDesktopProvider`，可在入口手动调用 `initI18n()` 来加载应用翻译（第三个参数为 `supportedLanguages`）。

## 内置页面

内置 `SettingsPage`，可直接作为设置页使用，支持传入 `footer` 自定义底部文案。

```tsx
import { SettingsPage } from '@linch-tech/desktop-core';

<Route path="/settings" element={<SettingsPage />} />
```

## 配置详解

```typescript
import type { LinchDesktopConfig } from '@linch-tech/desktop-core';
import { Home, Settings } from 'lucide-react';

export const config: Partial<LinchDesktopConfig> = {
  // 品牌
  brand: {
    name: 'app.name',      // i18n key，会被翻译
    version: 'v1.0.0',
    logo: CustomLogo,      // 可选，自定义 Logo 组件
  },

  // 侧边栏导航
  nav: [
    { title: 'nav.home', path: '/', icon: Home },
    { title: 'settings.title', path: '/settings', icon: Settings },
  ],

  // 功能开关
  features: {
    updater: true,    // 自动更新
    database: true,   // SQLite 数据库
    sentry: false,    // Sentry 错误追踪
  },

  // 布局
  layout: {
    sidebar: { width: 180 },
  },

  // i18n（应用翻译，会与基座翻译合并）
  i18n: {
    defaultLanguage: 'zh',
    supportedLanguages: ['zh', 'en'],
    resources: {
      zh: {
        app: { name: '我的应用' },
        nav: { home: '首页' },
      },
      en: {
        app: { name: 'My App' },
        nav: { home: 'Home' },
      },
    },
  },

  // 数据库
  database: {
    name: 'app.db',
    migrations: [],  // 自定义迁移
  },

  // Sentry（可选）
  sentry: {
    dsn: 'https://xxx@sentry.io/xxx',
  },
};
```

## i18n 语言包

**基座内置翻译**（自动加载）：
- `common.save/cancel/language/theme/user/menu.*`
- `settings.title/description/tabs/appearance/about.*`

**应用翻译**（config.i18n.resources）：
- 使用 `addResourceBundle` 深度合并
- 可覆盖基座翻译
- `supportedLanguages` 会用于语言切换器展示

## 主题覆盖

通过 `config.theme` 覆盖 CSS 变量与圆角/字体：

```typescript
theme: {
  colors: {
    primary: 'oklch(0.48 0.243 264.376)',
    background: 'oklch(1 0 0)',
  },
  radius: 'md',
  font: {
    sans: '"SF Pro Text", system-ui, sans-serif',
  },
  cssVariables: {
    sidebar: 'oklch(0.985 0 0)',
  },
},
```

## 导出的组件

| 组件 | 说明 |
|------|------|
| `LinchDesktopProvider` | 主 Provider，包裹整个应用 |
| `Shell` | 布局容器（侧边栏 + 内容区） |
| `TitleBar` | 标题栏（可拖拽、窗口控制） |
| `PageHeader` | 页面头部 |
| `ThemeSwitcher` | 主题切换器 |
| `LanguageSwitcher` | 语言切换器 |
| `Logo` | 默认 Logo |
| `Button/Badge/Dialog/...` | shadcn/ui 组件 |

## 导出的 Hooks

```typescript
// 主题
const { theme, setTheme } = useTheme();
// theme: 'light' | 'dark' | 'system'

// 更新
const { enabled, status, updateInfo, check, download, install } = useUpdater({
  enabled: config.features?.updater !== false,
});
// enabled: false 时会阻止检查与下载
// status: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'up-to-date' | 'check-error' | 'download-error'

// 数据库设置
const [value, setValue] = useSetting<T>('key', defaultValue);

// 获取配置
const config = useConfig();
```

## 数据库 API

```typescript
import { query, execute, transaction, getSetting, setSetting } from '@linch-tech/desktop-core';

// 查询
const users = await query<User>('SELECT * FROM users WHERE id = ?', [1]);

// 执行
await execute('INSERT INTO users (name) VALUES (?)', ['John']);

// 事务
await transaction(async () => {
  await execute('UPDATE accounts SET balance = balance - 100 WHERE id = ?', [1]);
  await execute('UPDATE accounts SET balance = balance + 100 WHERE id = ?', [2]);
});

// 设置存储
await setSetting('theme', 'dark');
const theme = await getSetting<string>('theme');
```

## HTTP API

默认导出的 `api` 使用 `VITE_API_BASE_URL` 作为基地址，也可以在运行时修改：

```typescript
import { api } from '@linch-tech/desktop-core';

api.setBaseUrl('https://api.example.com');
const user = await api.get('/users/1');
```

也可为不同服务创建独立客户端：

```typescript
import { createApiClient } from '@linch-tech/desktop-core';

const billingApi = createApiClient({ baseUrl: 'https://billing.example.com' });
```

## Rust 后端

```toml
# src-tauri/Cargo.toml
[dependencies]
# 未发布到 crates.io 前，使用 git 依赖
linch_desktop_core = { git = "https://github.com/laofahai/linch-pc-base", tag = "v0.1.2", package = "linch_desktop_core" }

# 发布到 crates.io 后可改为版本号
# linch_desktop_core = "0.1"
```

```rust
// src-tauri/src/lib.rs
use linch_desktop_core::{LinchDesktopExt, LinchConfig};

pub fn run() {
    let config = LinchConfig::from_env();

    tauri::Builder::default()
        .with_linch_desktop(config)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 升级指南

**前端**：
```bash
pnpm update @linch-tech/desktop-core
```

**Rust**：
```toml
# 编辑 src-tauri/Cargo.toml
linch_desktop_core = "新版本号"
```

**注意**：开发模式下会自动检测新版本并在控制台提示。

## License

MIT
