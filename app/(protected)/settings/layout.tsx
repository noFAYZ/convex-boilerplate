"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsNavigation = [
  { name: "Profile", href: "/settings/profile", icon: "👤" },
  { name: "Password", href: "/settings/password", icon: "🔒" },
  { name: "Organization", href: "/settings/organization", icon: "🏢" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-8">
      {/* Settings Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <nav className="space-y-1">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Settings Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
