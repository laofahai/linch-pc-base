import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../../context/config';
import { cn } from '../../lib/utils';
import { logger } from '../../lib/logger';
import * as tauri from '../../lib/tauri';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { ThemeSwitcher } from '../shared/ThemeSwitcher';
import { WindowControls } from '../shared/WindowControls';
import { Logo } from '../shared/Logo';
import type { TitleBarProps } from '../../types';

/**
 * Application title bar with window controls
 */
export function TitleBar({ className }: TitleBarProps) {
  const { t } = useTranslation();
  const config = useConfig();
  const [isFocused, setIsFocused] = useState(true);

  const { brand, layout, slots } = config;
  const titleBarConfig = layout?.titleBar;

  useEffect(() => {
    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const handleToggleMaximize = async () => {
    if (!titleBarConfig?.draggable) return;
    try {
      await tauri.toggleMaximize();
    } catch (e) {
      logger.error('Failed to toggle maximize', { error: e });
    }
  };

  // Get logo component
  const LogoComponent = brand.logo ?? Logo;

  return (
    <header
      className={cn(
        'flex h-10 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-3 select-none transition-colors z-50',
        !isFocused && 'opacity-80 bg-background/50',
        className
      )}
      style={{
        height: titleBarConfig?.height ?? 40,
      }}
      onDoubleClick={handleToggleMaximize}
      data-tauri-drag-region={titleBarConfig?.draggable !== false}
    >
      {/* Left Slot or Default: Logo & Title */}
      <div className="flex items-center gap-2 pointer-events-none">
        {slots?.titleBar?.left ?? (
          <>
            <LogoComponent className="h-4 w-4" />
            <span className="text-xs font-semibold text-foreground/90 tracking-tight">
              {t(brand.name)}
            </span>
          </>
        )}
      </div>

      {/* Center Slot */}
      {slots?.titleBar?.center && (
        <div className="flex-1 flex items-center justify-center pointer-events-auto">
          {slots.titleBar.center}
        </div>
      )}

      {/* Right Slot or Default: Controls */}
      <div className="flex items-center gap-0.5">
        {slots?.titleBar?.right ?? (
          <>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </>
        )}

        {titleBarConfig?.showWindowControls !== false && (
          <>
            <div className="h-3 w-px bg-border/40 mx-1" />
            <WindowControls />
          </>
        )}
      </div>
    </header>
  );
}
