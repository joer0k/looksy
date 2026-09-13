"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Notice } from "@/components/ui/notice";
import type { SaveResult } from "@/hooks/use-wardrobe";
import type { Dictionary } from "@/i18n";
import { describeError, type Translatable } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import type { ClothingItem, ClothingItemInput } from "@/lib/types";
import { CATEGORIES, SEASONS, categoryLabel, isValidPhoto, seasonLabel, withLegacyValues } from "@/lib/wardrobe";
import { ColorField } from "./color-field";
import { PhotoField, type PendingPhoto } from "./photo-field";

export type ItemFormMode = { type: "create" } | { type: "edit"; item: ClothingItem };

type ItemFormDialogProps = {
  open: boolean;
  mode: ItemFormMode;
  onOpenChange: (open: boolean) => void;
  /** Called when a created item's photo fails, so the form continues as an edit. */
  onModeChange: (mode: ItemFormMode) => void;
  onCreate: (input: ClothingItemInput, photo: File | null) => Promise<SaveResult>;
  onUpdate: (id: number, input: ClothingItemInput, photo: File | null) => Promise<SaveResult>;
  onSaved: (item: ClothingItem, mode: ItemFormMode["type"]) => void;
};

export function ItemFormDialog({ open, mode, onOpenChange, onModeChange, onCreate, onUpdate, onSaved }: ItemFormDialogProps) {
  const { t } = useI18n();
  const copy = t.wardrobe.form;
  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const [error, setError] = useState<Translatable | null>(null);
  const [busy, setBusy] = useState(false);
  const isEdit = mode.type === "edit";

  function replacePending(next: PendingPhoto | null) {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(next);
  }

  function handleFile(file: File | null) {
    setError(null);
    if (file && !isValidPhoto(file)) {
      setError(() => (t: Dictionary) => t.wardrobe.form.photoInvalid);
      return;
    }
    replacePending(file ? { file, url: URL.createObjectURL(file) } : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const input: ClothingItemInput = {
      name: String(data.get("name") ?? "").trim(),
      category: String(data.get("category") ?? ""),
      color: String(data.get("color") ?? "").trim(),
      season: String(data.get("season") ?? ""),
    };
    const photo = pending?.file ?? null;

    setBusy(true);
    const result = mode.type === "edit" ? await onUpdate(mode.item.id, input, photo) : await onCreate(input, photo);
    setBusy(false);

    if (result.ok) {
      replacePending(null);
      onSaved(result.item, mode.type);
      onOpenChange(false);
    } else if (result.reason === "photo") {
      onModeChange({ type: "edit", item: result.item });
      setError(() => (t: Dictionary) => t.wardrobe.form.photoUploadFailed);
    } else {
      const failure = result.error;
      const fallback = mode.type === "edit" ? "updateFailed" : "createFailed";
      setError(() => (t: Dictionary) => describeError(failure, t, t.wardrobe.form[fallback]));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader
          title={isEdit ? copy.editTitle : copy.addTitle}
          description={isEdit ? copy.editDescription : copy.addDescription}
          closeLabel={t.common.close}
        />
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <ItemFields
            // Re-seed fields when switching between "new" and a specific item.
            key={isEdit ? mode.item.id : "new"}
            item={isEdit ? mode.item : null}
            pending={pending}
            busy={busy}
            onFile={handleFile}
          />
          {error && (
            <div className="border-t border-line px-5 pt-3 sm:px-7">
              <Notice>{error(t)}</Notice>
            </div>
          )}
          <DialogFooter className={error ? "border-t-0" : undefined}>
            <Button variant="ghost" disabled={busy} onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={busy} className="max-sm:flex-1">
              {isEdit ? (busy ? copy.submitEditBusy : copy.submitEdit) : busy ? copy.submitAddBusy : copy.submitAdd}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type ItemFieldsProps = {
  item: ClothingItem | null;
  pending: PendingPhoto | null;
  busy: boolean;
  onFile: (file: File | null) => void;
};

function ItemFields({ item, pending, busy, onFile }: ItemFieldsProps) {
  const { t } = useI18n();
  const copy = t.wardrobe.form;
  const [category, setCategory] = useState(item?.category ?? "");
  const [color, setColor] = useState(item?.color ?? "");
  // Keep values the backend already has, even if they're not in today's lists.
  const categories = withLegacyValues(CATEGORIES, item ? [item.category] : []);
  const seasons = withLegacyValues(SEASONS, item ? [item.season] : []);

  return (
    <DialogBody className="grid content-start gap-6 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">
          {copy.photo}
          <span className="ml-1.5 font-normal text-ink-muted">· {t.common.optional}</span>
        </span>
        <PhotoField
          id="item-photo"
          pending={pending}
          currentUrl={item?.image_url ?? null}
          category={category}
          disabled={busy}
          onFile={onFile}
        />
      </div>

      <fieldset disabled={busy} className="grid min-w-0 content-start gap-5">
        <Field id="item-name" label={copy.name}>
          <Input id="item-name" name="name" required maxLength={120} autoComplete="off" defaultValue={item?.name ?? ""} placeholder={copy.namePlaceholder} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field id="item-category" label={copy.category}>
            <NativeSelect id="item-category" name="category" required value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="" disabled>
                {copy.categoryPlaceholder}
              </option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {categoryLabel(value, t)}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field id="item-season" label={copy.season}>
            <NativeSelect id="item-season" name="season" required defaultValue={item?.season ?? ""}>
              <option value="" disabled>
                {copy.seasonPlaceholder}
              </option>
              {seasons.map((value) => (
                <option key={value} value={value}>
                  {seasonLabel(value, t)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <ColorField id="item-color" value={color} onChange={setColor} />
      </fieldset>
    </DialogBody>
  );
}
