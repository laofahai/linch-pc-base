import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// 读取 package.json 获取版本号
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  define: {
    // 注入版本号到代码中
    '__CORE_VERSION__': JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**/*'],
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LinchDesktopCore',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router-dom',
        // i18n must be external to avoid "two instances" problem
        'i18next',
        'react-i18next',
        'i18next-browser-languagedetector',
        // Tauri plugins are external - apps install them directly
        '@tauri-apps/api',
        '@tauri-apps/plugin-dialog',
        '@tauri-apps/plugin-opener',
        '@tauri-apps/plugin-process',
        '@tauri-apps/plugin-shell',
        '@tauri-apps/plugin-sql',
        '@tauri-apps/plugin-updater',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
