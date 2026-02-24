"use client";

import { useOrganization } from "@/components/organizations/org-context";
import { SvgSpinnersGooeyBalls1 } from "../icons/icons";

export function GlobalLoadingOverlay() {
  const { isOrgSwitching } = useOrganization();

  if (!isOrgSwitching) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in">
      <div className="flex flex-col items-center gap-4 rounded border bg-card/80 px-8 py-6 shadow-xl backdrop-blur">
        
        {/* Spinner */}
        <div className="flex items-center justify-center">
          <SvgSpinnersGooeyBalls1 className="h-12 w-12 text-primary" />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Switching organization
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please wait a moment...
          </p>
        </div>
      </div>
    </div>
  );
}