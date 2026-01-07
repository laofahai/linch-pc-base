import { useState, useCallback } from 'react';
import {
  checkForUpdate,
  downloadAndInstall,
  relaunchApp,
  type UpdateInfo,
  type UpdateProgress,
  type UpdateStatus,
} from '../lib/updater';

interface UseUpdaterReturn {
  enabled: boolean;
  status: UpdateStatus;
  updateInfo: UpdateInfo | null;
  progress: UpdateProgress | null;
  error: Error | null;
  check: () => Promise<UpdateInfo>;
  download: () => Promise<void>;
  install: () => Promise<void>;
}

export function useUpdater(options: { enabled?: boolean } = {}): UseUpdaterReturn {
  const enabled = options.enabled !== false;
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const check = useCallback(async () => {
    if (!enabled) {
      const disabledError = new Error('Updater is disabled');
      setError(disabledError);
      throw disabledError;
    }

    setStatus('checking');
    setError(null);

    try {
      const info = await checkForUpdate();
      setUpdateInfo(info);
      setStatus(info.available ? 'available' : 'up-to-date');
      return info;
    } catch (err) {
      const e = err as Error;
      setError(e);
      setStatus('check-error');
      throw e;
    }
  }, [enabled]);

  const download = useCallback(async () => {
    if (!enabled) {
      const disabledError = new Error('Updater is disabled');
      setError(disabledError);
      throw disabledError;
    }

    if (!updateInfo?.available) {
      throw new Error('No update available');
    }

    setStatus('downloading');
    setError(null);
    setProgress({ downloaded: 0, total: 0, percent: 0 });

    try {
      await downloadAndInstall((p) => {
        setProgress(p);
      });
      setStatus('ready');
    } catch (err) {
      const e = err as Error;
      setError(e);
      setStatus('download-error');
      throw e;
    }
  }, [enabled, updateInfo]);

  const install = useCallback(async () => {
    if (!enabled) {
      const disabledError = new Error('Updater is disabled');
      setError(disabledError);
      throw disabledError;
    }

    await relaunchApp();
  }, [enabled]);

  return {
    enabled,
    status,
    updateInfo,
    progress,
    error,
    check,
    download,
    install,
  };
}
