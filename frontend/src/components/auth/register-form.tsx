"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field, hintId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import type { Dictionary } from "@/i18n";
import { describeError, type Translatable } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AuthShell } from "./auth-shell";
import { PasswordInput } from "./password-input";

// Mirrors the backend's UserRegister validation so problems show before submit.
const PASSWORD_RULES = [
  { key: "length", test: (value: string) => value.length >= 8 },
  { key: "uppercase", test: (value: string) => /\p{Lu}/u.test(value) },
  { key: "digit", test: (value: string) => /\d/.test(value) },
] as const;

export function RegisterForm() {
  const { t } = useI18n();
  const copy = t.auth.register;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Translatable | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      setError(() => (t: Dictionary) => t.auth.register.weakPassword);
      return;
    }
    if (password !== confirmPassword) {
      setError(() => (t: Dictionary) => t.auth.register.mismatch);
      return;
    }
    if (!formData.has("terms_accepted")) {
      setError(() => (t: Dictionary) => t.auth.register.termsRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.register({
        email: String(formData.get("email")),
        password,
        confirm_password: confirmPassword,
        birth_date: String(formData.get("birth_date")),
      });
      form.reset();
      setPassword("");
      setSucceeded(true);
    } catch (caught) {
      setError(() => (t: Dictionary) => describeError(caught, t, t.auth.register.failed));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <>
          {copy.hasAccount}{" "}
          <Link href="/login" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
            {copy.toLogin}
          </Link>
        </>
      }
    >
      {succeeded ? (
        <div className="space-y-5">
          <Notice tone="success" title={copy.successTitle}>
            {copy.successText}
          </Notice>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            {copy.successCta}
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Field id="email" label={t.auth.email}>
            <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={t.auth.emailPlaceholder} required />
          </Field>

          <Field id="birth_date" label={copy.birthDate} hint={copy.birthDateHint}>
            <Input id="birth_date" name="birth_date" type="date" autoComplete="bday" aria-describedby={hintId("birth_date")} required />
          </Field>

          <Field id="password" label={t.auth.password}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder={copy.passwordPlaceholder}
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby="password-rules"
              required
            />
            <div id="password-rules" className="text-[0.8125rem] text-ink-muted">
              <span className="sr-only">{copy.rulesTitle}: </span>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li key={rule.key} className={cn("inline-flex items-center gap-1.5", met && "text-success")}>
                      <Check aria-hidden="true" className={cn("size-3.5", !met && "opacity-30")} />
                      {copy.rules[rule.key]}
                      <span className="sr-only">— {met ? copy.ruleMet : copy.ruleUnmet}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Field>

          <Field id="confirm_password" label={copy.confirmPassword}>
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              autoComplete="new-password"
              placeholder={copy.confirmPlaceholder}
              minLength={8}
              maxLength={128}
              required
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-snug text-ink-muted">
            <input name="terms_accepted" type="checkbox" className="mt-0.5 size-5 shrink-0 accent-accent" />
            <span>{copy.terms}</span>
          </label>

          {error && <Notice>{error(t)}</Notice>}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? copy.submitting : copy.submit}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
