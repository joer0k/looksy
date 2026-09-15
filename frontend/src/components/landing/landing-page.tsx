"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LocaleSwitch } from "@/components/preferences/locale-switch";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { ContactSheet } from "./contact-sheet";

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />

      <main id="content" className="flex-1">
        <section className="shell grid gap-12 pt-8 pb-16 sm:pt-12 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-16 lg:pb-24">
          <div className="lg:col-span-5">
            <p className="eyebrow">{t.landing.eyebrow}</p>
            <h1 className="mt-4 max-w-[14ch] font-display text-display-xl font-medium">{t.landing.title}</h1>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-muted">{t.landing.lead}</p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                {t.landing.primaryCta}
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "link" })}>
                {t.landing.secondaryCta}
              </Link>
            </div>
          </div>

          <ContactSheet className="lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7" />
        </section>

        <section aria-labelledby="steps-title" className="border-t border-line">
          <div className="shell grid gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
            <div className="lg:col-span-4">
              <h2 id="steps-title" className="font-display text-display-md font-medium">
                {t.landing.stepsTitle}
              </h2>
              <p className="mt-3 text-ink-muted">{t.landing.stepsLead}</p>
            </div>

            <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-8">
              {t.landing.steps.map((step, index) => (
                <li key={step.title} className="border-t border-ink pt-5">
                  <span aria-hidden="true" className="font-display text-display-sm text-accent tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{step.text}</p>
                </li>
              ))}
            </ol>

            <p className="flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:items-baseline sm:gap-3 lg:col-span-8 lg:col-start-5">
              <span className="w-fit shrink-0 rounded-[4px] bg-notice-soft px-2 py-0.5 text-xs font-bold tracking-wide text-notice uppercase">
                {t.landing.roadmapLabel}
              </span>
              <span>{t.landing.roadmapText}</span>
            </p>
          </div>
        </section>

        <section aria-labelledby="closing-title" className="border-t border-line bg-sunken">
          <div className="shell flex flex-col items-start gap-8 py-16 md:flex-row md:items-end md:justify-between lg:py-20">
            <h2 id="closing-title" className="max-w-[22ch] font-display text-display-lg font-medium">
              {t.landing.closingTitle}
            </h2>
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "shrink-0")}>
              {t.landing.closingCta}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="shell flex flex-col gap-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t.landing.footer}</p>
          <LocaleSwitch />
        </div>
      </footer>
    </div>
  );
}
