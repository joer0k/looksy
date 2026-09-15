"use client";

import { useI18n } from "@/i18n/provider";

export function SkipLink({ target = "content" }: { target?: string }) {
  const { t } = useI18n();
  return (
    <a
      href={`#${target}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:shadow-overlay"
    >
      {t.common.skipToContent}
    </a>
  );
}
