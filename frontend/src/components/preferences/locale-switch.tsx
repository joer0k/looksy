"use client";

import { useI18n } from "@/i18n/provider";
import { LOCALES } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export function LocaleSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn("inline-flex h-9 shrink-0 rounded-control border border-line p-0.5", className)}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            onClick={() => setLocale(option)}
            className={cn(
              "min-w-10 rounded-[6px] px-2 text-xs font-bold tracking-wide transition-colors",
              active ? "bg-sunken text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
