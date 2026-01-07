import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app": {
        "name": "Linch Base",
        "description": "Production-ready Tauri v2 + React 19 desktop application base.",
        "dashboard": "Dashboard",
        "demo": "Demo",
        "demo_desc": "A simple interactive counter to demonstrate state management.",
        "demo_persist_hint": "State is persisted to localStorage via Zustand.",
        "demo_db_hint": "State is persisted to SQLite database.",
        "demo_notes_title": "Quick Notes (SQLite Demo)",
        "demo_notes_placeholder": "Write a note...",
        "demo_notes_empty": "No notes yet. Add one above!",
        "settings": "Settings",
        "getting_started": "Getting Started",
        "features": "Key Features"
      },
      "common": {
        "save": "Save",
        "cancel": "Cancel",
        "language": "Language",
        "theme": "Theme",
        "user": "Linch User",
        "menu": {
            "account": "My Account",
            "profile": "Profile",
            "billing": "Billing",
            "logout": "Log out"
        }
      },
      "settings": {
        "title": "Settings",
        "description": "Manage your application preferences.",
        "tabs": {
            "general": "General",
            "about": "About"
        },
        "general": "General",
        "appearance": "Appearance",
        "language_select": "Language",
        "theme_select": "Theme",
        "theme_light": "Light",
        "theme_dark": "Dark",
        "theme_system": "System",
        "about": {
            "check_updates": "Check for Updates",
            "checking": "Checking...",
            "up_to_date": "You're up to date",
            "current_version": "Current Version",
            "new_version": "New version available",
            "download_update": "Download Update",
            "ready_to_install": "Ready to install",
            "restart_now": "Restart Now",
            "check_error": "Update check failed",
            "download_error": "Download failed",
            "retry": "Retry"
        }
      }
    }
  },
  zh: {
    translation: {
      "app": {
        "name": "Linch 基座",
        "description": "生产级 Tauri v2 + React 19 桌面应用基座。",
        "dashboard": "仪表盘",
        "demo": "演示",
        "demo_desc": "一个简单的交互式计数器，用于演示状态管理。",
        "demo_persist_hint": "状态通过 Zustand 持久化到 localStorage。",
        "demo_db_hint": "状态持久化到 SQLite 数据库。",
        "demo_notes_title": "快捷笔记 (SQLite 示例)",
        "demo_notes_placeholder": "写点什么...",
        "demo_notes_empty": "暂无笔记，在上方添加一条吧！",
        "settings": "设置",
        "getting_started": "快速开始",
        "features": "核心特性"
      },
      "common": {
        "save": "保存",
        "cancel": "取消",
        "language": "语言",
        "theme": "主题",
        "user": "Linch 用户",
        "menu": {
            "account": "我的账户",
            "profile": "个人资料",
            "billing": "账单",
            "logout": "退出登录"
        }
      },
      "settings": {
        "title": "设置",
        "description": "管理您的应用偏好。",
        "tabs": {
            "general": "常规",
            "about": "关于"
        },
        "general": "常规",
        "appearance": "外观",
        "language_select": "语言",
        "theme_select": "主题",
        "theme_light": "浅色",
        "theme_dark": "深色",
        "theme_system": "跟随系统",
        "about": {
            "check_updates": "检查更新",
            "checking": "检查中...",
            "up_to_date": "当前已是最新版本",
            "current_version": "当前版本",
            "new_version": "发现新版本",
            "download_update": "下载更新",
            "ready_to_install": "已准备好安装",
            "restart_now": "立即重启",
            "check_error": "检查更新失败",
            "download_error": "下载失败",
            "retry": "重试"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;