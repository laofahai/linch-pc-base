import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  Button,
  useAppState,
} from '@linch-tech/desktop-core';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export function Demo() {
  const { t } = useTranslation();
  const [localCount, setLocalCount] = useState(0);
  const { state: dbCount, setState: setDbCount, isLoading } = useAppState<number>('demo_counter', 0);

  return (
    <div className="flex flex-col h-full overflow-auto">
      <PageHeader
        title={t('app.demo')}
        description="Interactive demo of core features"
      />

      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Local State Counter */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Local State Counter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              State is stored in React useState (lost on refresh)
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLocalCount((c) => c - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-3xl font-bold w-16 text-center">
                {localCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLocalCount((c) => c + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocalCount(0)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Database State Counter */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Database State Counter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              State is persisted to SQLite (survives restart)
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDbCount((dbCount ?? 0) - 1)}
                disabled={isLoading}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-3xl font-bold w-16 text-center">
                {isLoading ? '...' : dbCount ?? 0}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDbCount((dbCount ?? 0) + 1)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDbCount(0)}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
