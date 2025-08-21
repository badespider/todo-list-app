// Minimal Theme component adapted for non-Next app, using Tailwind 'dark' class
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeName = "light" | "dark" | "system";
export type ThemeToggleVariant = "dropdown";
export type ThemeToggleSize = "sm" | "md" | "lg";

const themeIcons = { light: Sun, dark: Moon, system: Monitor } as const;

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const shouldDark = theme === "dark" || (theme === "system" && mql.matches);
  // Support both Tailwind 'dark' class and CSS variables via data-theme
  root.classList.toggle("dark", shouldDark);
  if (shouldDark) {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
}

export function Theme({
  variant = "dropdown",
  size = "md",
  showLabel = false,
  themes = ["light", "dark", "system"],
  className,
}: {
  variant?: ThemeToggleVariant;
  size?: ThemeToggleSize;
  showLabel?: boolean;
  themes?: ThemeName[];
  className?: string;
}) {
  const [theme, setTheme] = React.useState<ThemeName>(() => (
    (localStorage.getItem("app_theme") as ThemeName) || "system"
  ));

  // Apply and persist theme
  React.useEffect(() => {
    localStorage.setItem("app_theme", theme);
    applyTheme(theme);
  }, [theme]);

  // React to system changes when theme is 'system'
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const t = (localStorage.getItem("app_theme") as ThemeName) || "system";
      if (t === "system") applyTheme("system");
    };
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  const sizeClasses: Record<ThemeToggleSize, string> = {
    sm: "h-8 px-2 text-xs",
    md: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base",
  };
  const iconSizes: Record<ThemeToggleSize, number> = { sm: 14, md: 16, lg: 20 };

  if (variant !== "dropdown") return null;

  return (
    <div className={cn(className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {showLabel ? (
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-between gap-2 rounded-lg border",
                "border-gray-300 bg-white text-gray-800",
                sizeClasses[size],
                "min-w-[80px]"
              )}
            >
              <div className="flex items-center gap-2">
                {React.createElement(themeIcons[theme], {
                  size: iconSizes[size],
                })}
                <span className="font-medium capitalize">{theme}</span>
              </div>
              <ChevronDown size={iconSizes[size]} />
            </button>
          ) : (
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-lg border",
                "border-gray-300 bg-white text-gray-800",
                sizeClasses[size]
              )}
            >
              {React.createElement(themeIcons[theme], { size: iconSizes[size] })}
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="z-50 min-w-[120px]">
          {themes.map((opt) => {
            const Icon = themeIcons[opt];
            const selected = theme === opt;
            return (
              <DropdownMenuItem key={opt} onClick={() => setTheme(opt)} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon size={iconSizes[size]} />
                  <span className="capitalize">{opt}</span>
                </div>
                {selected && <Check size={iconSizes[size]} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
