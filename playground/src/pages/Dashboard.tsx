import { useTranslation } from 'react-i18next';
import { PageHeader } from '@linch-tech/desktop-core';

export function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full overflow-auto">
      <PageHeader
        title={t('app.dashboard')}
        description="Welcome to Linch Desktop Core Playground"
      />

      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Desktop Core"
            description="This playground demonstrates the @linch-tech/desktop-core package"
          />
          <Card
            title="Configuration"
            description="All UI is configured via the config object in src/config.ts"
          />
          <Card
            title="Customization"
            description="Supports themes, slots, component overrides, and more"
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm mt-2">{description}</p>
    </div>
  );
}
