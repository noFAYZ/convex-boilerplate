"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { normalizeImageUrl } from "@/lib/normalize-image-url";
import {
  UserPlus,
  UserMinus,
  CheckCircle2,
  Shield,
  FileText,
  Camera,
  Send
} from "lucide-react";
import { memo, useMemo } from "react";
import { Card } from "../ui/card";

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
  organization?: { id?: string; name?: string; image?: string } | null;
  metadata?: Record<string, string | undefined>;
}

interface GroupedActivity {
  date: string;
  activities: ActivityLog[];
}

interface ActivityTimelineProps {
  organizationId: Id<"organizations">;
  limit?: number;
}

type ActionType = "invite" | "join" | "remove" | "role" | "profile" | "default";

interface ActivityIconConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: ActionType;
  bgColor: string;
  textColor: string;
}

const ACTIVITY_TYPE_CONFIG: Record<ActionType, { bg: string; text: string }> = {
  invite: { bg: "bg-blue-200 dark:bg-blue-950", text: "text-blue-800 dark:text-blue-400" },
  join: { bg: "bg-green-100 dark:bg-green-950", text: "text-green-600 dark:text-green-400" },
  remove: { bg: "bg-red-100 dark:bg-red-950", text: "text-red-600 dark:text-red-400" },
  role: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400" },
  profile: { bg: "bg-pink-100 dark:bg-pink-950", text: "text-pink-600 dark:text-pink-400" },
  default: { bg: "bg-gray-100 dark:bg-gray-950", text: "text-gray-600 dark:text-gray-400" },
};

const getActivityIcon = (action: string): ActivityIconConfig => {
  const getConfig = (
    type: ActionType,
    iconComponent: React.ComponentType<{ size?: number; className?: string }>
  ) => ({
    icon: iconComponent,
    type,
    bgColor: ACTIVITY_TYPE_CONFIG[type].bg,
    textColor: ACTIVITY_TYPE_CONFIG[type].text,
  });

  if (action.includes("invited")) {
    return getConfig("invite", Send);
  }
  if (action.includes("joined")) {
    return getConfig("join", CheckCircle2);
  }
  if (action.includes("removed") || action.includes("left")) {
    return getConfig("remove", UserMinus);
  }
  if (action.includes("role")) {
    return getConfig("role", Shield);
  }
  if (action.includes("avatar") || action.includes("profile")) {
    return getConfig("profile", Camera);
  }
  return getConfig("default", FileText);
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
        <FileText size={24} className="text-muted-foreground/50" />
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

function ActivityItem({
  log,
  icon: IconComponent,
  bgColor,
  textColor,
  isFirst,
  isLast,
}: {
  log: ActivityLog;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  bgColor: string;
  textColor: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const timestamp = new Date(log.timestamp);


  return (
    <div className="relative pb-6 last:pb-0 mx-auto">
      {/* Vertical timeline line - connects to next item */}
      {!isLast && (
        <div className="absolute left-4 top-10 h-[calc(100%+24px)] w-px bg-black/20" />
      )}

      <div className="group/item flex gap-4">
        {/* Timeline icon badge */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${bgColor} ring-3 ring-background relative z-10`}
        >
          <IconComponent size={18} className={textColor} />
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-sm text-foreground items-center flex gap-1 ">
                {/* User avatar + name */}
                <span className="inline-flex items-center px-1 py-0.5 gap-1.5 border rounded-full ">
                  <div className="h-5 w-5 rounded-full bg-primary/10    flex-shrink-0 overflow-hidden">
                    {log.user?.image ? (
                      <img
                        src={normalizeImageUrl(log.user.image) || ""}
                        alt={log.user?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-primary">
                        {log.user?.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-xs">{log.user?.name ?? "Someone"}</span>
                </span>
                {" "}
                {/* Action text */}
                <span className="text-muted-foreground font-normal items-start">
                  {getActionText(log.action, log.metadata)}
                </span>
                {/* Organization with avatar */}
                {log.organization && (
                  <>
                    {" in "}
                    <span className="inline-flex items-center rounded-full  px-1 py-0.5 gap-1.5 border">
                      <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {log.organization.image ? (
                          <img
                            src={normalizeImageUrl(log.organization.image) || ""}
                            alt={log.organization?.name || "Organization"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-semibold text-primary">
                            {log.organization?.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{log.organization.name}</span>
                    </span>
                  </>
                )}
            {/* Relative time */}
            <span className="text-muted-foreground text-xs font-semibold">
              {" · "}
              {formatRelativeTime(timestamp)}
            </span>
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
  const activity = useQuery(api.activity.list, { organizationId, limit });

  const groupedActivities = useMemo(() => {
    if (!activity?.length) return [];

    return activity.reduce((acc: GroupedActivity[], log: any) => {
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
    <Card className="space-y-0">
      {groupedActivities.map((group: any, groupIndex: number) => (
        <div key={group.date}>
          {group.activities.map((log: any, index: number) => {
            const { icon, bgColor, textColor } = getActivityIcon(log.action);
            const isFirst = groupIndex === 0 && index === 0;
            const isLast =
              groupIndex === groupedActivities.length - 1 &&
              index === group.activities.length - 1;

            return (
              <ActivityItem
                key={log._id}
                log={log}
                icon={icon}
                bgColor={bgColor}
                textColor={textColor}
                isFirst={isFirst}
                isLast={isLast}
              />
            );
          })}
        </div>
      ))}
    </Card>
  );
});

ActivityTimeline.displayName = "ActivityTimeline";
