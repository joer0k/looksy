import type { SVGProps } from "react";

// Simple line drawings on a 64×64 grid, one per category. Hand-drawn shapes
// rather than generic icons so an item without a photo still reads as clothing.
const shapes: Record<string, string[]> = {
  Outerwear: [
    "M22 8 27 5l5 5 5-5 5 3v11l7 4v12l-7-4v27H22V31l-7 4V23l7-4Z",
    "M32 10v48",
    "M26 40h3M35 40h3",
  ],
  Tops: ["M23 13q9-6 18 0l9 5-2 11-7-3v29H23V26l-7 3-2-11Z", "M27 13q5 5 10 0"],
  Bottoms: ["M21 8h22l2 48H35l-3-30-3 30H19Z", "M21 15h22", "M32 15v8"],
  Dresses: ["M25 8h14l-2 14 10 34H17l10-34Z", "M27 8q5 5 10 0", "M26 24h12"],
  Shoes: ["M17 50V30q0-6 6-6h10v-8h10v14q0 6 7 8v12Z", "M17 44h33"],
  Accessories: ["M15 26h34l-3 28H18Z", "M24 26q0-12 8-12t8 12"],
  default: ["M27 15a5 5 0 1 1 5 5v3L10 38a2 2 0 0 0 1 4h42a2 2 0 0 0 1-4L32 23"],
};

type GarmentGlyphProps = SVGProps<SVGSVGElement> & { category: string };

export function GarmentGlyph({ category, ...props }: GarmentGlyphProps) {
  const paths = shapes[category] ?? shapes.default;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths.map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
