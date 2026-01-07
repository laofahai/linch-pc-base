import { useTranslation } from 'react-i18next';
import { PageHeader, ScrollArea } from '@linch-tech/desktop-core';

export function Dashboard() {
  const { t } = useTranslation();

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <PageHeader
          title={t('app.welcome')}
          description={t('app.description')}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">快速开始</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              编辑 src/config.ts 自定义你的应用配置
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium">添加页面</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              在 src/pages 目录创建新页面组件
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium">文档</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              查看 Linch Desktop Core 文档了解更多
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
