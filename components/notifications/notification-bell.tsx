"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, Bell } from "@hugeicons/core-free-icons";
import { NotificationPanel } from "./notification-panel";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = useQuery(api.notifications.getUnreadCount);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-xl"
        className={cn(
          "relative h-9 w-9 rounded  "
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <HugeiconsIcon icon={Bell} className="h-6 w-6" />

        {/* Unread badge */}
        {unreadCount !== undefined && unreadCount > 0 && (
          <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        )}
      </Button>

      {/* Notification panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full mt-2 w-96 max-h-96 bg-background border border-border/50 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col"
        >
          <NotificationPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
