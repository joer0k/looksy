"use client";

import type { ReactNode } from "react";

import { ContactSheet } from "@/components/landing/contact-sheet";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";
import { useI18n } from "@/i18n/provider";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Split layout shared by sign-in and sign-up: the form on the left, a quiet example sheet on the right. */
export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-12">
      <SkipLink />
      <div className="flex flex-col lg:col-span-6 xl:col-span-5">
        <SiteHeader showAuthLinks={false} />
        <main id="content" className="shell flex flex-1 items-start pt-6 pb-16 sm:items-center sm:pt-10">
          <div className="mx-auto w-full max-w-[26rem]">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-display-lg font-medium">{title}</h1>
            <p className="mt-3 text-ink-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 border-t border-line pt-5 text-[0.9375rem] text-ink-muted">{footer}</div>
          </div>
        </main>
      </div>

      <aside className="hidden border-l border-line bg-sunken lg:col-span-6 lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:p-12 xl:col-span-7">
        <div className="max-w-md">
          <p className="font-display text-display-md font-medium">{t.auth.asideTitle}</p>
          <p className="mt-3 text-ink-muted">{t.auth.asideText}</p>
        </div>
        <ContactSheet className="max-w-lg" />
      </aside>
    </div>
  );
}
