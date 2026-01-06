# 应用更新配置指南

本文档介绍如何配置和使用 Linch Base 的自动更新功能。

## 概述

Linch Base 使用 Tauri 官方的 updater 插件实现自动更新，支持：
- **GitHub Releases**: 开源项目推荐
- **OSS 静态托管**: 闭源项目推荐 (阿里云 OSS / AWS S3 等)

## 更新流程

```
1. 开发者打 tag (如 v0.1.0)
2. GitHub Actions 自动构建多平台安装包
3. 签名并发布到 GitHub Releases
4. 客户端检查更新 (读取 latest.json)
5. 下载并安装更新
6. 重启应用
```

## 配置步骤

### 1. 生成签名密钥

```bash
pnpm tauri signer generate -w src-tauri/.keys/update.key --ci
```

输出：
- `update.key` - 私钥 (**不要提交到仓库!**)
- `update.key.pub` - 公钥 (需要配置到 tauri.conf.json)

### 2. 配置公钥

编辑 `src-tauri/tauri.conf.json`：

```json
{
  "plugins": {
    "updater": {
      "pubkey": "公钥内容",
      "endpoints": [
        "https://github.com/OWNER/REPO/releases/latest/download/latest.json"
      ]
    }
  }
}
```

### 3. 配置 GitHub Secrets

在仓库设置中添加以下 Secrets：

| Secret | 说明 |
|--------|------|
| `TAURI_SIGNING_PRIVATE_KEY` | 私钥文件内容 (cat src-tauri/.keys/update.key) |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 私钥密码 (如果设置了的话) |

### 4. 发布更新

```bash
# 更新版本号
# 编辑 package.json 和 src-tauri/tauri.conf.json 中的 version

# 提交并打 tag
git add .
git commit -m "chore: bump version to 0.2.0"
git tag v0.2.0
git push && git push --tags
```

## 更新源配置

### GitHub Releases (推荐)

```json
{
  "endpoints": [
    "https://github.com/owner/repo/releases/latest/download/latest.json"
  ]
}
```

### 私有 GitHub (需要 token)

```json
{
  "endpoints": [
    "https://api.github.com/repos/owner/repo/releases/latest"
  ],
  "headers": {
    "Authorization": "token YOUR_GITHUB_TOKEN"
  }
}
```

### OSS 静态托管

```json
{
  "endpoints": [
    "https://your-bucket.oss-cn-hangzhou.aliyuncs.com/updates/latest.json"
  ]
}
```

OSS 目录结构：
```
updates/
├── latest.json           # 版本信息
├── app_0.2.0_x64.msi     # Windows 安装包
├── app_0.2.0_x64.msi.sig # 签名文件
├── app_0.2.0_aarch64.dmg # macOS ARM
├── app_0.2.0_x64.dmg     # macOS Intel
└── app_0.2.0_amd64.AppImage # Linux
```

### 自建服务器

```json
{
  "endpoints": [
    "https://api.your-domain.com/updates/check?target={{target}}&arch={{arch}}&current_version={{current_version}}"
  ]
}
```

## latest.json 格式

Tauri Action 会自动生成，格式如下：

```json
{
  "version": "0.2.0",
  "notes": "更新说明",
  "pub_date": "2026-01-06T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "签名内容",
      "url": "https://github.com/.../app_0.2.0_x64-setup.exe"
    },
    "darwin-aarch64": {
      "signature": "签名内容",
      "url": "https://github.com/.../app_0.2.0_aarch64.dmg"
    },
    "darwin-x86_64": {
      "signature": "签名内容",
      "url": "https://github.com/.../app_0.2.0_x64.dmg"
    },
    "linux-x86_64": {
      "signature": "签名内容",
      "url": "https://github.com/.../app_0.2.0_amd64.AppImage"
    }
  }
}
```

## 前端使用

### 检查更新

```typescript
import { useUpdater } from '@/hooks/use-updater';

function MyComponent() {
  const { status, updateInfo, check, download, install } = useUpdater();

  const handleCheck = async () => {
    const info = await check();
    if (info.available) {
      console.log(`新版本: ${info.version}`);
    }
  };
}
```

### 自动检查

在应用启动时自动检查：

```typescript
import { checkAndPromptUpdate } from '@/lib/updater';

// 在 App.tsx 或适当位置
useEffect(() => {
  checkAndPromptUpdate({ silent: false });
}, []);
```

## Windows 代码签名 (可选)

### 使用 SignPath.io (开源免费)

1. 注册 [SignPath.io](https://signpath.io)
2. 创建项目和签名策略
3. 配置 GitHub Actions

取消 `.github/workflows/release.yml` 中 `sign-windows` job 的注释并配置：

```yaml
sign-windows:
  needs: release
  runs-on: windows-latest
  steps:
    - name: Sign with SignPath
      uses: signpath/github-action-submit-signing-request@v1
      with:
        api-token: ${{ secrets.SIGNPATH_API_TOKEN }}
        organization-id: ${{ secrets.SIGNPATH_ORGANIZATION_ID }}
        project-slug: 'your-project'
        signing-policy-slug: 'release-signing'
```

### 不签名

Windows 不签名也可以正常使用，用户首次安装时会看到 SmartScreen 警告，点击"仍要运行"即可。

## macOS 签名 (可选)

macOS 代码签名需要 Apple Developer 账号 ($99/年)。

不签名的情况下，用户需要：
1. 右键点击应用
2. 选择"打开"
3. 确认打开

## 故障排查

### 更新检查失败

1. 检查网络连接
2. 确认 endpoints URL 正确
3. 检查 latest.json 是否存在

### 签名验证失败

1. 确认公钥与私钥匹配
2. 检查私钥是否正确配置到 GitHub Secrets
3. 重新生成密钥对

### 下载失败

1. 检查安装包 URL 是否可访问
2. 确认文件大小和签名文件都存在

## 相关链接

- [Tauri Updater 文档](https://v2.tauri.app/plugin/updater/)
- [Tauri Action](https://github.com/tauri-apps/tauri-action)
- [SignPath.io](https://signpath.io)
