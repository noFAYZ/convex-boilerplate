"use client";

import { useOrganization } from "@/components/organizations/org-context";
import { SvgSpinnersTadpole } from "../icons/icons";

export function GlobalLoadingOverlay() {
  const { isOrgSwitching } = useOrganization();

  if (!isOrgSwitching) return null;

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
      <SvgSpinnersTadpole  className="w-10 h-10 animate-spin text-primary"  />
        <p className="text-sm text-muted-foreground">Switching organization...</p>
      </div>
    </div>
  );
}
