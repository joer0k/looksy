"use client";

import { useState, type DragEvent } from "react";
import { ImageUp } from "lucide-react";

import { GarmentGlyph } from "@/components/brand/garment-glyph";
import { Button, buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { PHOTO_TYPES } from "@/lib/wardrobe";
import { cn } from "@/lib/utils";

export type PendingPhoto = { file: File; url: string };

type PhotoFieldProps = {
  id: string;
  pending: PendingPhoto | null;
  currentUrl: string | null;
  category: string;
  disabled?: boolean;
  onFile: (file: File | null) => void;
};

/**
 * Photo picker with preview and drag & drop. Validation lives with the caller;
 * this component only reports the chosen file.
 */
export function PhotoField({ id, pending, currentUrl, category, disabled, onFile }: PhotoFieldProps) {
  const { t } = useI18n();
  const copy = t.wardrobe.form;
  const [dragging, setDragging] = useState(false);
  const previewUrl = pending?.url ?? currentUrl;

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-1">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative grid aspect-[4/5] place-items-center overflow-hidden rounded-frame border bg-sunken transition-colors",
          dragging ? "border-accent border-solid" : previewUrl ? "border-line" : "border-dashed border-line-strong",
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={pending ? copy.photoNew : copy.photoCurrent} className="size-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 text-center">
            <GarmentGlyph category={category} className="size-14 text-ink-muted sm:size-20" />
            <span className="text-[0.8125rem] text-ink-muted max-sm:hidden">{copy.photoDrop}</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              disabled && "pointer-events-none opacity-55",
            )}
          >
            <input
              id={id}
              name="photo"
              type="file"
              accept={PHOTO_TYPES.join(",")}
              disabled={disabled}
              aria-describedby={`${id}-hint`}
              className="sr-only"
              onChange={(event) => {
                onFile(event.target.files?.[0] ?? null);
                // Allow picking the same file again after discarding it.
                event.target.value = "";
              }}
            />
            <ImageUp aria-hidden="true" />
            {previewUrl ? copy.photoReplace : copy.photoPick}
          </label>
          {pending && (
            <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onFile(null)}>
              {copy.photoDiscard}
            </Button>
          )}
        </div>
        <p id={`${id}-hint`} className="text-[0.8125rem] leading-snug text-ink-muted">
          {pending ? (
            <>
              <span className="block">{copy.photoNew}</span>
              <span className="block truncate" title={pending.file.name}>
                {pending.file.name}
              </span>
            </>
          ) : (
            copy.photoHint
          )}
        </p>
      </div>
    </div>
  );
}
