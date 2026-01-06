import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Demo() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader 
        title={t("app.demo")} 
        description={t("app.demo_desc")}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        <div className="flex flex-col items-center gap-6 p-8 border rounded-2xl bg-card shadow-sm w-full max-w-sm">
          <div className="text-8xl font-mono font-bold tracking-tighter text-primary">
            {count}
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={() => setCount(c => c - 1)}
            >
              <Minus className="h-6 w-6" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={() => setCount(0)}
              disabled={count === 0}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={() => setCount(c => c + 1)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}