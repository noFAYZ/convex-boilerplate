"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"


function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {

      // In beginner mode, cycle between light and dark
      const currentIsDark = theme === "dark"  
      setTheme(currentIsDark ? "light" : "dark")
    
  }

  // Show a neutral state during SSR/initial load
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
        <Sun className="w-4 h-4 text-default-500" />
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
        <Sun
          className={cn(
            "w-4.5 h-4.5",
            "text-orange-500",
            "transition-transform duration-200",
            "group-hover:rotate-90"
          )}
        />
    
      </div>

      {/* Moon & Stars */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-100 ease-in-out",
          isDark ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 -translate-y-5"
        )}
      >
        <Moon
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