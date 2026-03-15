"use client";

import { memo, useCallback, useRef, useEffect, useState } from "react";
import { HeaderOrgSwitcher } from "./header-org-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ProfileDropdown } from "./profile-dropdown";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  LockIcon,
  UserIcon,
  Building03Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
} from "@/components/ui/combobox";

export interface SearchResult {
  id: string;
  label: string;
  icon?: React.ReactNode;
  category?: string;
  description?: string;
}

export interface DashboardHeaderProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchResults?: SearchResult[];
  quickActions?: SearchResult[];
}

const DEFAULT_QUICK_ACTIONS: SearchResult[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    category: "Navigation",
    description: "Go to dashboard",
    icon: <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4" />,
  },
  {
    id: "settings",
    label: "Settings",
    category: "Navigation",
    description: "Open settings",
    icon: <HugeiconsIcon icon={LockIcon} className="h-4 w-4" />,
  },
  {
    id: "profile",
    label: "Profile",
    category: "Navigation",
    description: "View your profile",
    icon: <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />,
  },
  {
    id: "organization",
    label: "Organization",
    category: "Navigation",
    description: "Manage organization",
    icon: <HugeiconsIcon icon={Building03Icon} className="h-4 w-4" />,
  },
];

const SearchCombobox = memo(function SearchCombobox({
  searchPlaceholder,
  searchOpen,
  searchValue,
  searchResults,
  quickActions,
  onOpenChange,
  onValueChange,
  searchRef,
}: {
  searchPlaceholder: string;
  searchOpen: boolean;
  searchValue: string;
  searchResults: SearchResult[];
  quickActions: SearchResult[];
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  searchRef: React.RefObject<HTMLDivElement>;
}) {
  const filteredResults = searchResults.filter((item) =>
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group results by category
  const groupedResults = filteredResults.reduce(
    (acc, item) => {
      const category = item.category || "Results";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  const groupedQuickActions = quickActions.reduce(
    (acc, item) => {
      const category = item.category || "Quick Actions";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  return (
    <div ref={searchRef} className="flex-1 max-w-sm">
      <Combobox
        open={searchOpen}
        onOpenChange={onOpenChange}
        value={searchValue}
        onValueChange={onValueChange}
      >
        <ComboboxInput
          placeholder={searchPlaceholder}
          showTrigger={false}
          showClear={(searchValue || "").length > 0}
          className={cn(
            "h-8 text-xs/relaxed bg-muted border focus-visible:ring-0 "
          )}
          onFocus={() => onOpenChange(true)}
        />

        {searchOpen && (
          <ComboboxContent
            side="bottom"
            sideOffset={6}
            align="start"
            className="w-[320px] max-w-sm"
          >
            <ComboboxList>
              {/* Search Results */}
              {filteredResults.length > 0 ? (
                <>
                  {Object.entries(groupedResults).map(([category, items]) => (
                    <div key={category}>
                      <ComboboxGroup>
                        <ComboboxLabel>{category}</ComboboxLabel>
                        {items.map((result) => (
                          <ComboboxItem key={result.id} value={result.id}>
                            {result.icon && (
                              <span className="flex-shrink-0">{result.icon}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs/relaxed font-medium truncate">
                                {result.label}
                              </div>
                              {result.description && (
                                <div className="text-xs text-muted-foreground truncate -mt-0.5">
                                  {result.description}
                                </div>
                              )}
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                    </div>
                  ))}
                </>
              ) : (searchValue || "").length === 0 ? (
                <>
                  {/* Quick Actions - Show by default */}
                  {Object.entries(groupedQuickActions).map(
                    ([category, items], index) => (
                      <div key={category}>
                        {index > 0 && <ComboboxSeparator />}
                        <ComboboxGroup>
                          <ComboboxLabel>{category}</ComboboxLabel>
                          {items.map((action) => (
                            <ComboboxItem
                              key={action.id}
                              value={action.id}
                              className="cursor-pointer hover:bg-accent"
                            >
                              {action.icon && (
                                <span className="flex-shrink-0">{action.icon}</span>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs/relaxed font-medium">
                                  {action.label}
                                </div>
                                {action.description && (
                                  <div className="text-xs text-muted-foreground -mt-0.5">
                                    {action.description}
                                  </div>
                                )}
                              </div>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </div>
                    )
                  )}
                </>
              ) : (
                <ComboboxEmpty>
                  <div className="text-center py-2">
                    <p className="text-xs font-medium">No results found</p>
                    <p className="text-xs text-muted-foreground">
                      Try a different search term
                    </p>
                  </div>
                </ComboboxEmpty>
              )}
            </ComboboxList>
          </ComboboxContent>
        )}
      </Combobox>
    </div>
  );
});

const HeaderIcons = memo(function HeaderIcons() {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <NotificationBell />
      <ProfileDropdown />
    </div>
  );
});

export const DashboardHeader = memo(function DashboardHeader({
  searchPlaceholder = "Search pages, docs...",
  onSearch,
  searchResults = [],
  quickActions = DEFAULT_QUICK_ACTIONS,
}: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    if (!searchOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  const handleSearchValueChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  return (
    <header className="sticky top-0 z-40 w-full  ">
      <div className="flex h-12 items-center justify-between gap-3 px-4  ">
        {/* Left: Organization Switcher */}
        <div className="flex-shrink-0 w-40 sm:w-fit">
          <HeaderOrgSwitcher />
        </div>

        {/* Middle: Search Combobox */}
        <SearchCombobox
          searchPlaceholder={searchPlaceholder}
          searchOpen={searchOpen}
          searchValue={searchValue}
          searchResults={searchResults}
          quickActions={quickActions}
          onOpenChange={setSearchOpen}
          onValueChange={handleSearchValueChange}
          searchRef={searchRef}
        />

        {/* Right: Icons */}
        <HeaderIcons />
      </div>
    </header>
  );
});
