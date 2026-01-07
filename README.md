# Linch Base

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Tauri](https://img.shields.io/badge/Tauri-v2-blue.svg)
![React](https://img.shields.io/badge/React-v19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178c6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38b2ac.svg)

[English](./README_EN.md) | [简体中文](./README.md)

**Linch Base** 是一个生产级的 **Tauri v2 + React 19 + Tailwind v4** 桌面应用基座。

集成了 Linch 家族系列项目的最佳实践，为新项目提供"开箱即用"的开发体验。`clone` -> `detach` -> `dev` 即可专注业务开发。

## 核心特性

### 基础架构
- **现代技术栈**: React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS v4
- **状态管理**: Zustand 5 (支持 localStorage 持久化)
- **国际化**: i18next (中/英双语，实时切换)
- **路由**: React Router v7

### 桌面特性
- **无边框窗口**: 自定义标题栏，磨砂毛玻璃效果
- **窗口控制**: 拖拽移动、双击最大化、最小化/最大化/关闭
- **深色模式**: 支持 Light / Dark / System 三种模式

### 数据存储
- **SQLite 数据库**: Tauri SQL 插件，支持迁移系统
- **Settings 存储**: 键值对形式的设置存储
- **App State**: UI 状态持久化

### 应用更新
- **自动更新**: Tauri Updater 插件
- **多源支持**: GitHub Releases / OSS 静态托管
- **签名验证**: Ed25519 签名确保更新安全

### 监控与日志
- **错误上报**: Sentry (前端 + Rust 后端)
- **结构化日志**: 分级日志系统，支持自定义 Handler
- **集中配置**: 统一配置模块，环境感知

### 工程化
- **单元测试**: Vitest + Testing Library
- **代码检查**: ESLint + TypeScript 严格模式
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions 多平台构建
- **自动发布**: release-it + conventional-changelog
- **OSS 同步**: 阿里云 OSS 自动上传更新包

## 快速开始

### 直接运行
```bash
pnpm install
pnpm tauri dev
```

### 创建新项目 (推荐)
```bash
# 1. 克隆
git clone <repo-url> my-app
cd my-app

# 2. 安装依赖
pnpm install

# 3. 执行分离脚本
pnpm detach
# 输入项目名称、标题、Bundle ID

# 4. 开始开发
pnpm tauri dev
```

## 目录结构

```
src/
├── components/
│   ├── base/           # 基座组件 (TitleBar, Shell)
│   ├── ui/             # shadcn/ui 组件
│   ├── shared/         # 共享组件 (Logo, PageHeader, Switchers)
│   └── providers/      # Context Providers
├── config/             # 应用配置 (品牌、导航)
├── hooks/              # 自定义 Hooks
├── i18n/               # 国际化配置
├── lib/                # 工具库
│   ├── api.ts          # HTTP 客户端
│   ├── config.ts       # 集中配置
│   ├── database.ts     # SQLite 操作
│   ├── logger.ts       # 结构化日志
│   ├── sentry.ts       # Sentry 错误上报
│   ├── updater.ts      # 更新服务
│   ├── tauri.ts        # Tauri API 封装
│   └── utils.ts        # 通用工具
├── pages/              # 页面组件
├── stores/             # Zustand stores
└── test/               # 测试配置

src-tauri/
├── src/                # Rust 源码
├── capabilities/       # 安全权限配置
├── icons/              # 应用图标
└── .keys/              # 签名密钥 (私钥不提交!)
```

## 命令

```bash
# 开发
pnpm dev              # 前端开发服务器
pnpm tauri dev        # Tauri 开发模式

# 构建
pnpm build            # 前端构建
pnpm tauri build      # 打包应用

# 测试
pnpm test             # 交互式测试
pnpm test:run         # 运行测试
pnpm test:coverage    # 覆盖率报告

# 其他
pnpm lint             # 代码检查
pnpm detach           # 初始化新项目
pnpm gen:icon         # 生成图标
```

## 配置

### 应用配置
编辑 `src/config/app.tsx` 修改：
- 品牌信息 (Logo, 名称, 版本)
- 侧边栏导航菜单
- 布局参数

### 更新配置
编辑 `src-tauri/tauri.conf.json` 中的 `plugins.updater`：
```json
{
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY",
      "endpoints": [
        "https://github.com/owner/repo/releases/latest/download/latest.json"
      ]
    }
  }
}
```

详细配置见 [docs/updater.md](./docs/updater.md)

### 数据库
数据库文件位于应用数据目录，迁移配置在 `src/lib/database.ts`。

## 发布

### 1. 配置 GitHub Secrets

| Secret | 说明 |
|--------|------|
| `TAURI_SIGNING_PRIVATE_KEY` | Tauri 签名私钥 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 私钥密码 (可选) |
| `VITE_SENTRY_DSN` | Sentry DSN (可选，错误上报) |
| `OSS_ACCESS_KEY_ID` | 阿里云 AccessKey ID (如启用 OSS) |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret |

### 2. 配置 GitHub Variables

| Variable | 说明 |
|----------|------|
| `ENABLE_OSS_SYNC` | 是否启用 OSS 同步 (`true`/`false`) |
| `OSS_BUCKET` | OSS Bucket 名称 |
| `OSS_REGION` | OSS 区域 (如 `cn-hangzhou`) |

### 3. 创建 Release

使用 release-it 自动发布：
```bash
# 发布 patch 版本 (0.1.0 -> 0.1.1)
pnpm release patch

# 发布 minor 版本 (0.1.0 -> 0.2.0)
pnpm release minor

# 发布 major 版本 (0.1.0 -> 1.0.0)
pnpm release major

# CI 模式 (无交互)
pnpm release patch --ci
```

release-it 将自动：
- 更新 package.json、tauri.conf.json、Cargo.toml 版本号
- 生成 CHANGELOG.md (基于 conventional commits)
- 创建 Git commit 和 tag
- 推送到 GitHub

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式，自动归类到 CHANGELOG：

| 类型 | 说明 | CHANGELOG 分类 |
|------|------|---------------|
| `feat:` | 新功能 | Features |
| `fix:` | Bug 修复 | Bug Fixes |
| `perf:` | 性能优化 | Performance |
| `refactor:` | 重构 | Refactoring |
| `docs:` | 文档 | Documentation |
| `chore:` | 杂项 | (隐藏) |

示例：
```bash
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复更新检查失败的问题"
```

GitHub Actions 将自动：
- 构建 Windows / macOS / Linux
- 签名更新包
- 上传到 GitHub Releases
- 同步到阿里云 OSS (如已启用)

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 |
| 构建工具 | Vite 7 |
| 类型系统 | TypeScript 5.9 |
| 样式 | Tailwind CSS 4 |
| UI 组件 | Radix UI + shadcn/ui |
| 状态管理 | Zustand 5 |
| 路由 | React Router 7 |
| 国际化 | i18next |
| 桌面框架 | Tauri 2 |
| 数据库 | SQLite |
| 错误监控 | Sentry |
| 发布工具 | release-it |
| 测试 | Vitest |

## 许可证

MIT License © 2026 Linch Tech
