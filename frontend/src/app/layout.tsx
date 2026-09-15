import type { Metadata, Viewport } from "next";
import { Literata, Manrope } from "next/font/google";
import { cookies, headers } from "next/headers";

import { getDictionary } from "@/i18n";
import { I18nProvider } from "@/i18n/provider";
import {
  LOCALE_COOKIE,
  THEME_COOKIE,
  isLocale,
  isTheme,
  localeFromAcceptLanguage,
  type Locale,
} from "@/lib/preferences";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic"],
  axes: ["opsz"],
});

async function resolveLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = getDictionary(await resolveLocale());
  return { title: meta.title, description: meta.description };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1815" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await resolveLocale();
  const theme = (await cookies()).get(THEME_COOKIE)?.value;

  return (
    <html
      lang={locale}
      data-theme={isTheme(theme) ? theme : undefined}
      className={`${manrope.variable} ${literata.variable}`}
    >
      <body>
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
