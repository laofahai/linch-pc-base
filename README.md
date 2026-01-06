# Linch Base 🚀

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Tauri](https://img.shields.io/badge/Tauri-v2-blue.svg)
![React](https://img.shields.io/badge/React-v19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178c6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38b2ac.svg)

[English](./README_EN.md) | [简体中文](./README.md)

**Linch Base** 是一个高度可定制的、生产级别的 **Tauri v2 + React 19 + Tailwind v4** 桌面应用基座。

它集成了 Linch 家族系列项目（Mind, Redact, Print）的最佳实践，旨在为后续新项目提供“开箱即用”的开发体验。无需从零配置路由、i18n、窗口装饰器，`clone` -> `detach` -> `dev` 即可专注于业务开发。

## ✨ 核心特性

- **⚡️ 现代技术栈**: 采用 React 19, Vite 7, TypeScript, 以及下一代 Tailwind CSS v4。
- **🪟 自定义窗口装饰**: 
  - 内置精美的 **无边框窗口 (Frameless)** 标题栏，支持磨砂毛玻璃效果。
  - 支持原生手感的拖拽、双击缩放、最小化/最大化/关闭逻辑。
  - 深度集成的深色/浅色模式切换。
- **🧩 配置驱动布局**:
  - 应用品牌（Logo, 名称, 版本）和侧边栏菜单完全由 `src/config/app.tsx` 驱动。
  - 路由结构化，支持多级侧边栏导航。
- **🌐 国际化 (i18n)**: 完美集成 `i18next`，支持多语言实时切换，并在标题栏和侧边栏深度集成。
- **🛡️ 安全与优化**:
  - 生产环境自动禁用右键菜单、F12 及调试快捷键。
  - 解决 WSL/Windows 代理导致的 502 Bad Gateway 常见痛点。
- **🪄 智能脚手架**: 内置 `pnpm detach` 脚本，自动化处理新项目初始化（重命名、重置 Git、随机分配开发端口等）。

## 🛠️ 快速开始

### 1. 作为一个独立项目跑起来
如果您只想看看效果：
```bash
pnpm install
pnpm tauri dev
```

### 2. 基于此基座创建一个新项目 (推荐)
这是该基座的主要用法。假设您要做一个新项目 `linch-chat`：

1. **克隆并进入目录**:
   ```bash
   git clone <repo-url> linch-chat
   cd linch-chat
   ```
2. **安装依赖**:
   ```bash
   pnpm install
   ```
3. **执行“分离”脚本**:
   ```bash
   pnpm detach
   ```
   脚本会询问：
   - **Project Name**: 例如 `linch-chat` (会自动修改 package.json, Cargo.toml 等)。
   - **App Title**: 例如 `Linch Chat` (修改窗口标题和 i18n 品牌名)。
   - **Bundle Identifier**: 例如 `tech.linch.chat`。
   
   *注：脚本会自动分配一个唯一的端口（如 14567），确保您的多个项目可以同时开发而不冲突。*

4. **开始开发**:
   ```bash
   pnpm tauri dev
   ```

## 📁 目录结构

```text
src/
├── config/          # [核心] 应用全局配置 (品牌、导航菜单)
├── components/
│   ├── base/        # [核心] 基座组件 (TitleBar, ShellLayout)
│   ├── ui/          # Shadcn UI 基础组件
│   └── shared/      # 业务通用组件 (Logo 等)
├── i18n/            # 国际化配置及翻译文件
├── lib/             # 工具函数与 Tauri API 封装
├── pages/           # 业务页面
└── stores/          # 全局状态管理 (Zustand)
```

## ⚙️ 进阶定制

- **修改菜单/品牌**: 直接编辑 `src/config/app.tsx`。
- **添加新页面**: 在 `src/pages` 创建组件，并在 `src/App.tsx` 配置路由，最后在 `app.config.tsx` 添加侧边栏链接。
- **修改窗口样式**: 在 `src/components/base/TitleBar.tsx` 中定制您的窗口装饰器。

## 📝 许可证

MIT License © 2026 Linch Tech
