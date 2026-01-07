import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";

interface LanguageSwitcherProps {
  variant?: "icon" | "full";
  size?: "sm" | "default";
  className?: string;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
] as const;

export function LanguageSwitcher({
  variant = "icon",
  size = "default",
  className,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = languages.find(
    (l) => i18n.language.startsWith(l.code)
  );

  if (variant === "full") {
    return (
      <div className={cn("flex gap-2", className)}>
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language.startsWith(lang.code) ? "default" : "outline"}
            size={size}
            onClick={() => changeLanguage(lang.code)}
          >
            {lang.label}
          </Button>
        ))}
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
          <Languages className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              currentLanguage?.code === lang.code && "bg-accent"
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
