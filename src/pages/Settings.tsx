import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { appConfig } from "@/config/app";
import { Moon, Sun, Laptop, Settings as SettingsIcon, Info, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "about";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    // Simulate check
    setTimeout(() => {
        setCheckingUpdate(false);
    }, 2000);
  };

  return (
    <div className="flex h-full flex-col bg-background">
       <PageHeader 
         title={t("settings.title")} 
         // description is optional, removing it makes it even cleaner if desired, but let's keep it for now
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
                    activeTab === 'general' ? "bg-primary/5 text-primary font-semibold" : "text-muted-foreground"
                )}
                onClick={() => setActiveTab('general')}
             >
                <SettingsIcon className="h-4 w-4" />
                {t("settings.tabs.general")}
             </Button>
             <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start gap-2",
                    activeTab === 'about' ? "bg-primary/5 text-primary font-semibold" : "text-muted-foreground"
                )}
                onClick={() => setActiveTab('about')}
             >
                <Info className="h-4 w-4" />
                {t("settings.tabs.about")}
             </Button>
          </aside>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
             
             {/* General Tab */}
             {activeTab === 'general' && (
                <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">{t("settings.appearance")}</h3>
                        <div className="grid grid-cols-1 gap-4">
                        {/* Language */}
                        <div className="rounded-lg border p-4 bg-card text-card-foreground shadow-sm flex items-center justify-between">
                            <div className="text-sm font-medium">{t("settings.language_select")}</div>
                            <div className="flex gap-2">
                                <Button 
                                variant={i18n.language.startsWith('en') ? "default" : "outline"} 
                                size="sm"
                                onClick={() => changeLanguage('en')}
                                >
                                English
                                </Button>
                                <Button 
                                variant={i18n.language.startsWith('zh') ? "default" : "outline"} 
                                size="sm"
                                onClick={() => changeLanguage('zh')}
                                >
                                中文
                                </Button>
                            </div>
                        </div>

                        {/* Theme */}
                        <div className="rounded-lg border p-4 bg-card text-card-foreground shadow-sm">
                            <div className="mb-3 text-sm font-medium">{t("settings.theme_select")}</div>
                            <div className="grid grid-cols-3 gap-2">
                                <Button 
                                variant={theme === 'light' ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setTheme('light')}
                                className="gap-2"
                                >
                                <Sun className="h-4 w-4" />
                                {t("settings.theme_light")}
                                </Button>
                                <Button 
                                variant={theme === 'dark' ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setTheme('dark')}
                                className="gap-2"
                                >
                                <Moon className="h-4 w-4" />
                                {t("settings.theme_dark")}
                                </Button>
                                <Button 
                                variant={theme === 'system' ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setTheme('system')}
                                className="gap-2"
                                >
                                <Laptop className="h-4 w-4" />
                                {t("settings.theme_system")}
                                </Button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
             )}

             {/* About Tab */}
             {activeTab === 'about' && (
                 <div className="flex flex-col items-center justify-center space-y-6 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <appConfig.brand.logo className="h-24 w-24 text-primary" />
                     <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold">{t(appConfig.brand.nameKey)}</h2>
                        <p className="text-muted-foreground">
                            {t("settings.about.current_version")}: <span className="font-mono text-foreground">{appConfig.brand.version}</span>
                        </p>
                     </div>

                     <Button 
                        onClick={handleCheckUpdate} 
                        disabled={checkingUpdate}
                        className="w-48"
                     >
                        {checkingUpdate ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                {t("settings.about.checking")}
                            </>
                        ) : (
                            t("settings.about.check_updates")
                        )}
                     </Button>
                     
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
