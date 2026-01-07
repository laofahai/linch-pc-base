/**
 * 基座版本检查工具
 * 在开发模式下检测 @linch-tech/desktop-core 是否有新版本
 */

// 当前包版本，构建时注入
export const CORE_VERSION = __CORE_VERSION__;

interface NpmPackageInfo {
  'dist-tags': {
    latest: string;
  };
  versions: Record<string, unknown>;
}

interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  updateType: 'major' | 'minor' | 'patch' | null;
}

/**
 * 检查 npm 包最新版本
 */
async function fetchLatestVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmmirror.com/${packageName}`);
    if (!response.ok) return null;
    const data = (await response.json()) as NpmPackageInfo;
    return data['dist-tags']?.latest ?? null;
  } catch {
    return null;
  }
}

/**
 * 比较版本号
 */
function compareVersions(current: string, latest: string): VersionCheckResult['updateType'] {
  const [cMajor, cMinor, cPatch] = current.split('.').map(Number);
  const [lMajor, lMinor, lPatch] = latest.split('.').map(Number);

  if (lMajor > cMajor) return 'major';
  if (lMinor > cMinor) return 'minor';
  if (lPatch > cPatch) return 'patch';
  return null;
}

/**
 * 检查基座更新
 */
export async function checkCoreUpdate(): Promise<VersionCheckResult | null> {
  // 跳过构建时的占位符版本
  if (CORE_VERSION === '__CORE_VERSION__') {
    return null;
  }

  const latestVersion = await fetchLatestVersion('@linch-tech/desktop-core');
  if (!latestVersion) return null;

  const updateType = compareVersions(CORE_VERSION, latestVersion);

  return {
    currentVersion: CORE_VERSION,
    latestVersion,
    hasUpdate: updateType !== null,
    updateType,
  };
}

/**
 * 在开发模式下输出更新提示
 */
export async function logUpdateNotice(): Promise<void> {
  // 只在开发模式下检查
  if (typeof import.meta.env === 'undefined' || !import.meta.env?.DEV) {
    return;
  }

  const result = await checkCoreUpdate();
  if (!result?.hasUpdate) return;

  const styles = {
    major: 'color: #ef4444; font-weight: bold',
    minor: 'color: #f59e0b; font-weight: bold',
    patch: 'color: #3b82f6',
  };

  const messages = {
    major: '🚨 Major update available! Please review breaking changes before upgrading.',
    minor: '✨ New features available!',
    patch: '🔧 Bug fixes available.',
  };

  console.log(
    `%c[Linch Desktop Core] Update available: ${result.currentVersion} → ${result.latestVersion}`,
    styles[result.updateType!]
  );
  console.log(`%c${messages[result.updateType!]}`, 'color: #6b7280');
  console.log('%cRun: pnpm update @linch-tech/desktop-core', 'color: #6b7280');
}
