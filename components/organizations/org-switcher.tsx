"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOrganization } from "./org-context";
import { normalizeImageUrl } from "@/lib/normalize-image-url";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown, Plus } from "@hugeicons/core-free-icons";

export function OrgSwitcher() {
  const { currentOrganization, organizations, setCurrentOrganization, setIsOrgSwitching, isLoading } =
    useOrganization();

  if (isLoading) {
    return (
      <div className="h-10 px-3 py-2 rounded-lg" style={{ backgroundColor: `color-mix(in srgb, var(--sidebar-accent) 50%, transparent)` }}>
        <div className="text-xs text-sidebar-foreground">Loading...</div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <Button variant="outline" size="sm" asChild className="w-full">
        <Link href="/settings/organization" className="flex items-center gap-2">
          <HugeiconsIcon icon={Plus} className="h-4 w-4" />
          Create Workspace
        </Link>
      </Button>
    );
  }

  return (
    <Select
      value={currentOrganization?._id}
      onValueChange={(orgId) => {
        const org = organizations.find((o) => o._id === orgId);
        if (org && org._id !== currentOrganization?._id) {
          setIsOrgSwitching(true);
          setCurrentOrganization(org);
        }
      }}
    >
      <SelectTrigger
        className="w-full h-10  px-2 py-2 rounded border transition-all hover:bg-background"
        style={{
          borderColor: `var(--sidebar-border)`,
         
 
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {currentOrganization?.logo ? (
            <img
              src={normalizeImageUrl(currentOrganization.logo) || ""}
              alt=""
              className="w-5 h-5 rounded object-cover"
            />
          ) : (
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: `var(--secondary)` }}
            >
              {currentOrganization?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <SelectValue className="truncate text-sm font-medium">
            <span className="truncate">{currentOrganization?.name}</span>
          </SelectValue>
        </div>
       
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs">Workspaces</SelectLabel>
          {organizations.map((org) => (
            <SelectItem key={org._id} value={org._id}>
              <div className="flex items-center gap-2">
                {org.logo ? (
                  <img
                    src={normalizeImageUrl(org.logo) || ""}
                    alt=""
                    className="w-4 h-4 rounded object-cover"
                  />
                ) : (
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: `var(--secondary)` }}
                  >
                    {org.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{org.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
