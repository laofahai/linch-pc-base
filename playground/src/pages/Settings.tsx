import { SettingsPage } from '@linch-tech/desktop-core';

export function Settings() {
  return (
    <SettingsPage
      footer={(
        <div className="text-xs text-muted-foreground pt-8 text-center max-w-sm">
          <p>© 2026 Linch Tech. All rights reserved.</p>
          <p>Built with Tauri v2 & React 19.</p>
        </div>
      )}
    />
  );
}
