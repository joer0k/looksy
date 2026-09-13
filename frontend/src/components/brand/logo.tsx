"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** Wordmark. The small terracotta square is the one recurring brand mark: a "frame". */
export function Logo({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link
      href="/"
      aria-label={t.common.home}
      className={cn("inline-flex items-center gap-2 rounded-control font-display text-[1.375rem] font-semibold tracking-tight text-ink", className)}
    >
      <span aria-hidden="true" className="size-2.5 translate-y-px rounded-[2px] bg-accent" />
      looksy
    </Link>
  );
}
