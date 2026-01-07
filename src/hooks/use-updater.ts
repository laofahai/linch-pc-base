import { useState, useCallback } from 'react';
import {
  checkForUpdate,
  downloadAndInstall,
  relaunchApp,
  type UpdateInfo,
  type UpdateProgress,
  type UpdateStatus,
} from '@/lib/updater';

interface UseUpdaterReturn {
  status: UpdateStatus;
  updateInfo: UpdateInfo | null;
  progress: UpdateProgress | null;
  error: Error | null;
  check: () => Promise<UpdateInfo>;
  download: () => Promise<void>;
  install: () => Promise<void>;
}

export function useUpdater(): UseUpdaterReturn {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const check = useCallback(async () => {
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
  }, []);

  const download = useCallback(async () => {
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
  }, [updateInfo]);

  const install = useCallback(async () => {
    await relaunchApp();
  }, []);

  return {
    status,
    updateInfo,
    progress,
    error,
    check,
    download,
    install,
  };
}
