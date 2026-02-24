"use client";

import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { useOrganization } from "@/components/organizations/org-context";

export default function ActivityPage() {
  const { currentOrganization } = useOrganization();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      {/* Activity Log Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
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
