import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex relative">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 dark:bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              CB
            </div>
            <span className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">
              Convex Boilerplate
            </span>
          </Link>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Build your next
              <br />
              <span className="gradient-text">SaaS product</span>
            </h2>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Authentication, organizations, team management, and real-time data — all ready to go.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Next.js + Convex + TypeScript
          </p>
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
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
