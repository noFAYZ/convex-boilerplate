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
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

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
            ? "bg-primary/10 text-primary dark:bg-primary/15"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
            isActive ? "text-primary" : "group-hover:scale-110"
          )}
        />
        <span className="flex-1">{item.name}</span>
        {isActive && (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary/60" />
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[280px] bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group"
              onClick={closeSidebar}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                CB
              </div>
              <span className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">
                Convex Boilerplate
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8"
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Organization Switcher */}
          <div className="px-4 py-4 border-b border-sidebar-border">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Organization
            </p>
            <OrgSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
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
          <div className="border-t border-sidebar-border px-4 py-4">
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
      className="lg:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
});

SidebarToggle.displayName = "SidebarToggle";
