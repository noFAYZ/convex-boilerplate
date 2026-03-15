"use client";

import { memo, useCallback, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@/components/organizations/org-context";
import { normalizeImageUrl } from "@/lib/normalize-image-url";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  UserAdd01Icon,
  Plus,
  LogoutCircleIcon,
  Tick02Icon,
  FileIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ArrowDown, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";

export const HeaderOrgSwitcher = memo(function HeaderOrgSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = useQuery(api.users.getCurrent);
  const { signOut } = useAuthActions();
  const {
    currentOrganization,
    organizations,
    setCurrentOrganization,
    setIsOrgSwitching,
    isLoading,
  } = useOrganization();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleOrgChange = useCallback(
    (orgId: string) => {
      const org = organizations.find((o) => o._id === orgId);
      if (org && org._id !== currentOrganization?._id) {
        setIsOrgSwitching(true);
        setCurrentOrganization(org);
        setIsOpen(false);
      }
    },
    [organizations, currentOrganization?._id, setCurrentOrganization, setIsOrgSwitching]
  );

  if (isLoading) {
    return (
      <div className="h-8 px-3 rounded-md flex items-center text-xs text-foreground">
        Loading...
      </div>
    );
  }

  if (organizations.length === 0 || !currentOrganization) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={'ghost'}
        className="flex items-center gap-2 px-2 rounded-xs hover:bg-muted transition-colors cursor-pointer "
      >
        {currentOrganization.logo ? (
          <img
            src={normalizeImageUrl(currentOrganization.logo) || ""}
            alt=""
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          
          >
            {currentOrganization.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium truncate hidden sm:inline">
          {currentOrganization.name}
        </span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-sm">
  

          {/* Current Organization - Enhanced */}
          <div className="px-4 py-2 bg-gradient-to-br from-muted to-accent/60 border-y border-border">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow border border-border",
                  !currentOrganization.logo && "bg-gradient-to-br from-primary/70 to-primary"
                )}
              >
                {currentOrganization.logo ? (
                  <img
                    src={normalizeImageUrl(currentOrganization.logo) || ""}
                    alt=""
                    className="w-full h-full rounded-md object-cover"
                  />
                ) : (
                  currentOrganization.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {currentOrganization.name}
                </div>
                <div className="text-xs text-muted-foreground  ">Admin • 1 Member</div>
              </div>
              <div className="flex-shrink-0 bg-primary/30 rounded-full p-1.5">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="h-4 w-4 text-orange-800"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Enhanced */}
          <div className="px-3 py-2 flex gap-2 ">
            <Link href="/settings/organization" className="flex-1">
              <Button
                onClick={() => setIsOpen(false)}
                variant={'outline'}
                size={'sm'}
                className="w-full flex items-center justify-center rounded-sm"
              >
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </Link>
            <Link href="/settings/organization" className="flex-1">
              <Button
                onClick={() => setIsOpen(false)}
                 variant={'outline'}
                 size={'sm'}
                className="w-full flex items-center justify-center  rounded-sm "
              >
                <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4" />
                <span>Invite</span>
              </Button>
            </Link>
          </div>

          {/* Create Workspace & Invites */}
          <div className="px-2 py-1 border-b border-border space-y-1">
            <Link href="/settings/organization">
              <Button
                onClick={() => setIsOpen(false)}
             
                variant={'default'}
                size={'sm'}
               className="w-full flex text-left  items-center justify-center  rounded-sm "
              >
                <div className="flex-shrink-0 ">
                  <HugeiconsIcon icon={Plus} className="h-4 w-4" />
                </div>
                <span className="font-medium">Create workspace</span>
              </Button>
            </Link>
            {/* <Link href="/settings/organization">
              <Button
                onClick={() => setIsOpen(false)}
                variant={'ghost'}
                size={'sm'}
               className="w-full flex text-left  items-center justify-center  rounded-sm "
              >
                <div className="flex-shrink-0 text-primary">
                  <HugeiconsIcon icon={FileIcon} className="h-4 w-4" />
                </div>
                <span className="font-medium">Workspace invites</span>
              </Button>
            </Link> */}
          </div>

          {/* Other Workspaces */}
          {organizations.length > 1 && (
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-xs font-semibold text-muted-foreground px-1 py-1 ">
                Other Workspaces
              </p>
              <div className="space-y-1">
                {organizations.map((org) =>
                  org._id !== currentOrganization._id ? (
                    <Button
                      key={org._id}
                      onClick={() => handleOrgChange(org._id)}
                     size={'md'}
                      variant={'ghost'}
                    
                     className="w-full flex text-left  items-center justify-start  rounded-sm "
                    >
                      {org.logo ? (
                        <img
                          src={normalizeImageUrl(org.logo) || ""}
                          alt=""
                          className="w-5 h-5 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: `var(--secondary)` }}
                        >
                          {org.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{org.name}</span>
                    </Button>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Sign Out
          <Button
            onClick={() => {
              setIsOpen(false);
              void signOut();
            }}
            variant={'destructive'}
            className="w-full px-4 py-2.5 text-xs text-left flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors font-medium"
          >
            <HugeiconsIcon icon={LogoutCircleIcon} className="h-4 w-4 flex-shrink-0" />
            <span>Sign out</span>
          </Button> */}
        </div>
      )}
    </div>
  );
});

HeaderOrgSwitcher.displayName = "HeaderOrgSwitcher";
