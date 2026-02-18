"use client";

import { ActivityTimeline } from "@/components/activity/activity-timeline";

export default function ActivityPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          Monitor all activity across your organizations in real-time
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <ActivityTimeline limit={100} />
      </div>
    </div>
  );
}
