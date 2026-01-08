import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock functions
const mockCheck = vi.fn();
const mockRelaunch = vi.fn();
const mockAsk = vi.fn();
const mockDownloadAndInstall = vi.fn();

// Mock Tauri plugins
vi.mock('@tauri-apps/plugin-updater', () => ({
  check: (...args: unknown[]) => mockCheck(...args),
}));

vi.mock('@tauri-apps/plugin-process', () => ({
  relaunch: (...args: unknown[]) => mockRelaunch(...args),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  ask: (...args: unknown[]) => mockAsk(...args),
}));

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Updater', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('checkForUpdate', () => {
    it('should return update info when update is available', async () => {
      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        body: 'New features',
        date: '2024-01-01',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkForUpdate } = await import('./updater');
      const result = await checkForUpdate();

      expect(result).toEqual({
        available: true,
        version: '2.0.0',
        currentVersion: '1.0.0',
        body: 'New features',
        date: '2024-01-01',
      });
    });

    it('should return not available when no update', async () => {
      mockCheck.mockResolvedValue(null);

      const { checkForUpdate } = await import('./updater');
      const result = await checkForUpdate();

      expect(result).toEqual({ available: false });
    });

    it('should handle undefined body and date', async () => {
      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        body: null,
        date: null,
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkForUpdate } = await import('./updater');
      const result = await checkForUpdate();

      expect(result.body).toBeUndefined();
      expect(result.date).toBeUndefined();
    });

    it('should throw and log error on failure', async () => {
      const error = new Error('Network error');
      mockCheck.mockRejectedValue(error);

      const { checkForUpdate } = await import('./updater');

      await expect(checkForUpdate()).rejects.toThrow('Network error');
    });
  });

  describe('downloadAndInstall', () => {
    it('should throw if no update available', async () => {
      const { downloadAndInstall } = await import('./updater');

      await expect(downloadAndInstall()).rejects.toThrow(
        'No update available. Call checkForUpdate first.'
      );
    });

    it('should download and install update', async () => {
      mockDownloadAndInstall.mockImplementation((callback: (event: unknown) => void) => {
        callback({ event: 'Started', data: { contentLength: 1000 } });
        callback({ event: 'Progress', data: { chunkLength: 500 } });
        callback({ event: 'Progress', data: { chunkLength: 500 } });
        callback({ event: 'Finished', data: {} });
        return Promise.resolve();
      });

      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkForUpdate, downloadAndInstall } = await import('./updater');
      await checkForUpdate();

      const onProgress = vi.fn();
      await downloadAndInstall(onProgress);

      expect(onProgress).toHaveBeenCalledWith({ downloaded: 0, total: 1000, percent: 0 });
      expect(onProgress).toHaveBeenCalledWith({ downloaded: 500, total: 1000, percent: 50 });
      expect(onProgress).toHaveBeenCalledWith({ downloaded: 1000, total: 1000, percent: 100 });
    });

    it('should handle zero content length', async () => {
      mockDownloadAndInstall.mockImplementation((callback: (event: unknown) => void) => {
        callback({ event: 'Started', data: { contentLength: 0 } });
        callback({ event: 'Progress', data: { chunkLength: 100 } });
        callback({ event: 'Finished', data: {} });
        return Promise.resolve();
      });

      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkForUpdate, downloadAndInstall } = await import('./updater');
      await checkForUpdate();

      const onProgress = vi.fn();
      await downloadAndInstall(onProgress);

      // Percent should be 0 when total is 0
      expect(onProgress).toHaveBeenCalledWith({ downloaded: 100, total: 0, percent: 0 });
    });
  });

  describe('relaunchApp', () => {
    it('should call relaunch', async () => {
      mockRelaunch.mockResolvedValue(undefined);

      const { relaunchApp } = await import('./updater');
      await relaunchApp();

      expect(mockRelaunch).toHaveBeenCalled();
    });
  });

  describe('checkAndPromptUpdate', () => {
    it('should return update info when no update available', async () => {
      mockCheck.mockResolvedValue(null);

      const { checkAndPromptUpdate } = await import('./updater');
      const result = await checkAndPromptUpdate();

      expect(result).toEqual({ available: false });
      expect(mockAsk).not.toHaveBeenCalled();
    });

    it('should not prompt in silent mode', async () => {
      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkAndPromptUpdate } = await import('./updater');
      const result = await checkAndPromptUpdate({ silent: true });

      expect(result.available).toBe(true);
      expect(mockAsk).not.toHaveBeenCalled();
    });

    it('should auto download when autoDownload is true', async () => {
      mockDownloadAndInstall.mockImplementation((callback: (event: unknown) => void) => {
        callback({ event: 'Finished', data: {} });
        return Promise.resolve();
      });
      mockAsk.mockResolvedValue(false); // Don't relaunch

      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkAndPromptUpdate } = await import('./updater');
      await checkAndPromptUpdate({ autoDownload: true });

      expect(mockDownloadAndInstall).toHaveBeenCalled();
      expect(mockAsk).toHaveBeenCalledWith(
        expect.stringContaining('has been downloaded'),
        expect.any(Object)
      );
    });

    it('should prompt for update when not silent', async () => {
      mockAsk.mockResolvedValue(false); // User declines

      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        body: 'New features',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkAndPromptUpdate } = await import('./updater');
      await checkAndPromptUpdate();

      expect(mockAsk).toHaveBeenCalledWith(
        expect.stringContaining('2.0.0'),
        expect.objectContaining({ title: 'Update Available' })
      );
    });

    it('should download and prompt for relaunch when user accepts', async () => {
      mockDownloadAndInstall.mockImplementation((callback: (event: unknown) => void) => {
        callback({ event: 'Finished', data: {} });
        return Promise.resolve();
      });
      mockAsk
        .mockResolvedValueOnce(true) // Accept update
        .mockResolvedValueOnce(false); // Don't relaunch

      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkAndPromptUpdate } = await import('./updater');
      await checkAndPromptUpdate();

      expect(mockDownloadAndInstall).toHaveBeenCalled();
      expect(mockAsk).toHaveBeenCalledTimes(2);
    });

    it('should relaunch when user accepts after download', async () => {
      mockDownloadAndInstall.mockImplementation((callback: (event: unknown) => void) => {
        callback({ event: 'Finished', data: {} });
        return Promise.resolve();
      });
      mockAsk
        .mockResolvedValueOnce(true) // Accept update
        .mockResolvedValueOnce(true); // Accept relaunch
      mockRelaunch.mockResolvedValue(undefined);

      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkAndPromptUpdate } = await import('./updater');
      await checkAndPromptUpdate();

      expect(mockRelaunch).toHaveBeenCalled();
    });
  });

  describe('getCurrentUpdate', () => {
    it('should return null when no update checked', async () => {
      const { getCurrentUpdate } = await import('./updater');

      expect(getCurrentUpdate()).toBeNull();
    });

    it('should return update after check', async () => {
      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkForUpdate, getCurrentUpdate } = await import('./updater');
      await checkForUpdate();

      expect(getCurrentUpdate()).toBe(mockUpdate);
    });
  });

  describe('clearUpdate', () => {
    it('should clear the current update', async () => {
      const mockUpdate = {
        version: '2.0.0',
        currentVersion: '1.0.0',
        downloadAndInstall: mockDownloadAndInstall,
      };
      mockCheck.mockResolvedValue(mockUpdate);

      const { checkForUpdate, getCurrentUpdate, clearUpdate } = await import('./updater');
      await checkForUpdate();

      expect(getCurrentUpdate()).toBe(mockUpdate);

      clearUpdate();

      expect(getCurrentUpdate()).toBeNull();
    });
  });
});
