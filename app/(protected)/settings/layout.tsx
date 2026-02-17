"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Lock, Building2 } from "lucide-react";

const settingsNavigation = [
  { name: "Profile", href: "/settings/profile", icon: User },
  { name: "Password", href: "/settings/password", icon: Lock },
  { name: "Organization", href: "/settings/organization", icon: Building2 },
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
      <aside className="md:w-56 shrink-0">
        <div className="sticky top-24 space-y-1">
          <h2 className="text-lg font-semibold mb-4 px-3">Settings</h2>
          <nav className="space-y-0.5">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
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
