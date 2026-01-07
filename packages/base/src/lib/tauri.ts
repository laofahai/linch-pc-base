import { getCurrentWindow } from "@tauri-apps/api/window";

export const appWindow = getCurrentWindow();

export async function minimizeWindow() {
  await appWindow.minimize();
}

export async function toggleMaximize() {
  await appWindow.toggleMaximize();
}

export async function isMaximized() {
  return await appWindow.isMaximized();
}

export async function closeWindow() {
  await appWindow.close();
}

export async function startDragging() {
  await appWindow.startDragging();
}
