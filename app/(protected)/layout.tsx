"use client";

import { Toaster } from "@/components/ui/toaster";
import { ProtectedLayout } from "@/components/auth/protected-layout";
import { OrgProvider } from "@/components/organizations/org-context";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import { Sidebar, SidebarToggle } from "@/components/layout/sidebar";
import { GlobalLoadingOverlay } from "@/components/layout/global-loading-overlay";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function ProtectedLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <OrgProvider>
        <SidebarProvider>
          <GlobalLoadingOverlay />
          <Toaster />
<div className="bg-sidebar">
          {/* Dashboard Header - Outside Sidebar */}
          <div className="hidden lg:block">
            <DashboardHeader />
          </div>

          {/* Mobile Header - Outside Sidebar */}
          <header className="lg:hidden border-b bg-background/80 backdrop-blur-lg px-4 h-12 flex items-center justify-between gap-2.5 sticky top-0 z-40">
            <div className="flex items-center gap-2.5">
              <SidebarToggle />
              <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background font-semibold text-[9px]">
                CB
              </div>
            </div>
            <span className="text-[13px] font-semibold truncate">
              Convex Boilerplate
            </span>
          </header>

          <div className="flex h-[calc(100vh-3rem)] overflow-hidden mx-4 border rounded-lg shadow-xs">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Email Verification Banner 
              <EmailVerificationBanner />
*/}
              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-background">
                <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>
            </div>
          </div></div>
        </SidebarProvider>
      </OrgProvider>
    </ProtectedLayout>
  );
}
