import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { ask } from '@tauri-apps/plugin-dialog';

// ============================================================================
// Types
// ============================================================================

export interface UpdateInfo {
  available: boolean;
  version?: string;
  currentVersion?: string;
  body?: string;
  date?: string;
}

export interface UpdateProgress {
  downloaded: number;
  total: number;
  percent: number;
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error'
  | 'up-to-date';

// ============================================================================
// Update Service
// ============================================================================

let currentUpdate: Update | null = null;

/**
 * Check for updates
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  try {
    const update = await check();

    if (update) {
      currentUpdate = update;
      return {
        available: true,
        version: update.version,
        currentVersion: update.currentVersion,
        body: update.body || undefined,
        date: update.date || undefined,
      };
    }

    return { available: false };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    throw error;
  }
}

/**
 * Download and install update
 */
export async function downloadAndInstall(
  onProgress?: (progress: UpdateProgress) => void
): Promise<void> {
  if (!currentUpdate) {
    throw new Error('No update available. Call checkForUpdate first.');
  }

  let downloaded = 0;
  let total = 0;

  await currentUpdate.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        total = event.data.contentLength || 0;
        onProgress?.({ downloaded: 0, total, percent: 0 });
        break;
      case 'Progress':
        downloaded += event.data.chunkLength;
        const percent = total > 0 ? Math.round((downloaded / total) * 100) : 0;
        onProgress?.({ downloaded, total, percent });
        break;
      case 'Finished':
        onProgress?.({ downloaded: total, total, percent: 100 });
        break;
    }
  });
}

/**
 * Relaunch the application after update
 */
export async function relaunchApp(): Promise<void> {
  await relaunch();
}

/**
 * Check for updates and prompt user
 * Convenience function for common use case
 */
export async function checkAndPromptUpdate(options?: {
  silent?: boolean;
  autoDownload?: boolean;
  onProgress?: (progress: UpdateProgress) => void;
}): Promise<UpdateInfo> {
  const { silent = false, autoDownload = false, onProgress } = options || {};

  const updateInfo = await checkForUpdate();

  if (!updateInfo.available) {
    return updateInfo;
  }

  if (autoDownload) {
    await downloadAndInstall(onProgress);

    const shouldRelaunch = await ask(
      `Update ${updateInfo.version} has been downloaded. Restart now?`,
      { title: 'Update Ready', kind: 'info' }
    );

    if (shouldRelaunch) {
      await relaunchApp();
    }
  } else if (!silent) {
    const shouldUpdate = await ask(
      `A new version (${updateInfo.version}) is available.\n\n${updateInfo.body || 'Would you like to update now?'}`,
      { title: 'Update Available', kind: 'info' }
    );

    if (shouldUpdate) {
      await downloadAndInstall(onProgress);

      const shouldRelaunch = await ask(
        'Update downloaded. Restart now to apply?',
        { title: 'Update Ready', kind: 'info' }
      );

      if (shouldRelaunch) {
        await relaunchApp();
      }
    }
  }

  return updateInfo;
}

/**
 * Get current update if available
 */
export function getCurrentUpdate(): Update | null {
  return currentUpdate;
}

/**
 * Clear current update reference
 */
export function clearUpdate(): void {
  currentUpdate = null;
}
