# @linch-tech/create-desktop-app

Create a new Linch Desktop application with one command.

## Usage

```bash
# Interactive mode
npx @linch-tech/create-desktop-app my-app

# Non-interactive mode (for CI/scripts)
npx @linch-tech/create-desktop-app my-app -y

# With custom options
npx @linch-tech/create-desktop-app my-app -y -d "My App Name" -i "com.company.myapp"
```

## Options

| Option | Description |
|--------|-------------|
| `-t, --template <template>` | Template to use (default: "default") |
| `-d, --display-name <name>` | Display name shown in title bar |
| `-i, --identifier <id>` | App identifier (e.g., com.company.app) |
| `-y, --yes` | Skip prompts and use defaults/provided values |

## What's included

- Tauri v2 + React 19 desktop application
- TypeScript configuration
- TailwindCSS v4 styling
- i18n internationalization
- SQLite database support
- Auto-updater integration
- Pre-configured development environment

## After creating

```bash
cd my-app
pnpm install
pnpm tauri:dev
```

## License

MIT
