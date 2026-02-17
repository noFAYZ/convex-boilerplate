"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthButton() {
  // Use Convex query to check auth state - this is the reactive Convex pattern
  const currentUser = useQuery(api.users.getCurrent);
  const { signOut } = useAuthActions();

  // Loading state while query resolves
  if (currentUser === undefined) {
    return null;
  }

  // User is authenticated
  if (currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => void signOut()}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  // User is not authenticated
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Sign Up</Link>
      </Button>
    </div>
  );
}
