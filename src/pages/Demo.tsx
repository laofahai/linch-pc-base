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

    </div>
  );
}
