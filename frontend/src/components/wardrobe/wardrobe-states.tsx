"use client";

import { Plus, RotateCcw } from "lucide-react";

import { GarmentGlyph } from "@/components/brand/garment-glyph";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

export function WardrobeEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useI18n();
  return (
    <section aria-labelledby="empty-title" className="grid items-center gap-8 py-10 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-12 sm:py-16">
      <div className="mx-auto grid aspect-[4/5] w-40 place-items-center rounded-frame border border-dashed border-line-strong bg-sunken sm:w-full">
        <GarmentGlyph category="default" className="size-[42%] text-ink-muted" />
      </div>
      <div className="max-w-md text-center sm:text-left">
        <h2 id="empty-title" className="font-display text-display-md font-medium">
          {t.wardrobe.empty.title}
        </h2>
        <p className="mt-3 leading-relaxed text-ink-muted">{t.wardrobe.empty.text}</p>
        <Button size="lg" className="mt-7" onClick={onAdd}>
          <Plus aria-hidden="true" />
          {t.wardrobe.empty.cta}
        </Button>
      </div>
    </section>
  );
}

export function WardrobeNoResults({ onReset }: { onReset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="py-16 text-center">
      <h2 className="font-display text-display-sm font-medium">{t.wardrobe.noResults.title}</h2>
      <p className="mt-2 text-ink-muted">{t.wardrobe.noResults.text}</p>
      <Button variant="secondary" className="mt-6" onClick={onReset}>
        {t.wardrobe.filters.reset}
      </Button>
    </div>
  );
}

export function WardrobeLoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="my-10 max-w-lg border-l-2 border-danger py-1 pl-5">
      <h2 className="text-lg font-bold">{t.wardrobe.loadError.title}</h2>
      <p className="mt-1 text-ink-muted">{t.wardrobe.loadError.text}</p>
      <Button variant="secondary" className="mt-5" onClick={onRetry}>
        <RotateCcw aria-hidden="true" />
        {t.common.retry}
      </Button>
    </div>
  );
}

/** Mirrors the real grid so the layout doesn't jump when items arrive. */
export function WardrobeGridSkeleton() {
  const { t } = useI18n();
  return (
    <div role="status" aria-label={t.common.loading} className="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} aria-hidden="true" className="motion-safe:animate-pulse">
          <div className="aspect-[4/5] rounded-frame bg-sunken" />
          <div className="mt-3 h-4 w-3/4 rounded-[4px] bg-sunken" />
          <div className="mt-2 h-3 w-1/2 rounded-[4px] bg-sunken" />
        </div>
      ))}
    </div>
  );
}
