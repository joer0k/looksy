"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import type { Dictionary } from "@/i18n";
import { describeError, type Translatable } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import { api, setToken } from "@/lib/api";
import { AuthShell } from "./auth-shell";
import { PasswordInput } from "./password-input";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const copy = t.auth.login;
  const [error, setError] = useState<Translatable | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    try {
      const body = await api.login(String(formData.get("email")), String(formData.get("password")));
      if (body.access_token) {
        setToken(body.access_token);
        router.replace("/");
        return;
      }
      setError(() => (t: Dictionary) => t.auth.login.noToken);
    } catch (caught) {
      setError(() => (t: Dictionary) => describeError(caught, t, t.auth.login.failed));
    }
    setIsSubmitting(false);
  }

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <>
          {copy.noAccount}{" "}
          <Link href="/register" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
            {copy.toRegister}
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field id="email" label={t.auth.email}>
          <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={t.auth.emailPlaceholder} required />
        </Field>
        <Field id="password" label={t.auth.password}>
          <PasswordInput id="password" name="password" autoComplete="current-password" placeholder={copy.passwordPlaceholder} required />
        </Field>
        {error && <Notice>{error(t)}</Notice>}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? copy.submitting : copy.submit}
        </Button>
      </form>
    </AuthShell>
  );
}
