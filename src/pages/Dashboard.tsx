import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { appConfig } from "@/config/app";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("app.name")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("app.description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🚀 {t("app.getting_started")}</h2>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm font-mono">
              <p className="text-muted-foreground"># Create a new project</p>
              <div className="bg-background border rounded p-2 select-text">
                pnpm detach
              </div>
              <p className="text-muted-foreground mt-2"># Start development</p>
              <div className="bg-background border rounded p-2 select-text">
                pnpm tauri dev
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">✨ {t("app.features")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
              <li><strong className="text-foreground">Tauri v2</strong> - Custom Frameless Window & Drag Region</li>
              <li><strong className="text-foreground">React 19 + Vite 7</strong> - Latest Frontend Stack</li>
              <li><strong className="text-foreground">Shadcn UI</strong> - Beautiful & Accessible Components</li>
              <li><strong className="text-foreground">i18n</strong> - Built-in Multi-language Support</li>
              <li><strong className="text-foreground">Config Driven</strong> - Customize via <code className="bg-muted px-1 rounded">src/config/app.tsx</code></li>
              <li><strong className="text-foreground">Smart CLI</strong> - Auto-rename & Port Assignment</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Current Version: <span className="font-mono text-foreground">{appConfig.brand.version}</span>
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}