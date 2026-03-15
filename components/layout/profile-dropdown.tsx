"use client";

import { memo, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LogoutCircleIcon,
  SettingsIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export const ProfileDropdown = memo(function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = useQuery(api.users.getCurrent);
  const { signOut } = useAuthActions();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!currentUser) return null;

  const userInitials = currentUser.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size={'icon-md'}
        variant={'ghost'}
        className={cn(
          "  rounded-full flex items-center justify-center text-xs font-semibold    ",
          currentUser.image
            ? "border border-border/50"
            : "bg-gradient-to-br from-primary/60 to-primary text-white"
        )}
        title={currentUser.name || "Profile"}
      >
        {currentUser.image ? (
          <img
            src={currentUser.image}
            alt={currentUser.name || "User"}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          userInitials
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border/50 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header with user info */}
          <div className="px-4 py-3 border-b border-border/30 bg-muted/30">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                  currentUser.image
                    ? "border border-border/50"
                    : "bg-gradient-to-br from-primary/60 to-primary text-white"
                )}
              >
                {currentUser.image ? (
                  <img
                    src={currentUser.image}
                    alt={currentUser.name || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {currentUser.name || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link href="/settings/profile" onClick={() => setIsOpen(false)}>
              <button className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer">
                <HugeiconsIcon icon={SettingsIcon} className="h-4 w-4 flex-shrink-0" />
                <span>Settings</span>
              </button>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Sign Out */}
          <button
            onClick={() => {
              setIsOpen(false);
              void signOut();
            }}
            className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={LogoutCircleIcon} className="h-4 w-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
});

ProfileDropdown.displayName = "ProfileDropdown";
