import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Shell } from "@/components/base/Shell";
import { DatabaseProvider } from "@/components/providers/DatabaseProvider";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Demo from "@/pages/Demo";

function App() {
  return (
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
  );
}

export default App;
