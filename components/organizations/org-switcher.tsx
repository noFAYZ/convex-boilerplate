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

export function OrgSwitcher() {
  const { currentOrganization, organizations, setCurrentOrganization, isLoading } =
    useOrganization();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (organizations.length === 0) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/settings/organization">Create Organization</Link>
      </Button>
    );
  }

  return (
    <Select
      value={currentOrganization?._id}
      onValueChange={(orgId) => {
        const org = organizations.find((o) => o._id === orgId);
        if (org) {
          setCurrentOrganization(org);
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select organization">
          {currentOrganization?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Organizations</SelectLabel>
          {organizations.map((org) => (
            <SelectItem key={org._id} value={org._id}>
              <div className="flex items-center gap-2">
                {org.logo && (
                  <img
                    src={org.logo}
                    alt=""
                    className="w-4 h-4 rounded object-cover"
                  />
                )}
                {org.name}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
