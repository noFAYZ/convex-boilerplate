"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/components/organizations/org-context";
import { Building2, Users, Activity, ArrowRight, Clock } from "lucide-react";

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrent);
  const { organizations, currentOrganization } = useOrganization();

  const members = useQuery(
    api.members.list,
    currentOrganization ? { organizationId: currentOrganization._id } : "skip"
  );

  const recentActivity = useQuery(
    api.activity.list,
    currentOrganization ? { organizationId: currentOrganization._id, limit: 5 } : "skip"
  );

  const stats = [
    {
      title: "Organizations",
      value: organizations?.length ?? 0,
      description: "Total organizations",
      icon: Building2,
      href: "/settings/organization",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Team Members",
      value: members?.length ?? 0,
      description: "Active members",
      icon: Users,
      href: "/team",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Activities",
      value: recentActivity?.length ?? 0,
      description: "Recent events",
      icon: Activity,
      href: "/activity",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.name ?? "User"}!</h1>
        <p className="text-muted-foreground">Here&apos;s your organization overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="group hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground mt-4">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <Link href={stat.href}>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(!organizations || organizations.length === 0) ? (
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/settings/organization">
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Organization
                </Link>
              </Button>
            ) : (
              <>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/team">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/settings/organization">
                    <Building2 className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {recentActivity && recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/activity">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex gap-3 text-sm pb-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
