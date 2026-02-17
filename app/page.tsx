import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Shield01Icon,
  Building03Icon,
  FlashIcon,
  UserGroupIcon,
  Activity01Icon,
  CloudIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const features: { icon: IconSvgElement; title: string; description: string }[] = [
  {
    icon: Shield01Icon,
    title: "Authentication",
    description:
      "Secure email/password auth with session management, powered by Convex Auth.",
  },
  {
    icon: Building03Icon,
    title: "Multi-tenant",
    description:
      "Organizations with role-based access, invitations, and team management.",
  },
  {
    icon: FlashIcon,
    title: "Real-time",
    description:
      "Instant data sync across clients with Convex reactive queries.",
  },
  {
    icon: UserGroupIcon,
    title: "Team Management",
    description:
      "Invite members, manage roles (owner/admin/member), and track activity.",
  },
  {
    icon: Activity01Icon,
    title: "Activity Logging",
    description:
      "Full audit trail for every action across your organizations.",
  },
  {
    icon: CloudIcon,
    title: "File Uploads",
    description:
      "Cloudflare R2 integration for avatars, logos, and document uploads.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background font-semibold text-[10px]">
              CB
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Convex Boilerplate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="container mx-auto px-6 pt-24 pb-28">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-sm font-medium text-muted-foreground">
              Open-source boilerplate
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
              Ship your SaaS
              <br />
              in days, not months
            </h1>

            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A production-ready Next.js starter with Convex backend,
              authentication, multi-tenant organizations, and real-time sync.
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <Button size="lg" className="h-10 px-6 text-sm gap-2" asChild>
                <Link href="/register">
                  Get Started
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-10 px-6 text-sm"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Everything you need
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Skip the boilerplate. Start building your product from day one.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow duration-200"
              >
                <HugeiconsIcon icon={feature.icon} className="h-5 w-5 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-sm mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-md mx-auto text-center space-y-5">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to ship?
            </h2>
            <p className="text-muted-foreground">
              Clone the repo, configure your Convex project, and start building.
            </p>
            <Button size="lg" className="h-10 px-6 text-sm gap-2" asChild>
              <Link href="/register">
                Start Building
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Convex Boilerplate</span>
          <span>Built with Next.js & Convex</span>
        </div>
      </footer>
    </div>
  );
}
