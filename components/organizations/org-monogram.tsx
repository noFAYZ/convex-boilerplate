import React from "react";
import { Badge } from "@/components/ui/badge";

interface OrgMonogramProps {
  name: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
}

const OrgMonogram = React.memo(function OrgMonogram({
  name,
  logo,
  size = "md",
}: OrgMonogramProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-9 h-9 text-sm font-semibold",
    lg: "w-12 h-12 text-lg font-bold",
  };

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className={`${sizeClasses[size]} object-cover   rounded-lg flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center bg-secondary rounded text-white flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
});

OrgMonogram.displayName = "OrgMonogram";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "success" | "warning" | "info" | "neutral" | "pending";

function getRoleBadgeVariant(role: string): BadgeVariant {
  switch (role) {
    case "owner":
      return "info";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

export { OrgMonogram, getRoleBadgeVariant };
