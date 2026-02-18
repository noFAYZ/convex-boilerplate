"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutCircleIcon, LoginCircleIcon } from "@hugeicons/core-free-icons";

interface AuthButtonProps {
  isCollapsed?: boolean;
}

export function AuthButton({ isCollapsed = false }: AuthButtonProps) {
  // Use Convex query to check auth state - this is the reactive Convex pattern
  const currentUser = useQuery(api.users.getCurrent);
  const { signOut } = useAuthActions();

  // Loading state while query resolves
  if (currentUser === undefined) {
    return null;
  }

  // User is authenticated
  if (currentUser) {
    return isCollapsed ? (
      <Button
        variant="outline"
        size="icon"
        className="w-10 h-10"
        onClick={() => void signOut()}
        title="Sign Out"
      >
        <HugeiconsIcon icon={LogoutCircleIcon} className="h-5 w-5" />
      </Button>
    ) : (
      <Button
        variant="outline"
        size="sm"
        onClick={() => void signOut()}
        className="w-full"
      >
        Sign Out
      </Button>
    );
  }

  // User is not authenticated
  return isCollapsed ? (
    <Button
      variant="outline"
      size="icon"
      className="w-10 h-10"
      asChild
      title="Sign In"
    >
      <Link href="/login">
        <HugeiconsIcon icon={LoginCircleIcon} className="h-5 w-5" />
      </Link>
    </Button>
  ) : (
    <div className="space-y-2 w-full">
      <Button variant="ghost" size="sm" asChild className="w-full">
        <Link href="/login">Sign In</Link>
      </Button>
      <Button size="sm" asChild className="w-full">
        <Link href="/register">Sign Up</Link>
      </Button>
    </div>
  );
}
