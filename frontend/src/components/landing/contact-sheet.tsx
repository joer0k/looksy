"use client";

import { GarmentGlyph } from "@/components/brand/garment-glyph";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * An illustrative "contact sheet": example pieces laid out the way the real
 * wardrobe grid shows them. Purely decorative content, labelled as an example.
 */
export function ContactSheet({ limit, className }: { limit?: number; className?: string }) {
  const { t } = useI18n();
  const items = t.landing.sheetItems.slice(0, limit);

  return (
    <figure
      aria-label={t.landing.sheetLabel}
      className={cn(
        // A single warm light falloff from the upper left: the studio lamp.
        "rounded-panel border border-line bg-surface bg-[radial-gradient(120%_80%_at_0%_0%,var(--accent-soft),transparent_60%)] p-4 sm:p-6",
        className,
      )}
    >
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4">
        {items.map((item, index) => (
          <li key={item.name} className={cn(index >= 4 && "max-sm:hidden")}>
            <div
              className="grid aspect-[4/5] place-items-center rounded-frame border border-line"
              style={{ backgroundColor: `color-mix(in oklab, ${item.color} 16%, var(--sunken))` }}
            >
              <GarmentGlyph category={item.category} className="size-[46%] text-ink-muted" />
            </div>
            <div className="mt-2.5 flex gap-2 text-[0.8125rem] leading-snug">
              <span aria-hidden="true" className="font-semibold text-ink-muted tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{item.name}</span>
                <span className="block text-ink-muted">{item.meta}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <figcaption className="mt-5 border-t border-line pt-3 text-[0.8125rem] text-ink-muted">
        {t.landing.sheetCaption}
      </figcaption>
    </figure>
  );
}
