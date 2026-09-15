"use client";

import { LandingPage } from "@/components/landing/landing-page";
import { SiteHeader } from "@/components/site/site-header";
import { WardrobeScreen } from "@/components/wardrobe/wardrobe-screen";
import { WardrobeLoadError } from "@/components/wardrobe/wardrobe-states";
import { useSession } from "@/hooks/use-session";
import { useI18n } from "@/i18n/provider";

/** Guests see the landing page, signed-in users their wardrobe. */
export default function Home() {
  const { t } = useI18n();
  const { session, retry, signOut } = useSession();

  switch (session.status) {
    case "loading":
      return (
        <div role="status" className="grid min-h-dvh place-items-center">
          <span aria-hidden="true" className="appear-late size-3 rounded-[3px] bg-accent motion-safe:animate-pulse" />
          <span className="sr-only">{t.common.loading}</span>
        </div>
      );
    case "guest":
      return <LandingPage />;
    case "error":
      return (
        <div className="flex min-h-dvh flex-col">
          <SiteHeader showAuthLinks={false} />
          <main className="shell">
            <WardrobeLoadError onRetry={retry} />
          </main>
        </div>
      );
    case "authenticated":
      return <WardrobeScreen user={session.user} token={session.token} onSignOut={signOut} />;
  }
}
