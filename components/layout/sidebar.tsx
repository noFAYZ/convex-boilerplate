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
  badge?: string;
  isNew?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Hoist static data outside component to prevent recreating on every render
const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
      { name: "Activity", href: "/activity", icon: Activity01Icon },
    ],
  },
  {
    title: "Manage",
    items: [
      { name: "Team", href: "/team", icon: UserGroupIcon, badge: "New" },
    ],
  },
  {
    title: "Settings",
    items: [
      { name: "Profile", href: "/settings/profile", icon: Settings01Icon },
    ],
  },
] as const;

interface SidebarNavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarNavLink = memo<SidebarNavLinkProps>(
  ({ item, isActive, onClick }) => {
    return (
      <Button
        asChild
        variant={isActive ? `outline` : "ghost"}
        className={cn(
            "w-full justify-start px-3 py-1.5 text-sm h-auto font-medium transition-all duration-100 rounded group",
            isActive && "bg-background"
          )}
      >
        <Link
          href={item.href}
          onClick={onClick}
          className="flex items-center gap-3"
        >
          <HugeiconsIcon
            icon={item.icon}
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-100",
              isActive && "group-hover:scale-110"
            )}
          />
          <span className="flex-1 truncate">{item.name}</span>

          {isActive && (
            <div
              className="h-1 w-1 rounded-full ml-auto"
              style={{ backgroundColor: `var(--primary)` }}
            />
          )}

          {item.badge && (
            <span
              className="ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `color-mix(in srgb, var(--primary) 20%, transparent)`,
                color: `var(--primary)`,
              }}
            >
              {item.badge}
            </span>
          )}
        </Link>
      </Button>
    );
  }
);

SidebarNavLink.displayName = "SidebarNavLink";

interface SidebarSectionProps {
  section: NavSection;
  isActiveMap: Record<string, boolean>;
}

const SidebarSection = memo<SidebarSectionProps>(
  ({ section, isActiveMap }) => {
    return (
      <div className="space-y-1">
        <h3
          className="px-2 py-2 text-[11px] font-semibold tracking-wider uppercase"
          style={{ color: `var(--accent-foreground)` }}
        >
          {section.title}
        </h3>
        <div className="space-y-1 px-1">
          {section.items.map((item) => (
            <SidebarNavLink
              key={item.href}
              item={item}
              isActive={isActiveMap[item.href] ?? false}
            />
          ))}
        </div>
      </div>
    );
  }
);

SidebarSection.displayName = "SidebarSection";

export const Sidebar = memo(() => {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();

  const isActiveMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    NAVIGATION_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        map[item.href] =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
      });
    });
    return map;
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-150"
          onClick={closeSidebar}
          aria-hidden="true"
          style={{ backgroundColor: `color-mix(in srgb, var(--foreground) 50%, transparent)` }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-70 bg-sidebar   transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:z-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
       
      >
        {/* Header with Organization Switcher */}
        <div className="px-3 py-4 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <OrgSwitcher />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-7 w-7"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          {NAVIGATION_SECTIONS.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              isActiveMap={isActiveMap}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 space-y-3"  >
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium" style={{ color: `var(--sidebar-foreground)` }}>
              Theme
            </span>
            <ThemeSwitcher />
          </div>
          <AuthButton isCollapsed={false} />
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
      className="lg:hidden h-9 w-9 hover:bg-sidebar-accent/40"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
    </Button>
  );
});

SidebarToggle.displayName = "SidebarToggle";
