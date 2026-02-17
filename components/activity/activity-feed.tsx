"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity yet
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    if (action.includes("invited")) return "📧";
    if (action.includes("joined")) return "👋";
    if (action.includes("removed") || action.includes("left")) return "👋";
    if (action.includes("role")) return "👤";
    if (action.includes("updated")) return "✏️";
    return "📝";
  };

  const getActionText = (action: string, metadata: Record<string, string | undefined> | undefined) => {
    switch (action) {
      case "member.invited":
        return `invited ${metadata?.email} as ${metadata?.role}`;
      case "member.joined":
        return `joined as ${metadata?.role}`;
      case "member.removed":
        return `removed ${metadata?.targetUserEmail}`;
      case "member.left":
        return "left the organization";
      case "member.role_updated":
        return `changed role from ${metadata?.oldRole} to ${metadata?.newRole}`;
      default:
        return action;
    }
  };

  return (
    <div className="space-y-4">
      {activity.map((log) => (
        <div
          key={log._id}
          className="flex gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-shrink-0 text-2xl">{getActionIcon(log.action)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{log.user?.name || "Someone"}</span>{" "}
              {getActionText(log.action, log.metadata)}
              {!organizationId && log.organization && (
                <span className="text-muted-foreground">
                  {" "}
                  in {log.organization.name}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
