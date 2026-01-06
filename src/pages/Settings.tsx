import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import {
  Settings as SettingsIcon,
  Info,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { useUpdater } from "@/hooks/use-updater";

type SettingsTab = "general" | "about";

export default function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const { status, updateInfo, progress, error, check, download, install } =
    useUpdater();

  const handleCheckUpdate = async () => {
    try {
      await check();
    } catch (err) {
      console.error("Update check failed:", err);
    }
  };

  const handleDownload = async () => {
    try {
      await download();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const renderUpdateButton = () => {
    switch (status) {
      case "checking":
        return (
          <Button disabled className="w-56">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            {t("settings.about.checking")}
          </Button>
        );

      case "available":
        return (
          <div className="space-y-2 text-center">
            <div className="text-sm text-primary font-medium">
              {t("settings.about.new_version")}: {updateInfo?.version}
            </div>
            <Button onClick={handleDownload} className="w-56">
              <Download className="mr-2 h-4 w-4" />
              {t("settings.about.download_update")}
            </Button>
          </div>
        );

      case "downloading":
        return (
          <div className="space-y-2 w-56">
            <Button disabled className="w-full">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {progress?.percent || 0}%
            </Button>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress?.percent || 0}%` }}
              />
            </div>
          </div>
        );

      case "ready":
        return (
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {t("settings.about.ready_to_install")}
            </div>
            <Button onClick={install} className="w-56">
              {t("settings.about.restart_now")}
            </Button>
          </div>
        );

      case "up-to-date":
        return (
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {t("settings.about.up_to_date")}
            </div>
            <Button variant="outline" onClick={handleCheckUpdate} className="w-56">
              {t("settings.about.check_updates")}
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error?.message || t("settings.about.update_error")}
            </div>
            <Button variant="outline" onClick={handleCheckUpdate} className="w-56">
              {t("settings.about.retry")}
            </Button>
          </div>
        );

      default:
        return (
          <Button onClick={handleCheckUpdate} className="w-56">
            {t("settings.about.check_updates")}
          </Button>
        );
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation for Settings */}
        <aside
          className="border-r bg-background p-2 space-y-1"
          style={{ width: appConfig.layout.settingsSidebarWidth }}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              activeTab === "general"
                ? "bg-primary/5 text-primary font-semibold"
                : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("general")}
          >
            <SettingsIcon className="h-4 w-4" />
            {t("settings.tabs.general")}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              activeTab === "about"
                ? "bg-primary/5 text-primary font-semibold"
                : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("about")}
          >
            <Info className="h-4 w-4" />
            {t("settings.tabs.about")}
          </Button>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  {t("settings.appearance")}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Language */}
                  <div className="rounded-lg border p-4 bg-card text-card-foreground shadow-sm flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {t("settings.language_select")}
                    </div>
                    <LanguageSwitcher variant="full" size="sm" />
                  </div>

                  {/* Theme */}
                  <div className="rounded-lg border p-4 bg-card text-card-foreground shadow-sm">
                    <div className="mb-3 text-sm font-medium">
                      {t("settings.theme_select")}
                    </div>
                    <ThemeSwitcher variant="full" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="flex flex-col items-center justify-center space-y-6 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <appConfig.brand.logo className="h-24 w-24 text-primary" />
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">
                  {t(appConfig.brand.nameKey)}
                </h2>
                <p className="text-muted-foreground">
                  {t("settings.about.current_version")}:{" "}
                  <span className="font-mono text-foreground">
                    {appConfig.brand.version}
                  </span>
                </p>
              </div>

              {renderUpdateButton()}

              <div className="text-xs text-muted-foreground pt-8 text-center max-w-sm">
                <p>© 2026 Linch Tech. All rights reserved.</p>
                <p>Built with Tauri v2 & React 19.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
