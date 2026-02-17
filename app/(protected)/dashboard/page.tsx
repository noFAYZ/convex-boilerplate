"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/components/organizations/org-context";
import {
  Building2,
  Users,
  Activity,
  ArrowRight,
  ArrowUpRight,
  UserPlus,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrent);
  const { organizations, currentOrganization } = useOrganization();

  const members = useQuery(
    api.members.list,
    currentOrganization ? { organizationId: currentOrganization._id } : "skip"
  );

  const recentActivity = useQuery(
    api.activity.list,
    currentOrganization
      ? { organizationId: currentOrganization._id, limit: 5 }
      : "skip"
  );

  const stats = [
    {
      title: "Organizations",
      value: organizations?.length ?? 0,
      icon: Building2,
      href: "/settings/organization",
      color: "text-violet-500 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Team Members",
      value: members?.length ?? 0,
      icon: Users,
      href: "/team",
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Activities",
      value: recentActivity?.length ?? 0,
      icon: Activity,
      href: "/activity",
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {getTimeGreeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in{" "}
          {currentOrganization?.name ?? "your workspace"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/team" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-11 gap-3 font-normal"
              >
                <div className="p-1 rounded bg-blue-500/10">
                  <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                </div>
                Invite Team Member
              </Button>
            </Link>
            <Link href="/settings/organization" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-11 gap-3 font-normal"
              >
                <div className="p-1 rounded bg-violet-500/10">
                  <Settings className="h-3.5 w-3.5 text-violet-500" />
                </div>
                Organization Settings
              </Button>
            </Link>
            <Link href="/activity" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-11 gap-3 font-normal"
              >
                <div className="p-1 rounded bg-emerald-500/10">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                View Activity Log
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" asChild>
                <Link href="/activity">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.user?.name ?? "Someone"}{" "}
                        <span className="font-normal text-muted-foreground">
                          {activity.action.replace(".", " ")}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(activity.timestamp).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
