import { useState, useEffect } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { Button } from "../ui/button";
import * as tauri from "../../lib/tauri";

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
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

    checkMaximized();

    const handleResize = () => {
      checkMaximized();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  return (
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
  );
}

// Export the toggle maximize function for use in TitleBar
export { tauri };
