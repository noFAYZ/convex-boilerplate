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

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

interface ActivityLog {
  _id: string;
  timestamp: number;
  action: string;
  user?: { id?: string; name?: string; email?: string; image?: string } | null;
  organization?: { id?: string; name?: string } | null;
  metadata?: Record<string, string | undefined>;
}

interface GroupedActivity {
  date: string;
  activities: ActivityLog[];
}

interface ActivityTimelineProps {
  organizationId?: Id<"organizations">;
  limit?: number;
}

type ActionType = "invite" | "join" | "remove" | "role" | "profile" | "default";

interface ActivityIconConfig {
  icon: IconSvgElement;
  type: ActionType;
}

const ACTIVITY_TYPE_COLORS: Record<ActionType, string> = {
  invite: "bg-blue-500",
  join: "bg-green-600",
  remove: "bg-red-600",
  role: "bg-amber-500",
  profile: "bg-pink-500",
  default: "bg-gray-500",
};

const getActivityIcon = (action: string): ActivityIconConfig => {
  if (action.includes("invited")) {
    return { icon: UserAdd01Icon, type: "invite" };
  }
  if (action.includes("joined")) {
    return { icon: UserCheck01Icon, type: "join" };
  }
  if (action.includes("removed") || action.includes("left")) {
    return { icon: UserMinus01Icon, type: "remove" };
  }
  if (action.includes("role")) {
    return { icon: SecurityCheckIcon, type: "role" };
  }
  if (action.includes("avatar") || action.includes("profile")) {
    return { icon: CameraIcon, type: "profile" };
  }
  return { icon: File01Icon, type: "default" };
};

const getActionText = (
  action: string,
  metadata: Record<string, string | undefined> | undefined
): string => {
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
    case "avatar_updated":
      return "updated their avatar";
    case "profile_updated":
      return "updated their profile";
    default:
      return action.replace(/[_.]/g, " ");
  }
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-6 w-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin mb-3" />
      <p className="text-sm text-muted-foreground">Loading activity...</p>
    </div>
  );
}

function EmptyState({ organizationId }: { organizationId?: Id<"organizations"> }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
        <HugeiconsIcon icon={File01Icon} className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-foreground">No activity yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {organizationId
          ? "Activity will appear here as your team collaborates"
          : "Start using the app to see activity"}
      </p>
    </div>
  );
}

function ActivityCard({
  log,
  isLast,
  type,
  icon,
  showOrganization,
}: {
  log: ActivityLog;
  isLast: boolean;
  type: ActionType;
  icon: IconSvgElement;
  showOrganization: boolean;
}) {
  const timestamp = new Date(log.timestamp);
  const initials =
    log.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  const bgColor = ACTIVITY_TYPE_COLORS[type];

  return (
    <div className="relative pl-8">
      {/* Timeline connector line */}
      {!isLast && <div className="absolute left-3 top-6 h-10 w-px bg-border" />}

      {/* Timeline dot with avatar or initials */}
      <div className="absolute -left-1 top-1.5 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background">
        {log.user?.image ? (
          <img
            src={normalizeImageUrl(log.user.image) || ""}
            alt={log.user?.name || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-xs font-semibold text-white ${bgColor}`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Activity content */}
      <div className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-muted/30">
        <div className="space-y-2 p-3">
          {/* Action text */}
          <p className="text-sm leading-snug text-foreground">
            <span className="font-medium">{log.user?.name ?? "Someone"}</span>
            {" "}
            <span className="text-muted-foreground">
              {getActionText(log.action, log.metadata)}
            </span>
          </p>

          {/* Organization context (if applicable) */}
          {showOrganization && log.organization && (
            <p className="text-xs text-muted-foreground">
              in <span className="font-medium text-foreground">{log.organization.name}</span>
            </p>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <time dateTime={new Date(log.timestamp).toISOString()}>
              {formatTime(timestamp)}
            </time>
            <span className="text-border">·</span>
            <span>{formatRelativeTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ActivityTimeline = memo(function ActivityTimeline({
  organizationId,
  limit = 50,
}: ActivityTimelineProps) {
  const activity = useQuery(
    organizationId ? api.activity.list : api.activity.getRecent,
    organizationId ? { organizationId, limit } : { limit }
  );

  const groupedActivities = useMemo(() => {
    if (!activity?.length) return [];

    return activity.reduce((acc: GroupedActivity[], log) => {
      const date = new Date(log.timestamp);
      const dateKey = formatDate(date);

      const existing = acc.find((g) => g.date === dateKey);
      if (existing) {
        existing.activities.push(log as ActivityLog);
      } else {
        acc.push({ date: dateKey, activities: [log as ActivityLog] });
      }
      return acc;
    }, []);
  }, [activity]);

  if (activity === undefined) {
    return <LoadingState />;
  }

  if (activity.length === 0) {
    return <EmptyState organizationId={organizationId} />;
  }

  return (
    <div className="space-y-8">
      {groupedActivities.map((group, groupIndex) => (
        <div key={group.date}>
          {/* Date separator */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <time className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.date}
            </time>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Activities list */}
          <div className="space-y-0">
            {group.activities.map((log, index) => {
              const { icon, type } = getActivityIcon(log.action);
              const isLast =
                index === group.activities.length - 1 &&
                groupIndex === groupedActivities.length - 1;

              return (
                <ActivityCard
                  key={log._id}
                  log={log}
                  isLast={isLast}
                  type={type}
                  icon={icon}
                  showOrganization={!organizationId}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

ActivityTimeline.displayName = "ActivityTimeline";
