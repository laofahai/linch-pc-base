import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Shell } from "@/components/base/Shell";
import { DatabaseProvider } from "@/components/providers/DatabaseProvider";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { checkAndPromptUpdate } from "@/lib/updater";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Demo from "@/pages/Demo";

function App() {
  useEffect(() => {
    // Check for updates on startup (only in Tauri environment)
    if (window.__TAURI_INTERNALS__) {
      const timer = setTimeout(() => {
        checkAndPromptUpdate({ silent: false }).catch((err) => {
          // Silently ignore update check errors on startup
          console.debug('Update check failed:', err);
        });
      }, 2000); // Delay 2s to not block startup

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Shell />}>
              <Route index element={<Dashboard />} />
              <Route path="demo" element={<Demo />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}

export default App;
