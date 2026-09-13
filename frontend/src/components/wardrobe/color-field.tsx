"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/provider";
import { SWATCHES, swatchForColor } from "@/lib/wardrobe";
import { cn } from "@/lib/utils";

type ColorFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

/** Free-text colour (as the API expects) with one-tap suggestions in the current language. */
export function ColorField({ id, value, onChange }: ColorFieldProps) {
  const { t } = useI18n();
  const matched = swatchForColor(value);

  return (
    <Field id={id} label={t.wardrobe.form.color}>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 rounded-full border border-line-strong/50"
          style={{ backgroundColor: matched?.hex ?? "transparent" }}
        />
        <Input
          id={id}
          name="color"
          required
          maxLength={50}
          autoComplete="off"
          placeholder={t.wardrobe.form.colorPlaceholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-10"
        />
      </div>
      <div role="group" aria-label={t.wardrobe.form.colorSuggestions} className="flex flex-wrap gap-1.5">
        {SWATCHES.map((swatch) => {
          const label = t.colors[swatch.id];
          const active = matched?.id === swatch.id;
          return (
            <button
              key={swatch.id}
              type="button"
              aria-label={label}
              aria-pressed={active}
              title={label}
              onClick={() => onChange(label)}
              className={cn(
                "grid size-8 place-items-center rounded-full border transition-colors",
                active ? "border-ink" : "border-transparent hover:border-line-strong",
              )}
            >
              <span aria-hidden="true" className="size-5 rounded-full border border-line-strong/50" style={{ backgroundColor: swatch.hex }} />
            </button>
          );
        })}
      </div>
    </Field>
  );
}
