"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Organization {
  _id: Id<"organizations">;
  name: string;
  slug: string;
  logo?: string;
  createdAt: number;
}

interface OrgContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization) => void;
  isLoading: boolean;
  isOrgSwitching: boolean;
  setIsOrgSwitching: (loading: boolean) => void;
}

const OrgContext = createContext<OrgContextType | null>(null);

const STORAGE_KEY = "convex-current-org-id";

export function OrgProvider({ children }: { children: ReactNode }) {
  const currentUser = useQuery(api.users.getCurrent);
  const organizations = useQuery(api.organizations.list);

  // State to track current organization ID
  const [currentOrgId, setCurrentOrgId] = useState<Id<"organizations"> | null>(
    null
  );
  const [isOrgSwitching, setIsOrgSwitching] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentOrgId(stored as Id<"organizations">);
      }
    }
  }, []);

  // Set default org when organizations load
  useEffect(() => {
    if (organizations && organizations.length > 0) {
      // If no org is selected or selected org doesn't exist, use first org
      if (!currentOrgId || !organizations.find((o) => o._id === currentOrgId)) {
        const defaultOrg = organizations[0];
        setCurrentOrgId(defaultOrg._id);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, defaultOrg._id);
        }
      }
    }
  }, [organizations, currentOrgId]);

  // Get current organization object
  const currentOrganization =
    organizations?.find((org) => org._id === currentOrgId) || organizations?.[0] || null;

  // Function to switch organizations
  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrgId(org._id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, org._id);
    }
  };

  // Auto-hide loading overlay when organization switches
  useEffect(() => {
    if (isOrgSwitching && currentOrgId) {
      const timer = setTimeout(() => {
        setIsOrgSwitching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentOrgId, isOrgSwitching]);

  return (
    <OrgContext.Provider
      value={{
        currentOrganization,
        organizations: organizations || [],
        setCurrentOrganization,
        isLoading: currentUser === undefined || organizations === undefined,
        isOrgSwitching,
        setIsOrgSwitching,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrgProvider");
  }
  return context;
}
