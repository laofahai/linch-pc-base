import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Minus, Square, X, Maximize2, Languages, Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as tauri from "@/lib/tauri";
import { appConfig } from "@/config/app";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function TitleBar() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    // Initial check
    const checkMaximized = async () => {
      try {
        if ((window as any).__TAURI__) {
            const maximized = await tauri.isMaximized();
            setIsMaximized(maximized);
        }
      } catch (e) {
        console.error("Failed to check maximized state:", e);
      }
    };
    
    // Check focus
    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    checkMaximized();
    
    const handleResize = () => {
        checkMaximized();
    };
    window.addEventListener("resize", handleResize);

    return () => {
        window.removeEventListener("focus", onFocus);
        window.removeEventListener("blur", onBlur);
        window.removeEventListener("resize", handleResize);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleMinimize = async () => {
    try {
      await tauri.minimizeWindow();
    } catch (e) {
      console.error("Failed to minimize:", e);
    }
  };

  const handleToggleMaximize = async () => {
    try {
      await tauri.toggleMaximize();
      const maximized = await tauri.isMaximized();
      setIsMaximized(maximized);
    } catch (e) {
      console.error("Failed to toggle maximize:", e);
    }
  };

  const handleClose = async () => {
    try {
      await tauri.closeWindow();
    } catch (e) {
      console.error("Failed to close:", e);
    }
  };

  const handleMouseDown = async (e: React.MouseEvent) => {
    // No-op for dragging, handled by data-tauri-drag-region
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

      {/* Right: Window Controls */}
      <div className="flex items-center gap-0.5">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-muted focus-visible:ring-0 group">
              <Languages className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeLanguage('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('zh')}>
              中文
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-muted focus-visible:ring-0 group">
              {theme === 'light' && <Sun className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />}
              {theme === 'dark' && <Moon className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />}
              {theme === 'system' && <Laptop className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-3.5 w-3.5" />
              {t("settings.theme_light")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-3.5 w-3.5" />
              {t("settings.theme_dark")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Laptop className="mr-2 h-3.5 w-3.5" />
              {t("settings.theme_system")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-3 w-px bg-border/40 mx-1" />

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none hover:bg-muted group"
            onClick={handleMinimize}
          >
            <Minus className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none hover:bg-muted group"
            onClick={handleToggleMaximize}
          >
            {isMaximized ? (
              <Square className="h-2.5 w-2.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            ) : (
              <Maximize2 className="h-2.5 w-2.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none hover:bg-destructive/10 hover:text-destructive group"
            onClick={handleClose}
          >
            <X className="h-3 w-3 text-muted-foreground/60 group-hover:text-destructive transition-colors" />
          </Button>
        </div>
      </div>
    </header>
  );
}