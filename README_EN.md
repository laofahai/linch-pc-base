# Linch Base 🚀

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Tauri](https://img.shields.io/badge/Tauri-v2-blue.svg)
![React](https://img.shields.io/badge/React-v19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178c6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38b2ac.svg)

[English](./README_EN.md) | [简体中文](./README.md)

**Linch Base** is a highly customizable, production-ready desktop application base built with **Tauri v2 + React 19 + Tailwind v4**.

It integrates best practices from the Linch family of projects (Mind, Redact, Print), designed to provide an "out-of-the-box" development experience for new projects. No need to configure routing, i18n, or window decorations from scratch—just `clone` -> `detach` -> `dev` and focus on your business logic.

## ✨ Key Features

- **⚡️ Modern Stack**: Built with React 19, Vite 7, TypeScript, and next-gen Tailwind CSS v4.
- **🪟 Custom Window Decorations**: 
  - Integrated beautiful **Frameless Window** TitleBar with backdrop blur support.
  - Native-like dragging, double-click to maximize, and window controls logic.
  - Deeply integrated Dark/Light mode switching.
- **🧩 Config-Driven Layout**:
  - App branding (Logo, Name, Version) and Sidebar menus are fully driven by `src/config/app.tsx`.
  - Structured routing with support for multi-level sidebar navigation.
- **🌐 Internationalization (i18n)**: Fully integrated `i18next` with real-time language switching, deeply embedded in TitleBar and Sidebar.
- **🛡️ Security & Optimization**:
  - Automatically disables context menu, F12, and debug shortcuts in production builds.
  - Solves common WSL/Windows proxy issues (502 Bad Gateway).
- **🪄 Smart Scaffolding**: Includes a `pnpm detach` script to automate new project initialization (renaming, git reset, random development port assignment, etc.).

## 🛠️ Quick Start

### 1. Run as a standalone project
If you just want to see it in action:
```bash
pnpm install
pnpm tauri dev
```

### 2. Create a new project based on this (Recommended)
This is the primary usage. Suppose you want to build `linch-chat`:

1. **Clone and enter directory**:
   ```bash
   git clone <repo-url> linch-chat
   cd linch-chat
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Run the detach script**:
   ```bash
   pnpm detach
   ```
   The script will ask for:
   - **Project Name**: e.g., `linch-chat` (updates package.json, Cargo.toml, etc.).
   - **App Title**: e.g., `Linch Chat` (updates window title and i18n brand name).
   - **Bundle Identifier**: e.g., `tech.linch.chat`.
   
   *Note: The script automatically assigns a unique port (e.g., 14567) to ensure multiple projects can run simultaneously without conflict.*

4. **Start coding**:
   ```bash
   pnpm tauri dev
   ```

## 📁 Project Structure

```text
src/
├── config/          # [Core] Global app config (Branding, Nav menus)
├── components/
│   ├── base/        # [Core] Base components (TitleBar, ShellLayout)
│   ├── ui/          # Shadcn UI primitives
│   └── shared/      # Common widgets (Logo, PageHeader)
├── i18n/            # i18n config and translations
├── lib/             # Utilities and Tauri API wrappers
├── pages/           # Application pages
└── stores/          # Global state management (Zustand)
```

## ⚙️ Advanced Customization

- **Edit Menu/Brand**: Modify `src/config/app.tsx`.
- **Add New Pages**: Create components in `src/pages`, configure routes in `src/App.tsx`, and add sidebar links in `app.config.tsx`.
- **Customize Window Style**: Tweak your window decorations in `src/components/base/TitleBar.tsx`.

## 📝 License

MIT License © 2026 Linch Tech
