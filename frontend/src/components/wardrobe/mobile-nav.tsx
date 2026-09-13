"use client";

import { useState } from "react";
import { LayoutGrid, LogOut, Plus, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/provider";

type MobileNavProps = {
  email: string;
  onAdd: () => void;
  onSignOut: () => void;
};

const itemClassName =
  "flex h-full w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold focus-visible:-outline-offset-4";

/** Bottom bar for phones: the three things you actually do in the app, within thumb reach. */
export function MobileNav({ email, onAdd, onSignOut }: MobileNavProps) {
  const { t } = useI18n();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <nav
        aria-label={t.nav.mobile}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid h-16 grid-cols-3">
          <li>
            <a href="#content" aria-current="page" className={`${itemClassName} text-ink`}>
              <LayoutGrid aria-hidden="true" className="size-5" />
              {t.nav.wardrobe}
            </a>
          </li>
          <li>
            <button type="button" onClick={onAdd} className={`${itemClassName} text-ink`}>
              <span className="grid size-8 place-items-center rounded-control bg-accent text-on-accent">
                <Plus aria-hidden="true" className="size-5" />
              </span>
              {t.nav.add}
            </button>
          </li>
          <li>
            <button type="button" onClick={() => setAccountOpen(true)} className={`${itemClassName} text-ink-muted`}>
              <UserRound aria-hidden="true" className="size-5" />
              {t.nav.account}
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="top-auto">
          <DialogHeader title={t.nav.account} closeLabel={t.common.close} />
          <DialogBody className="space-y-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div>
              <p className="eyebrow">{t.nav.signedInAs}</p>
              <p className="mt-1 font-semibold [overflow-wrap:anywhere]">{email}</p>
            </div>
            <Button variant="secondary" size="lg" className="w-full" onClick={onSignOut}>
              <LogOut aria-hidden="true" />
              {t.nav.signOut}
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
