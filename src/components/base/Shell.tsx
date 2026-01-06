import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, User } from "lucide-react";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TitleBar } from "./TitleBar";

export function Shell() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background border border-border">
      <TitleBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
            className="flex flex-col border-r bg-muted/5 transition-all duration-300 ease-in-out"
            style={{ width: appConfig.layout.sidebarWidth }}
        >
          <div className="flex-1 py-2 overflow-y-auto overflow-x-hidden no-scrollbar">
            <nav className="flex flex-col gap-1 px-2">
              {appConfig.navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 truncate">{t(item.title)}</span>
                  {item.badge && item.badge > 0 ? (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-5 min-w-5 justify-center">
                      {item.badge}
                    </Badge>
                  ) : null}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Footer Area: User & Settings */}
          <div className="border-t p-2">
             <div className="flex items-center gap-1">
                {/* User Profile Trigger */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex-1 h-9 px-2 justify-start gap-2 overflow-hidden hover:bg-muted group">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0 text-white shadow-sm ring-1 ring-white/20">
                          <User className="h-3 w-3" />
                      </div>
                      <span className="truncate text-xs font-medium opacity-80 group-hover:opacity-100">{t("common.user")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48" side="right" sideOffset={10}>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{t("common.menu.account")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>{t("common.menu.profile")}</DropdownMenuItem>
                      <DropdownMenuItem>{t("common.menu.billing")}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>{t("common.menu.logout")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/settings')}
                  title={t("app.settings")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden bg-background relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
