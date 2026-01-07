import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
import "./i18n/config";
import { initSentry } from "./lib/sentry";

// Initialize Sentry before anything else
initSentry();

// Disable context menu and shortcuts in production
if (!import.meta.env.DEV) {
  document.body.classList.add('production-mode');

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.metaKey && e.altKey && e.key === 'I')
    ) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });
}

// Fallback error UI
function FallbackComponent({ error }: { error: unknown }) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  return (
    <div className="p-4 text-red-500">
      <h1>Something went wrong.</h1>
      <pre>{errorMessage}</pre>
      {import.meta.env.DEV && errorStack && <pre>{errorStack}</pre>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
