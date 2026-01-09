# @linch-tech/desktop-core

## 0.1.8

### Patch Changes

- fix: 移除 TitleBar 重复的双击最大化处理

  修复双击标题栏时触发两次最大化切换的问题。
  原因是 `data-tauri-drag-region` 已经会自动处理双击最大化，
  不需要额外的 `onDoubleClick` 事件处理。

## 0.1.7

### Patch Changes

- [`b985a3d`](https://github.com/laofahai/linch-pc-base/commit/b985a3d4d54b7f9fa9d77b45b1a56e1d4546c7fd) Thanks [@laofahai](https://github.com/laofahai)! - fix: add repository url and system dependencies for releases

## 0.1.6

### Patch Changes

- [`5c65fb9`](https://github.com/laofahai/linch-pc-base/commit/5c65fb96a0032fe4dfb86299c931b1b6ae77136b) Thanks [@laofahai](https://github.com/laofahai)! - fix: CI/CD workflow improvements and Rust formatting

## 0.1.5

### Patch Changes

- [`de8a20e`](https://github.com/laofahai/linch-pc-base/commit/de8a20ee5595c737c201713b3f088fc535da660e) Thanks [@laofahai](https://github.com/laofahai)! - Test automated release workflow
