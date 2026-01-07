/// <reference types="vite/client" />

declare global {
  interface Window {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  }

  interface ImportMetaEnv {
    readonly VITE_SENTRY_DSN?: string;
    readonly VITE_API_BASE_URL?: string;
  }
}

declare const __CORE_VERSION__: string;

export {};
