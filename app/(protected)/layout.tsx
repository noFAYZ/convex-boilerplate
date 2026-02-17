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
          <div className="flex h-screen overflow-hidden bg-muted/30">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Mobile Header */}
              <header className="lg:hidden border-b bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <SidebarToggle />
                  <h1 className="text-lg font-semibold">Convex Boilerplate</h1>
                </div>
              </header>

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
