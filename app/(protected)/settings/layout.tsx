"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { UserIcon, LockIcon, Building03Icon } from "@hugeicons/core-free-icons";

const settingsNavigation: { name: string; href: string; icon: IconSvgElement }[] = [
  { name: "Profile", href: "/settings/profile", icon: UserIcon },
  { name: "Password", href: "/settings/password", icon: LockIcon },
  { name: "Organization", href: "/settings/organization", icon: Building03Icon },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Settings Nav */}
      <aside className="md:w-48 shrink-0">
        <div className="sticky top-24 space-y-1">
          <h2 className="text-sm font-semibold mb-3 px-2.5">Settings</h2>
          <nav className="space-y-0.5">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-100",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <HugeiconsIcon icon={item.icon} className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
