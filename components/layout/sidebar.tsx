"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/components/organizations/org-switcher";
import { AuthButton } from "@/components/auth/auth-button";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Activity01Icon,
  Settings01Icon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-provider";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface NavItem {
  name: string;
  href: string;
  icon: IconSvgElement;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
  { name: "Team", href: "/team", icon: UserGroupIcon },
  { name: "Activity", href: "/activity", icon: Activity01Icon },
  { name: "Settings", href: "/settings/profile", icon: Settings01Icon },
];

interface SidebarNavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarNavLink = memo<SidebarNavLinkProps>(
  ({ item, isActive, onClick }) => {
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-100",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <HugeiconsIcon icon={item.icon} className="h-4 w-4 shrink-0" />
        <span>{item.name}</span>
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[240px] bg-sidebar border-r border-sidebar-border transition-transform duration-150 ease-out lg:translate-x-0 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group"
              onClick={closeSidebar}
            >
              <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background font-semibold text-[9px]">
                CB
              </div>
              <span className="text-[13px] font-semibold tracking-tight">
                Convex Boilerplate
              </span>
            </Link>
            <div className="flex items-center gap-0.5">
              <ThemeSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-7 w-7"
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Organization Switcher */}
          <div className="px-3 py-3 border-b border-sidebar-border">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2.5 mb-1.5">
              Organization
            </p>
            <OrgSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto">
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
          <div className="border-t border-sidebar-border px-3 py-3">
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
      className="lg:hidden h-8 w-8"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
    </Button>
  );
});

SidebarToggle.displayName = "SidebarToggle";
