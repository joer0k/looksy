"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useI18n } from "@/i18n/provider";
import type { ClothingItem } from "@/lib/types";
import { CATEGORIES, SEASONS, categoryLabel, seasonLabel, withLegacyValues, type WardrobeFilters } from "@/lib/wardrobe";
import { cn } from "@/lib/utils";

type FilterProps = {
  items: ClothingItem[];
  filters: WardrobeFilters;
  onChange: (filters: WardrobeFilters) => void;
  className?: string;
};

/** Name search and season select. Sits in the page heading row on wide screens. */
export function FilterControls({ items, filters, onChange, className }: FilterProps) {
  const { t } = useI18n();
  const seasons = withLegacyValues(SEASONS, items.map((item) => item.season));

  return (
    <search aria-label={t.wardrobe.filters.label} className={cn("grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]", className)}>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          type="search"
          aria-label={t.wardrobe.filters.search}
          placeholder={t.wardrobe.filters.searchShort}
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          className="pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.query && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, query: "" })}
            aria-label={t.wardrobe.filters.clearSearch}
            className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-[6px] text-ink-muted hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
      <NativeSelect
        aria-label={t.wardrobe.filters.season}
        value={filters.season ?? ""}
        onChange={(event) => onChange({ ...filters, season: event.target.value || null })}
        className="w-full sm:w-[11.5rem]"
      >
        <option value="">{t.wardrobe.filters.anySeason}</option>
        {seasons.map((season) => (
          <option key={season} value={season}>
            {seasonLabel(season, t)}
          </option>
        ))}
      </NativeSelect>
    </search>
  );
}

/** Category tabs with counts. Scrolls sideways on narrow screens. */
export function CategoryTabs({ items, filters, onChange, className }: FilterProps) {
  const { t } = useI18n();

  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  // Only categories that actually have pieces; empty tabs are noise.
  const categories = withLegacyValues(CATEGORIES, counts.keys()).filter((category) => counts.has(category));

  const tabs: Array<{ value: string | null; label: string; count: number }> = [
    { value: null, label: t.wardrobe.filters.all, count: items.length },
    ...categories.map((category) => ({ value: category, label: categoryLabel(category, t), count: counts.get(category) ?? 0 })),
  ];

  return (
    <div
      role="group"
      aria-label={t.wardrobe.filters.category}
      className={cn(
        "-mx-5 flex gap-1 overflow-x-auto border-b border-line px-2 [scrollbar-width:none] sm:-mx-8 sm:px-5 lg:-mx-3 lg:px-0",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = filters.category === tab.value;
        return (
          <button
            key={tab.value ?? "all"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ ...filters, category: tab.value })}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-1.5 rounded-t-control px-3 text-[0.9375rem] whitespace-nowrap transition-colors focus-visible:-outline-offset-2",
              "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
              active ? "font-semibold text-ink after:bg-accent" : "text-ink-muted after:bg-transparent hover:text-ink",
            )}
          >
            {tab.label}
            <span className="text-xs text-ink-muted tabular-nums">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
