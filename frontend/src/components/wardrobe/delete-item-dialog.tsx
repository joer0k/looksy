"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogClose, AlertDialogContent } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/notice";
import type { Dictionary } from "@/i18n";
import { describeError, type Translatable } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import type { ClothingItem } from "@/lib/types";

type DeleteItemDialogProps = {
  open: boolean;
  item: ClothingItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (item: ClothingItem) => Promise<{ ok: true } | { ok: false; error: unknown }>;
};

export function DeleteItemDialog({ open, item, onOpenChange, onConfirm }: DeleteItemDialogProps) {
  const { t } = useI18n();
  const copy = t.wardrobe.delete;
  const [busy, setBusy] = useState(false);
  // Focus the safe choice first in a destructive confirmation.
  const cancelRef = useRef<HTMLButtonElement>(null);
  // After a successful delete the card (and its menu trigger) is gone, so focus the page heading instead.
  const deletedRef = useRef(false);
  const [error, setError] = useState<Translatable | null>(null);

  async function confirm() {
    if (!item) return;
    setError(null);
    deletedRef.current = false;
    setBusy(true);
    const result = await onConfirm(item);
    setBusy(false);
    if (result.ok) {
      deletedRef.current = true;
      onOpenChange(false);
    } else {
      const failure = result.error;
      setError(() => (t: Dictionary) => describeError(failure, t, t.wardrobe.delete.failed));
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent title={copy.title} description={item ? copy.text(item.name) : ""} initialFocus={cancelRef}
        finalFocus={() => (deletedRef.current ? document.getElementById("wardrobe-title") : true)}
      >
        {error && <Notice className="mt-4">{error(t)}</Notice>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogClose ref={cancelRef} disabled={busy} render={<Button variant="secondary" />}>
            {t.common.cancel}
          </AlertDialogClose>
          <Button variant="danger" onClick={confirm} disabled={busy}>
            {busy ? copy.confirming : copy.confirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
