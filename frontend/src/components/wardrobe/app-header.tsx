"use client";

import { LogOut } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LocaleSwitch } from "@/components/preferences/locale-switch";
import { ThemeSwitch } from "@/components/preferences/theme-switch";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

export function AppHeader({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas">
      <div className="shell flex h-16 items-center justify-between gap-3">
        <Logo />
        <div className="flex min-w-0 items-center gap-2">
          <LocaleSwitch />
          <ThemeSwitch />
          <div className="ml-2 flex min-w-0 items-center gap-1 border-l border-line pl-4 max-md:hidden">
            <p className="max-w-[16rem] truncate text-sm text-ink-muted" title={email}>
              <span className="sr-only">{t.nav.signedInAs} </span>
              {email}
            </p>
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut aria-hidden="true" />
              {t.nav.signOut}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
