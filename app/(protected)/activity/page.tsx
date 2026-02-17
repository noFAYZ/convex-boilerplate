"use client";

import { ActivityFeed } from "@/components/activity/activity-feed";

export default function ActivityPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Recent activity across all your organizations
        </p>
      </div>

      <ActivityFeed limit={50} />
    </div>
  );
}
