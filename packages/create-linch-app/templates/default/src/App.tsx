import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  LinchDesktopProvider,
  Shell,
  useUpdater,
} from '@linch-tech/desktop-core';
import { config } from './config';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';

function AppContent() {
  const { check } = useUpdater();

  // Check for updates on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      check().catch(console.error);
    }, 2000);
    return () => clearTimeout(timer);
  }, [check]);

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <LinchDesktopProvider config={config}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LinchDesktopProvider>
  );
}
