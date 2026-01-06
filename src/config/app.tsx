import React from "react";
import { Inbox, Calculator } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface AppConfig {
  brand: {
    nameKey: string;
    logo: React.ComponentType<{ className?: string }>;
    version: string;
  };
  layout: {
    sidebarWidth: number;
    settingsSidebarWidth: number;
    defaultCollapsed: boolean;
  };
  navItems: NavItem[];
}

export const appConfig: AppConfig = {
  brand: {
    nameKey: "app.name",
    logo: Logo,
    version: "v0.1.0",
  },
  layout: {
    sidebarWidth: 180,
    settingsSidebarWidth: 180,
    defaultCollapsed: false,
  },
  navItems: [
    {
      title: "app.dashboard",
      path: "/",
      icon: Inbox,
    },
    {
      title: "app.demo",
      path: "/demo",
      icon: Calculator,
    },
  ],
};