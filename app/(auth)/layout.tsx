import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex relative">
      {/* Left panel — minimal branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/50 relative">
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background font-semibold text-[11px]">
              CB
            </div>
            <span className="font-semibold text-sm tracking-tight group-hover:opacity-70 transition-opacity">
              Convex Boilerplate
            </span>
          </Link>

          <div className="space-y-3 max-w-sm">
            <h2 className="text-2xl font-bold tracking-tight leading-snug">
              Build your next
              <br />
              SaaS product
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Authentication, organizations, team management, and real-time
              data — all ready to go.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Next.js + Convex + TypeScript
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-5">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background font-semibold text-[10px]">
              CB
            </div>
          </Link>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
