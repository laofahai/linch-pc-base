import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return <Brain className={cn("text-blue-600 dark:text-blue-400", className)} />;
}
