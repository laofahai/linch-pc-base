import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LinchDesktopProvider, Shell } from '@linch-tech/desktop-core';
import { config } from './config';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <LinchDesktopProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LinchDesktopProvider>
  );
}
