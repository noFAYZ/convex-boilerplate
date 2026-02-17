"use client";

import { ProtectedLayout } from "@/components/auth/protected-layout";
import { OrgProvider } from "@/components/organizations/org-context";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import { Sidebar, SidebarToggle } from "@/components/layout/sidebar";

export default function ProtectedLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <OrgProvider>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Mobile Header */}
              <header className="lg:hidden border-b bg-card/80 backdrop-blur-xl px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
                <SidebarToggle />
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
                  CB
                </div>
                <span className="text-sm font-semibold">Convex Boilerplate</span>
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </OrgProvider>
    </ProtectedLayout>
  );
}
