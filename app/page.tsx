import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import Link from "next/link";
import {
  Shield,
  Building2,
  Zap,
  Users,
  Activity,
  Cloud,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Secure email/password auth with session management, powered by Convex Auth.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Building2,
    title: "Multi-tenant",
    description:
      "Organizations with role-based access, invitations, and team management.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Real-time",
    description:
      "Instant data sync across clients with Convex reactive queries.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Invite members, manage roles (owner/admin/member), and track activity.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Activity,
    title: "Activity Logging",
    description:
      "Full audit trail for every action across your organizations.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Cloud,
    title: "File Uploads",
    description:
      "Cloudflare R2 integration for avatars, logos, and document uploads.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              CB
            </div>
            <span className="font-semibold tracking-tight">Convex Boilerplate</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 pt-24 pb-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card/80 backdrop-blur text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Open source boilerplate
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Build SaaS apps{" "}
              <span className="gradient-text">faster</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A production-ready Next.js boilerplate with Convex backend, authentication,
              multi-tenant organizations, and real-time data sync.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Skip the boilerplate and start building your product from day one.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className={`inline-flex p-2.5 rounded-lg ${feature.bg} mb-4`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to ship?
            </h2>
            <p className="text-muted-foreground text-lg">
              Clone the repo, configure your Convex project, and start building.
            </p>
            <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
              <Link href="/register">
                Start Building
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Convex Boilerplate</span>
          <span>Built with Next.js & Convex</span>
        </div>
      </footer>
    </div>
  );
}
