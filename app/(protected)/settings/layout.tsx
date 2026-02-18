"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { UserIcon, LockIcon, Building03Icon } from "@hugeicons/core-free-icons";

const settingsNavigation: { name: string; href: string; icon: IconSvgElement }[] = [
  { name: "Profile", href: "/settings/profile", icon: UserIcon },
  { name: "Password", href: "/settings/password", icon: LockIcon },
  { name: "Organization", href: "/settings/organization", icon: Building03Icon },
];

const SettingsNavigation = memo(function SettingsNavigation({ pathname }: { pathname: string }) {
  return (
    <aside className="md:w-48 shrink-0">
      <div className="sticky space-y-1">
        <h2 className="text-sm font-semibold mb-3 px-2.5">Settings</h2>
        <nav className="space-y-1">
          {settingsNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "outline" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2.5 text-sm  ",
              
                )}
              >
                <Link href={item.href}>
                  <HugeiconsIcon icon={item.icon} className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
});

SettingsNavigation.displayName = "SettingsNavigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <SettingsNavigation pathname={pathname} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
