"use client";

import { memo, useCallback } from "react";
import { useToastStore, type Toast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { SvgSpinnersTadpole } from "../icons/icons";

interface ToastItemProps {
  item: Toast;
}

const ToastItem = memo(function ToastItem({ item }: ToastItemProps) {
  const getIcon = useCallback(() => {
    const iconClass = "h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0";
    const iconContent = {
      success: { bg: "bg-green-700", text: "✓" },
      error: { bg: "bg-red-700", text: "!" },
      info: { bg: "bg-blue-700", text: "i" },
    };

    if (item.type === "loading") {
      return <SvgSpinnersTadpole className="h-5 w-5 animate-spin shrink-0 " />;
    }

    const config = iconContent[item.type as keyof typeof iconContent];
    if (!config) return null;

    return (
      <div className={cn(iconClass, config.bg)}>
        {config.text}
      </div>
    );
  }, [item.type]);

  const getBgColor = () => {
    return "bg-card";
  };

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-15 fade-in-0 duration-200 p-2 rounded-xl border shadow-xl flex gap-3 min-w-xs w-fit",
        getBgColor()
      )}
    >
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-card-foreground">{item.title}</div>
        {item.description && (
          <div className="text-xs text-muted-foreground  ">{item.description}</div>
        )}

        {item.progress !== undefined && (
          <div className="mt-2">
            <Progress value={item.progress} />
          </div>
        )}
      </div>

      {item.type !== "loading" && (
        <Button
          onClick={() => toast.dismiss(item.id)}
        
          aria-label="Close"
          size='icon-xs'
          variant='destructive'
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

ToastItem.displayName = "ToastItem";

export const Toaster = memo(function Toaster() {
  const toasts = useToastStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none w-full px-4 max-w-md mx-auto">
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <ToastItem item={item} />
        </div>
      ))}
    </div>
  );
});

Toaster.displayName = "Toaster";
