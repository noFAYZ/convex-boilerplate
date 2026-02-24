"use client";

import { useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  Activity01Icon,
  UserGroupIcon,
  LogoutCircleIcon,
} from "@hugeicons/core-free-icons";

const NOTIFICATION_TYPE_ICONS = {
  member_invited: UserAdd01Icon,
  member_joined: UserGroupIcon,
  role_changed: Activity01Icon,
  member_removed: LogoutCircleIcon,
};

const NOTIFICATION_COLORS = {
  member_invited: "text-blue-500",
  member_joined: "text-green-500",
  role_changed: "text-amber-500",
  member_removed: "text-red-500",
};

function formatTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = useQuery(api.notifications.list, { limit: 20 });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  const handleMarkRead = useCallback(
    async (notificationId: Id<"notifications">) => {
      try {
        await markRead({ notificationId });
      } catch (err) {
        handleMutationError(err);
      }
    },
    [markRead]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      handleMutationSuccess("All notifications marked as read");
    } catch (err) {
      handleMutationError(err);
    }
  }, [markAllRead]);

  if (!notifications) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <HugeiconsIcon
              icon={Activity01Icon}
              className="h-10 w-10 text-muted-foreground/40 mb-3"
            />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification: any) => {
              const Icon =
                NOTIFICATION_TYPE_ICONS[
                  notification.type as keyof typeof NOTIFICATION_TYPE_ICONS
                ];
              const color =
                NOTIFICATION_COLORS[
                  notification.type as keyof typeof NOTIFICATION_COLORS
                ];

              return (
                <div
                  key={notification._id}
                  className={cn(
                    "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.read && "bg-muted/30"
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkRead(notification._id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className={cn("mt-1 flex-shrink-0", color)}>
                      <HugeiconsIcon icon={Icon} className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Utils
import { cn } from "@/lib/utils";
