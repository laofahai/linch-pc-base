/// <reference types="vite/client" />

declare global {
  interface Window {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  }

  interface ImportMetaEnv {
    readonly VITE_SENTRY_DSN?: string;
  }
}

export {};
