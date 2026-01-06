import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";
import * as tauri from "@/lib/tauri";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { WindowControls } from "@/components/shared/WindowControls";

export function TitleBar() {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const handleToggleMaximize = async () => {
    try {
      await tauri.toggleMaximize();
    } catch (e) {
      console.error("Failed to toggle maximize:", e);
    }
  };

  return (
    <header
      className={cn(
        "flex h-10 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-3 select-none transition-colors z-50",
        !isFocused && "opacity-80 bg-background/50"
      )}
      onDoubleClick={handleToggleMaximize}
      data-tauri-drag-region
    >
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-2 pointer-events-none">
        <appConfig.brand.logo className="h-4 w-4" />
        <span className="text-xs font-semibold text-foreground/90 tracking-tight">
          {t(appConfig.brand.nameKey)}
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-0.5">
        <LanguageSwitcher />
        <ThemeSwitcher />

        <div className="h-3 w-px bg-border/40 mx-1" />

        <WindowControls />
      </div>
    </header>
  );
}
