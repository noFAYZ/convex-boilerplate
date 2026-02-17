"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "./button"


function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
      const currentIsDark = theme === "dark"
      setTheme(currentIsDark ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button
        data-slot="theme-switcher"
        disabled
        className={cn(
          "shadow-md rounded-full",
          "border border-divider",
          "group relative",
        )}
        size="sm"
        variant="ghost"
      >
        <HugeiconsIcon icon={Sun01Icon} className="w-4 h-4 text-default-500" />
      </Button>
    )
  }

  const isDark = theme === "dark" || theme === "dark-pro"

  return (
    <Button
      data-slot="theme-switcher"
      className={cn(
        "relative shadow-none rounded-full w-8 h-8",
        "border  justify-center",
        "group",
      )}
      size="icon"
      variant="outline"
      onClick={toggleTheme}
    >
      {/* Sun */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center z-20",
          "transition-all duration-100 ease-in-out",
          isDark ? "scale-0 opacity-0 translate-y-5" : "scale-100 opacity-100 translate-y-0"
        )}
      >
        <HugeiconsIcon
          icon={Sun01Icon}
          className={cn(
            "w-4.5 h-4.5",
            "text-orange-500",
            "transition-transform duration-200",
            "group-hover:rotate-90"
          )}
        />
      </div>

      {/* Moon */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-100 ease-in-out",
          isDark ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 -translate-y-5"
        )}
      >
        <HugeiconsIcon
          icon={Moon01Icon}
          className={cn(
            "w-4.5 h-4.5",
            "text-white/60",
            "transition-transform duration-200",
            "group-hover:rotate-90"
          )}
        />
      </div>
    </Button>
  )
}

export { ThemeSwitcher }
