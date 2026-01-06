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

### 工程化
- **单元测试**: Vitest + Testing Library
- **代码检查**: ESLint + TypeScript 严格模式
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions 多平台构建

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
│   ├── database.ts     # SQLite 操作
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
```
TAURI_SIGNING_PRIVATE_KEY      # 私钥内容
TAURI_SIGNING_PRIVATE_KEY_PASSWORD  # 私钥密码 (可选)
```

### 2. 创建 Release
```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions 将自动：
- 构建 Windows / macOS / Linux
- 签名更新包
- 发布到 GitHub Releases

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
| 测试 | Vitest |

## 许可证

MIT License © 2026 Linch Tech
