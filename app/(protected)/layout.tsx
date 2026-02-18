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
          <div className="flex h-screen overflow-hidden bg-sidebar">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden   ">
              {/* Mobile Header */}
              <header className="lg:hidden border-b bg-background/80 backdrop-blur-lg px-4 h-12 flex items-center gap-2.5 sticky top-0 z-30">
                <SidebarToggle />
                <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background font-semibold text-[9px]">
                  CB
                </div>
                <span className="text-[13px] font-semibold">
                  Convex Boilerplate
                </span>
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto   border border-b-0 border-r-0 bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
