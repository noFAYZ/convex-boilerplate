"use client";

import { ActivityFeed } from "@/components/activity/activity-feed";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        </div>
        <p className="text-muted-foreground pl-11">
          Recent activity across all your organizations
        </p>
      </div>

      <ActivityFeed limit={50} />
    </div>
  );
}
