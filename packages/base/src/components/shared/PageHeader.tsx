import { cn } from "../../lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // Right side actions
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex h-12 shrink-0 items-center justify-between border-b bg-background px-6", className)}>
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description && (
          <div className="flex items-center gap-4">
            <div className="h-4 w-px bg-border" />
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
              {description}
            </p>
          </div>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
