"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/provider";

export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const label = visible ? t.auth.hidePassword : t.auth.showPassword;

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={label}
        aria-controls={props.id}
        title={label}
        className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-[6px] text-ink-muted transition-colors hover:text-ink"
      >
        {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}
