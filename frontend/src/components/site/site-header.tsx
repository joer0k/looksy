"use client";

import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LocaleSwitch } from "@/components/preferences/locale-switch";
import { ThemeSwitch } from "@/components/preferences/theme-switch";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** Header for public pages. `showAuthLinks` is off on the auth pages themselves. */
export function SiteHeader({ showAuthLinks = true }: { showAuthLinks?: boolean }) {
  const { t } = useI18n();

  return (
    <header className="shell flex h-16 items-center justify-between gap-3 sm:h-20">
      <Logo />
      <div className="flex items-center gap-2">
        <LocaleSwitch />
        <ThemeSwitch />
        {showAuthLinks && (
          <>
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-1")}>
              {t.nav.signIn}
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "max-md:hidden")}>
              {t.nav.signUp}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
