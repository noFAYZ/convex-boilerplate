import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Convex Boilerplate</h1>
          <AuthButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Next.js + Convex Boilerplate
            </h1>
            <p className="text-xl text-muted-foreground">
              A modern, full-stack boilerplate with authentication and multi-tenant
              organization support
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="pt-12 grid gap-8 md:grid-cols-3 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">🔐 Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Secure email/password authentication powered by Convex Auth
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">🏢 Multi-tenant</h3>
              <p className="text-sm text-muted-foreground">
                Built-in organization support with role-based permissions
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">⚡ Real-time</h3>
              <p className="text-sm text-muted-foreground">
                Powered by Convex for instant data synchronization
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}