"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to get the current user's member record in an organization
 */
export function useCurrentMember(organizationId: Id<"organizations">) {
  const members = useQuery(api.members.list, { organizationId });
  const currentUser = useQuery(api.users.getCurrent);

  if (!members || !currentUser) return null;

  return members.find((member: any) => member.userId === currentUser._id);
}
