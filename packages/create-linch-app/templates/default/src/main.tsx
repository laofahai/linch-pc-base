import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '@linch-tech/desktop-core';
import App from './App';
import { config } from './config';
import './index.css';

// 在 React 渲染前初始化 i18n
initI18n(config.i18n?.defaultLanguage, config.i18n?.resources);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
