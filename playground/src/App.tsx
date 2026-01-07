import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  LinchDesktopProvider,
  Shell,
  useUpdater,
} from '@linch-tech/desktop-core';
import { config } from './config';
import { Dashboard } from './pages/Dashboard';
import { Demo } from './pages/Demo';
import { Settings } from './pages/Settings';
import { useEffect } from 'react';

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
        <Route path="/demo" element={<Demo />} />
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
