import type { Locale } from "@/lib/preferences";
import { en } from "./en";
import { ru, type Dictionary } from "./ru";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
