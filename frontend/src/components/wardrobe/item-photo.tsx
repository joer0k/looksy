"use client";

import { useState } from "react";

import { GarmentGlyph } from "@/components/brand/garment-glyph";
import { swatchForColor } from "@/lib/wardrobe";
import { cn } from "@/lib/utils";

type ItemPhotoProps = {
  category: string;
  color: string;
  imageUrl: string | null;
  className?: string;
};

/**
 * The photo frame. Without a photo (or if it fails to load) it shows a line
 * drawing of the category on a background faintly tinted with the item colour.
 */
export function ItemPhoto({ category, color, imageUrl, className }: ItemPhotoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(imageUrl) && failedUrl !== imageUrl;
  const swatch = swatchForColor(color);

  return (
    <div
      className={cn("relative aspect-[4/5] overflow-hidden rounded-frame border border-line bg-sunken", className)}
      style={!showImage && swatch ? { backgroundColor: `color-mix(in oklab, ${swatch.hex} 14%, var(--sunken))` } : undefined}
    >
      {showImage ? (
        // Presigned storage URLs change per request, so next/image optimisation doesn't apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={imageUrl}
          src={imageUrl ?? undefined}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(imageUrl)}
          className="size-full object-contain"
        />
      ) : (
        <div className="grid size-full place-items-center">
          <GarmentGlyph category={category} className="size-[42%] text-ink-muted" />
        </div>
      )}
    </div>
  );
}
