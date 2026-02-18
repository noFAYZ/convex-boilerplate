"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/components/organizations/org-context";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Building03Icon,
  UserGroupIcon,
  Activity01Icon,
  ArrowRight01Icon,
  UserAdd01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

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

  const stats: { title: string; value: number; icon: IconSvgElement; href: string }[] = [
    {
      title: "Organizations",
      value: organizations?.length ?? 0,
      icon: Building03Icon,
      href: "/settings/organization",
    },
    {
      title: "Team Members",
      value: members?.length ?? 0,
      icon: UserGroupIcon,
      href: "/team",
    },
    {
      title: "Activities",
      value: recentActivity?.length ?? 0,
      icon: Activity01Icon,
      href: "/activity",
    },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {getTimeGreeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in{" "}
          {currentOrganization?.name ?? "your workspace"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group flex-row items-center  hover:bg-accent transition-shadow duration-100 cursor-pointer">
         
                <div className="flex items-center justify-between ">
                  <HugeiconsIcon icon={stat.icon} className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {stat.value}
                 <p className="text-xs text-muted-foreground  subpixel-antialiased">
                  {stat.title}
                </p>  
                </div>
               
    
            </Card>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link href="/team" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 gap-2.5 text-[13px] font-normal"
              >
                <HugeiconsIcon icon={UserAdd01Icon} className="h-3.5 w-3.5 text-muted-foreground" />
                Invite Team Member
              </Button>
            </Link>
            <Link href="/settings/organization" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 gap-2.5 text-[13px] font-normal"
              >
                <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5 text-muted-foreground" />
                Organization Settings
              </Button>
            </Link>
            <Link href="/activity" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 gap-2.5 text-[13px] font-normal"
              >
                <HugeiconsIcon icon={Activity01Icon} className="h-3.5 w-3.5 text-muted-foreground" />
                View Activity Log
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Recent Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 gap-1 text-muted-foreground"
                asChild
              >
                <Link href="/activity">
                  View all
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-0.5">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 p-2.5 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] truncate">
                        <span className="font-medium">
                          {activity.user?.name ?? "Someone"}
                        </span>{" "}
                        <span className="text-muted-foreground">
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
                <HugeiconsIcon icon={Activity01Icon} className="h-6 w-6 text-muted-foreground/25 mx-auto mb-2" />
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
