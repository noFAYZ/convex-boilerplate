"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  UserAdd01Icon,
  UserMinus01Icon,
  UserCheck01Icon,
  SecurityCheckIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";

interface ActivityFeedProps {
  organizationId?: Id<"organizations">;
  limit?: number;
}

export function ActivityFeed({ organizationId, limit = 20 }: ActivityFeedProps) {
  const activity = useQuery(
    organizationId
      ? api.activity.list
      : api.activity.getRecent,
    organizationId ? { organizationId, limit } : { limit }
  );

  if (activity === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="text-center py-14">
        <HugeiconsIcon icon={File01Icon} className="h-6 w-6 text-muted-foreground/25 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  const getActionIcon = (action: string): IconSvgElement => {
    if (action.includes("invited")) return UserAdd01Icon;
    if (action.includes("joined")) return UserCheck01Icon;
    if (action.includes("removed") || action.includes("left")) return UserMinus01Icon;
    if (action.includes("role")) return SecurityCheckIcon;
    return File01Icon;
  };

  const getActionText = (
    action: string,
    metadata: Record<string, string | undefined> | undefined
  ) => {
    switch (action) {
      case "member.invited":
        return `invited ${metadata?.email ?? "someone"} as ${metadata?.role ?? "member"}`;
      case "member.joined":
        return `joined as ${metadata?.role ?? "member"}`;
      case "member.removed":
        return `removed ${metadata?.targetUserEmail ?? "a member"}`;
      case "member.left":
        return "left the organization";
      case "member.role_updated":
        return `changed role from ${metadata?.oldRole ?? "?"} to ${metadata?.newRole ?? "?"}`;
      default:
        return action.replace(".", " ");
    }
  };

  return (
    <div className="space-y-0.5">
      {activity.map((log) => {
        const actionIcon = getActionIcon(log.action);

        return (
          <div
            key={log._id}
            className="flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors"
          >
            <div className="p-1.5 rounded-md bg-muted shrink-0 mt-0.5">
              <HugeiconsIcon icon={actionIcon} className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px]">
                <span className="font-medium">{log.user?.name ?? "Someone"}</span>{" "}
                <span className="text-muted-foreground">
                  {getActionText(log.action, log.metadata as Record<string, string | undefined> | undefined)}
                </span>
                {!organizationId && "organization" in log && log.organization && (
                  <span className="text-muted-foreground">
                    {" "}in <span className="font-medium text-foreground">{(log.organization as { name: string }).name}</span>
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(log.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
