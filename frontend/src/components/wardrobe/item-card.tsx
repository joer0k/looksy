"use client";

import { Menu } from "@base-ui/react/menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import type { ClothingItem } from "@/lib/types";
import { categoryLabel, seasonLabel, swatchForColor } from "@/lib/wardrobe";
import { ItemPhoto } from "./item-photo";

type ItemCardProps = {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
};

const menuItemClassName =
  "flex h-10 cursor-default items-center gap-2.5 rounded-[6px] px-3 text-sm font-medium outline-none select-none data-[highlighted]:bg-sunken";

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const { t } = useI18n();
  const swatch = swatchForColor(item.color);

  return (
    <article className="min-w-0">
      <button
        type="button"
        onClick={() => onEdit(item)}
        aria-label={t.wardrobe.card.open(item.name)}
        className="group block w-full rounded-frame"
      >
        <ItemPhoto
          category={item.category}
          color={item.color}
          imageUrl={item.image_url}
          className="transition-colors group-hover:border-line-strong"
        />
      </button>

      <div className="mt-3 flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[0.9375rem] leading-snug font-semibold [overflow-wrap:anywhere]">{item.name}</h3>
          <p className="mt-1 text-[0.8125rem] leading-snug text-ink-muted">
            {categoryLabel(item.category, t)} · {seasonLabel(item.season, t)}
          </p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[0.8125rem] text-ink-muted">
            {swatch && (
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full border border-line-strong/40" style={{ backgroundColor: swatch.hex }} />
            )}
            <span className="truncate">{item.color}</span>
          </p>
        </div>

        <Menu.Root>
          <Menu.Trigger
            render={<Button variant="ghost" size="icon-sm" className="-mt-1.5 -mr-2" />}
            aria-label={t.wardrobe.card.actions(item.name)}
          >
            <MoreHorizontal aria-hidden="true" className="size-5" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" sideOffset={4} className="z-40 outline-none">
              <Menu.Popup className="min-w-44 origin-[var(--transform-origin)] rounded-control border border-line bg-surface p-1 text-ink shadow-overlay outline-none transition-[opacity,scale] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                <Menu.Item className={menuItemClassName} onClick={() => onEdit(item)}>
                  <Pencil aria-hidden="true" className="size-4 text-ink-muted" />
                  {t.wardrobe.card.edit}
                </Menu.Item>
                <Menu.Item className={`${menuItemClassName} text-danger`} onClick={() => onDelete(item)}>
                  <Trash2 aria-hidden="true" className="size-4" />
                  {t.wardrobe.card.delete}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </article>
  );
}
