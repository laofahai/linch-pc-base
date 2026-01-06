import { useTranslation } from "react-i18next";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, Theme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  variant?: "icon" | "full";
  size?: "sm" | "default";
  className?: string;
}

const themes: { value: Theme; labelKey: string; icon: typeof Sun }[] = [
  { value: 'light', labelKey: 'settings.theme_light', icon: Sun },
  { value: 'dark', labelKey: 'settings.theme_dark', icon: Moon },
  { value: 'system', labelKey: 'settings.theme_system', icon: Laptop },
];

export function ThemeSwitcher({
  variant = "icon",
  size = "default",
  className,
}: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  if (variant === "full") {
    return (
      <div className={cn("grid grid-cols-3 gap-2", className)}>
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <Button
              key={themeOption.value}
              variant={theme === themeOption.value ? "default" : "outline"}
              size={size}
              onClick={() => setTheme(themeOption.value)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {t(themeOption.labelKey)}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-none hover:bg-muted focus-visible:ring-0 group",
            className
          )}
        >
          <CurrentIcon className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                theme === themeOption.value && "bg-accent"
              )}
            >
              <Icon className="mr-2 h-3.5 w-3.5" />
              {t(themeOption.labelKey)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
