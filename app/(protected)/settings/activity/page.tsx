"use client";

import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { useOrganization } from "@/components/organizations/org-context";

export default function ActivityPage() {
  const { currentOrganization } = useOrganization();

  return (
    <div className="space-y-6">
      {/* Activity Log Header */}
      <div className="space-y-2">
        <h1 className="text-lg font-bold tracking-tight">Activity Log</h1>
        <p className="text-xs text-muted-foreground">
          Monitor all activity in {currentOrganization?.name || "your organization"}
        </p>
      </div>

      {/* Activity Timeline */}
      {currentOrganization && (
        <ActivityTimeline organizationId={currentOrganization._id} limit={100} />
      )}
    </div>
  );
}
