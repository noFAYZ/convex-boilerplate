import { useMemo } from "react";

export type Role = "owner" | "admin" | "member";

export interface Permissions {
  canInvite: boolean;
  canManageRoles: boolean;
  canRemoveMembers: boolean;
  canDeleteOrg: boolean;
  canUpdateOrg: boolean;
}

/**
 * Derives permissions from a user's role in an organization
 * Centralizes all role-based access control logic
 */
export function usePermissions(role?: Role | null): Permissions {
  return useMemo(() => {
    if (!role) {
      return {
        canInvite: false,
        canManageRoles: false,
        canRemoveMembers: false,
        canDeleteOrg: false,
        canUpdateOrg: false,
      };
    }

    return {
      canInvite: role === "owner" || role === "admin",
      canManageRoles: role === "owner",
      canRemoveMembers: role === "owner" || role === "admin",
      canDeleteOrg: role === "owner",
      canUpdateOrg: role === "owner" || role === "admin",
    };
  }, [role]);
}
