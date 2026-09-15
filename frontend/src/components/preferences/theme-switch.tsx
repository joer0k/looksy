"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { THEME_COOKIE, writePreferenceCookie, type Theme } from "@/lib/preferences";
import { cn } from "@/lib/utils";

function currentTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Toggles light/dark. The icon is chosen purely in CSS from the resolved theme,
 * so it is correct on first paint even when the theme follows the OS.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const { t } = useI18n();

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    writePreferenceCookie(THEME_COOKIE, next);
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={t.common.theme} title={t.common.theme} className={cn("border border-line", className)}>
      {/* Moon in light theme (switch to dark), sun in dark theme. */}
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </Button>
  );
}
