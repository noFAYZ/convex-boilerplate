"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserPlus, UserMinus, UserCheck, ShieldCheck, FileText } from "lucide-react";

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
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    if (action.includes("invited")) return UserPlus;
    if (action.includes("joined")) return UserCheck;
    if (action.includes("removed") || action.includes("left")) return UserMinus;
    if (action.includes("role")) return ShieldCheck;
    return FileText;
  };

  const getActionColor = (action: string) => {
    if (action.includes("invited")) return "text-blue-500 bg-blue-500/10";
    if (action.includes("joined")) return "text-emerald-500 bg-emerald-500/10";
    if (action.includes("removed") || action.includes("left")) return "text-rose-500 bg-rose-500/10";
    if (action.includes("role")) return "text-violet-500 bg-violet-500/10";
    return "text-muted-foreground bg-muted";
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
    <div className="space-y-2">
      {activity.map((log) => {
        const Icon = getActionIcon(log.action);
        const colorClass = getActionColor(log.action);
        const [iconColor, iconBg] = colorClass.split(" ");

        return (
          <div
            key={log._id}
            className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
          >
            <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
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
              <p className="text-xs text-muted-foreground mt-1">
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
