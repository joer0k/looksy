"use client";

import { FormEvent, useState } from "react";

type ApiErrorDetail =
  | string
  | Array<{
      msg?: string;
    }>;

function getErrorMessage(detail: ApiErrorDetail | undefined) {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(" ");
  }

  return "Не удалось создать аккаунт. Попробуйте ещё раз.";
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    if (!formData.has("terms_accepted")) {
      setError("Нужно принять условия использования.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password,
            confirm_password: confirmPassword,
            birth_date: formData.get("birth_date"),
            terms_accepted: true,
          }),
        },
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          detail?: ApiErrorDetail;
        };
        throw new Error(getErrorMessage(body.detail));
      }

      form.reset();
      setSuccess("Аккаунт создан. Теперь можно войти.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось связаться с сервером.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#FFF2BA_0%,_#F0EADA_42%,_#EAE0C8_100%)] px-4 py-6 text-[#202833] sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#845D3E]/10 bg-[#FFFAE9] shadow-[0_30px_80px_rgba(32,40,51,0.16)] md:grid-cols-[1.04fr_0.96fr]">
        <section className="relative hidden overflow-hidden bg-[#202833] p-12 text-[#FFF2BA] md:flex md:flex-col md:justify-between">
          <div className="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-[#0F3C65] opacity-90 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[#3F2A47] opacity-90 blur-2xl" />
          <div className="absolute right-12 top-36 h-20 w-20 rotate-12 rounded-[1.5rem] border border-[#FFF2BA]/30 bg-[#8A6674]/40" />

          <a href="/" className="relative text-2xl font-semibold tracking-tight">looksy</a>
          <div className="relative">
            <p className="mb-5 inline-flex rounded-full border border-[#FFF2BA]/20 bg-[#FFF2BA]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFF2BA]">
              Your digital wardrobe
            </p>
            <h1 className="max-w-sm text-5xl font-semibold leading-[1.06] tracking-tight">
              Wear more of{" "}<span className="font-serif italic text-[#FFF2BA]">what you own.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#F5EFC6]">
              A calmer closet, sharper outfits, and a personal style that grows with you.
            </p>
          </div>
          <div className="relative flex items-end justify-between border-t border-[#FFF2BA]/20 pt-6">
            <p className="max-w-48 text-sm leading-relaxed text-[#F5EFC6]">Small wardrobe choices, better everyday looks.</p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#FFFAE9] p-6 sm:p-10 md:p-14">
          <div className="w-full max-w-md">
            <a href="/" className="mb-12 block text-2xl font-semibold tracking-tight md:hidden">looksy</a>
            <p className="inline-flex rounded-full bg-[#8A6674]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#3F2A47]">Create account</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#202833]">Start your wardrobe.</h2>
            <p className="mt-3 text-[#202833]/70">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-[#0F3C65] underline decoration-[#EF6A4C] decoration-2 underline-offset-4">Sign in</a>
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#202833]">Email</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" required className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 text-[#202833] outline-none transition placeholder:text-[#8A6674] focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10" />
              </div>
              <div>
                <label htmlFor="birth_date" className="mb-2 block text-sm font-semibold text-[#202833]">Date of birth</label>
                <input id="birth_date" name="birth_date" type="date" required className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 text-[#202833] outline-none transition focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#202833]">Password</label>
                <input id="password" name="password" type="password" placeholder="At least 8 characters" minLength={8} maxLength={128} required className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 text-[#202833] outline-none transition placeholder:text-[#8A6674] focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10" />
              </div>
              <div>
                <label htmlFor="confirm_password" className="mb-2 block text-sm font-semibold text-[#202833]">Confirm password</label>
                <input id="confirm_password" name="confirm_password" type="password" placeholder="Repeat your password" minLength={8} maxLength={128} required className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 text-[#202833] outline-none transition placeholder:text-[#8A6674] focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10" />
              </div>
              <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm leading-relaxed text-[#202833]/70">
                <input name="terms_accepted" type="checkbox" className="mt-1 h-4 w-4 rounded border-[#EAE0C8] accent-[#0F3C65]" />
                <span>
                  I agree to the <a href="/terms" className="underline underline-offset-2">Terms of Service</a>{" "}
                  and <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
                </span>
              </label>
              {error && <p role="alert" className="rounded-xl border border-[#EF6A4C]/30 bg-[#FFF2BA] px-4 py-3 text-sm text-[#845D3E]">{error}</p>}
              {success && <p role="status" className="rounded-xl border border-[#0F3C65]/20 bg-[#F0EADA] px-4 py-3 text-sm text-[#0F3C65]">{success}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[#EF6A4C] px-4 py-3.5 font-semibold text-[#202833] shadow-lg shadow-[#EF6A4C]/25 transition hover:-translate-y-0.5 hover:bg-[#df5a45] focus:outline-none focus:ring-4 focus:ring-[#EF6A4C]/25 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
