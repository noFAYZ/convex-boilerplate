"use client";

import { memo, useMemo, useCallback } from "react";
import { useToastStore, type Toast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ToastItemProps {
  item: Toast;
}

const ToastItem = memo(function ToastItem({ item }: ToastItemProps) {
  const getIcon = useCallback(() => {
    const iconClass = "h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0";
    const iconContent = {
      success: { bg: "bg-green-500", text: "✓" },
      error: { bg: "bg-red-500", text: "!" },
      info: { bg: "bg-blue-500", text: "i" },
    };

    if (item.type === "loading") {
      return <HugeiconsIcon icon={Loading01Icon} className="h-5 w-5 animate-spin shrink-0" />;
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
    switch (item.type) {
      case "success":
        return "bg-card border-green-500/20";
      case "error":
        return "bg-card border-red-500/20";
      case "loading":
        return "bg-card border-blue-500/20";
      case "info":
        return "bg-card border-blue-500/20";
    }
  };

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-5 fade-in-0 duration-300 p-4 rounded-xl border shadow-xl flex gap-3 w-full",
        getBgColor()
      )}
    >
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-card-foreground">{item.title}</div>
        {item.description && (
          <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
        )}

        {item.progress !== undefined && (
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>

      {item.type !== "loading" && (
        <button
          onClick={() => toast.dismiss(item.id)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

ToastItem.displayName = "ToastItem";

export const Toaster = memo(function Toaster() {
  const toasts = useToastStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none w-full px-4 max-w-md">
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <ToastItem item={item} />
        </div>
      ))}
    </div>
  );
});

Toaster.displayName = "Toaster";
