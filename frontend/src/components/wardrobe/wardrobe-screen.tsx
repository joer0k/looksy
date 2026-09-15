"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";

import { SkipLink } from "@/components/site/skip-link";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useWardrobe } from "@/hooks/use-wardrobe";
import { useI18n } from "@/i18n/provider";
import { clearToken } from "@/lib/api";
import type { ClothingItem, CurrentUser } from "@/lib/types";
import { EMPTY_FILTERS, filterItems, hasActiveFilters, type WardrobeFilters } from "@/lib/wardrobe";
import { AppHeader } from "./app-header";
import { DeleteItemDialog } from "./delete-item-dialog";
import { CategoryTabs, FilterControls } from "./filter-bar";
import { ItemCard } from "./item-card";
import { ItemFormDialog, type ItemFormMode } from "./item-form-dialog";
import { MobileNav } from "./mobile-nav";
import { WardrobeEmpty, WardrobeGridSkeleton, WardrobeLoadError, WardrobeNoResults } from "./wardrobe-states";

type WardrobeScreenProps = {
  user: CurrentUser;
  token: string;
  onSignOut: () => void;
};

export function WardrobeScreen({ user, token, onSignOut }: WardrobeScreenProps) {
  const { t } = useI18n();
  const router = useRouter();
  const wardrobe = useWardrobe(token);
  const [filters, setFilters] = useState<WardrobeFilters>(EMPTY_FILTERS);
  // Dialogs keep their last subject while closing so the exit transition has content.
  const [form, setForm] = useState<{ open: boolean; mode: ItemFormMode; session: number }>({
    open: false,
    mode: { type: "create" },
    session: 0,
  });
  const [deletion, setDeletion] = useState<{ open: boolean; item: ClothingItem | null }>({ open: false, item: null });
  const [announcement, setAnnouncement] = useState("");

  const { items, status } = wardrobe;
  // A category tab disappears when its last piece is deleted; fall back to "All".
  const effectiveFilters =
    filters.category && !items.some((item) => item.category === filters.category) ? { ...filters, category: null } : filters;
  const visibleItems = filterItems(items, effectiveFilters);
  const filtering = hasActiveFilters(effectiveFilters);

  function openForm(mode: ItemFormMode) {
    setForm((current) => ({ open: true, mode, session: current.session + 1 }));
  }

  function openEdit(item: ClothingItem) {
    openForm({ type: "edit", item });
  }

  function handleSaved(item: ClothingItem, mode: ItemFormMode["type"]) {
    setAnnouncement(mode === "create" ? t.wardrobe.announce.added(item.name) : t.wardrobe.announce.updated(item.name));
  }

  async function handleDelete(item: ClothingItem) {
    const result = await wardrobe.deleteItem(item.id);
    if (result.ok) setAnnouncement(t.wardrobe.announce.deleted(item.name));
    return result;
  }

  function signInAgain() {
    clearToken();
    router.push("/login");
  }

  // Always show the freshest copy of the item being edited (e.g. after a photo upload).
  const editing = form.mode.type === "edit" ? form.mode.item : null;
  const formMode: ItemFormMode = editing
    ? { type: "edit", item: items.find((item) => item.id === editing.id) ?? editing }
    : form.mode;

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <AppHeader email={user.email} onSignOut={onSignOut} />

      <main id="content" className="shell flex-1 pb-28 md:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-8 pb-6 sm:pt-12 sm:pb-8">
          <div className="min-w-0">
            <h1 id="wardrobe-title" tabIndex={-1} className="font-display text-display-lg font-medium focus:outline-none">
              {t.wardrobe.title}
            </h1>
            {status === "ready" && items.length > 0 && (
              <p className="mt-2 text-ink-muted tabular-nums" aria-live="polite">
                {filtering ? t.wardrobe.shown(visibleItems.length, items.length) : t.wardrobe.count(items.length)}
              </p>
            )}
          </div>
          {status === "ready" && items.length > 0 && (
            <div className="flex w-full items-center gap-3 lg:w-auto">
              <FilterControls items={items} filters={effectiveFilters} onChange={setFilters} className="flex-1 lg:w-[27rem] lg:flex-none" />
              <Button className="max-md:hidden" onClick={() => openForm({ type: "create" })}>
                <Plus aria-hidden="true" />
                {t.wardrobe.addItem}
              </Button>
            </div>
          )}
        </div>

        {wardrobe.sessionExpired && (
          <Notice tone="info" title={t.wardrobe.sessionExpired.title} className="mb-6">
            <p>{t.wardrobe.sessionExpired.text}</p>
            <Button variant="link" size="sm" className="mt-1" onClick={signInAgain}>
              {t.wardrobe.sessionExpired.cta}
            </Button>
          </Notice>
        )}

        {status === "loading" && <WardrobeGridSkeleton />}
        {status === "error" && <WardrobeLoadError onRetry={wardrobe.reload} />}
        {status === "ready" && items.length === 0 && <WardrobeEmpty onAdd={() => openForm({ type: "create" })} />}

        {status === "ready" && items.length > 0 && (
          <>
            <CategoryTabs items={items} filters={effectiveFilters} onChange={setFilters} />
            {visibleItems.length === 0 ? (
              <WardrobeNoResults onReset={() => setFilters(EMPTY_FILTERS)} />
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
                {visibleItems.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <ItemCard item={item} onEdit={openEdit} onDelete={(target) => setDeletion({ open: true, item: target })} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </main>

      <MobileNav email={user.email} onAdd={() => openForm({ type: "create" })} onSignOut={onSignOut} />

      <ItemFormDialog
        key={form.session}
        open={form.open}
        mode={formMode}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
        onModeChange={(mode) => setForm((current) => ({ ...current, mode }))}
        onCreate={wardrobe.createItem}
        onUpdate={wardrobe.updateItem}
        onSaved={handleSaved}
      />

      <DeleteItemDialog
        open={deletion.open}
        item={deletion.item}
        onOpenChange={(open) => setDeletion((current) => ({ ...current, open }))}
        onConfirm={handleDelete}
      />
    </div>
  );
}
