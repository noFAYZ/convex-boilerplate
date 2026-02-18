"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { normalizeImageUrl } from "@/lib/normalize-image-url";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  UserAdd01Icon,
  UserMinus01Icon,
  UserCheck01Icon,
  SecurityCheckIcon,
  File01Icon,
  CameraIcon,
} from "@hugeicons/core-free-icons";
import { memo, useMemo } from "react";
// Format relative time without external dependencies
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

interface ActivityTimelineProps {
  organizationId?: Id<"organizations">;
  limit?: number;
}

interface GroupedActivity {
  date: string;
  activities: Array<any>;
}

export const ActivityTimeline = memo(function ActivityTimeline({ organizationId, limit = 50 }: ActivityTimelineProps) {
  const activity = useQuery(
    organizationId ? api.activity.list : api.activity.getRecent,
    organizationId ? { organizationId, limit } : { limit }
  );

  // Memoize grouped activities to avoid recalculation on every render
  const groupedActivities = useMemo(() => {
    if (!activity?.length) return [];

  if (activity === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading activity...</p>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <HugeiconsIcon icon={File01Icon} className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          {organizationId ? "Activity will appear here as your team collaborates" : "Start using the app to see activity"}
        </p>
      </div>
    );
  }

    return activity.reduce((acc: GroupedActivity[], log) => {
      const date = new Date(log.timestamp);
      const dateKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const existing = acc.find((g) => g.date === dateKey);
      if (existing) {
        existing.activities.push(log);
      } else {
        acc.push({ date: dateKey, activities: [log] });
      }
      return acc;
    }, []);
  }, [activity]);

  const getActivityIcon = (action: string): { icon: IconSvgElement; color: string } => {
    if (action.includes("invited")) return { icon: UserAdd01Icon, color: "text-blue-500" };
    if (action.includes("joined")) return { icon: UserCheck01Icon, color: "text-green-500" };
    if (action.includes("removed") || action.includes("left")) return { icon: UserMinus01Icon, color: "text-red-500" };
    if (action.includes("role")) return { icon: SecurityCheckIcon, color: "text-amber-500" };
    if (action.includes("avatar") || action.includes("profile")) return { icon: CameraIcon, color: "text-purple-500" };
    return { icon: File01Icon, color: "text-gray-500" };
  };

  const getActionText = (action: string, metadata: Record<string, string | undefined> | undefined) => {
    switch (action) {
      case "member.invited":
        return `invited ${metadata?.email ?? "someone"} as <span class="font-medium">${metadata?.role ?? "member"}</span>`;
      case "member.joined":
        return `joined as <span class="font-medium">${metadata?.role ?? "member"}</span>`;
      case "member.removed":
        return `removed <span class="font-medium">${metadata?.targetUserEmail ?? "a member"}</span>`;
      case "member.left":
        return "left the organization";
      case "member.role_updated":
        return `changed role from <span class="font-medium">${metadata?.oldRole ?? "?"}</span> to <span class="font-medium">${metadata?.newRole ?? "?"}</span>`;
      case "avatar_updated":
        return "updated their avatar";
      case "profile_updated":
        return "updated their profile";
      default:
        return action.replace(/[_.]/g, " ");
    }
  };

  return (
    <div className="space-y-8">
      {groupedActivities.map((group, groupIndex) => (
        <div key={group.date}>
          {/* Date Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
              {group.date}
            </p>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Activities */}
          <div className="space-y-0">
            {group.activities.map((log, index) => {
              const { icon, color } = getActivityIcon(log.action);
              const timestamp = new Date(log.timestamp);
              const isLast = index === group.activities.length - 1 && groupIndex === groupedActivities.length - 1;

              return (
                <div key={log._id} className="relative pl-8">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-3 top-6 w-px h-10 bg-border" />
                  )}

                  {/* Timeline dot - Profile picture or initials */}
                  <div className="absolute -left-1 top-1.5 w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-background">
                    {log.user?.image ? (
                      <img
                        src={normalizeImageUrl(log.user.image) || ""}
                        alt={log.user?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-xs font-semibold text-white ${color} bg-muted`}>
                        {log.user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  {/* Activity card */}
                  <div className="group bg-card border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          <span>{log.user?.name ?? "Someone"}</span>
                          {" "}
                          <span
                            className="text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: getActionText(log.action, log.metadata as Record<string, string | undefined>) }}
                          />
                        </p>
                        {!organizationId && "organization" in log && log.organization && (
                          <p className="text-xs text-muted-foreground mt-1">
                            in <span className="font-medium">{(log.organization as { name: string }).name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {timestamp.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      {" — "}
                      {formatRelativeTime(timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

ActivityTimeline.displayName = "ActivityTimeline";
