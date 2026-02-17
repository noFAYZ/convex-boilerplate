"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/components/organizations/org-switcher";
import { AuthButton } from "@/components/auth/auth-button";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-provider";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Team", href: "/team", icon: Users },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Settings", href: "/settings/profile", icon: Settings },
];

interface SidebarNavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarNavLink = memo<SidebarNavLinkProps>(
  ({ item, isActive, onClick }) => {
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", isActive ? "" : "group-hover:scale-110")} />
        <span className="flex-1">{item.name}</span>
        {isActive && (
          <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
        )}
      </Link>
    );
  }
);

SidebarNavLink.displayName = "SidebarNavLink";

export const Sidebar = memo(() => {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();

  const activeStates = useMemo(
    () =>
      navigation.map((item) => ({
        ...item,
        isActive:
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href)),
      })),
    [pathname]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-card/95 backdrop-blur-xl border-r shadow-lg lg:shadow-none transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-0 lg:bg-card",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-b from-background/50 to-transparent">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group"
              onClick={closeSidebar}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                CB
              </div>
              <h1 className="text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
                Convex Boilerplate
              </h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 hover:bg-accent"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Organization Switcher */}
          <div className="px-4 py-4 border-b bg-muted/30">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground px-2">
                ORGANIZATION
              </p>
              <OrgSwitcher />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
            <div className="space-y-0.5">
              {activeStates.map((item) => (
                <SidebarNavLink
                  key={item.href}
                  item={item}
                  isActive={item.isActive}
                  onClick={closeSidebar}
                />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t px-4 py-4 bg-gradient-to-t from-background/50 to-transparent">
            <AuthButton />
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export const SidebarToggle = memo(() => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden hover:bg-accent"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
});

SidebarToggle.displayName = "SidebarToggle";
