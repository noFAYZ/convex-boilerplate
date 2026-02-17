"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrent);
  const onboardingStatus = useQuery(api.onboarding.getOnboardingStatus);

  useEffect(() => {
    // Wait for queries to resolve
    if (currentUser === undefined || onboardingStatus === undefined) {
      return;
    }

    // Redirect to login if not authenticated
    if (currentUser === null) {
      router.push("/login");
      return;
    }

    // Redirect to onboarding if not completed (and not already on onboarding page)
    if (
      !onboardingStatus.hasCompletedOnboarding &&
      pathname !== "/onboarding"
    ) {
      router.push("/onboarding");
      return;
    }
  }, [currentUser, onboardingStatus, router, pathname]);

  // Show loading state while checking auth
  if (currentUser === undefined || onboardingStatus === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (
    currentUser === null ||
    (!onboardingStatus.hasCompletedOnboarding && pathname !== "/onboarding")
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
}
