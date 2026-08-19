"use client";

import { FormEvent, useState } from "react";

type LoginResponse = {
  access_token?: string;
  token_type?: string;
  detail?: string;
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
          }),
        },
      );

      const body = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok) {
        throw new Error(body.detail ?? "Не удалось войти. Проверьте данные.");
      }

      if (!body.access_token) {
        throw new Error("Сервер не вернул токен авторизации.");
      }

      localStorage.setItem("looksy_access_token", body.access_token);
      window.location.assign("/");
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#FFF2BA_0%,_#F0EADA_42%,_#EAE0C8_100%)] px-4 py-6 text-[#202833] sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#845D3E]/10 bg-[#FFFAE9] shadow-[0_30px_80px_rgba(32,40,51,0.16)] md:grid-cols-[0.96fr_1.04fr]">
        <section className="flex items-center justify-center bg-[#FFFAE9] p-6 sm:p-10 md:p-14">
          <div className="w-full max-w-md">
            <a href="/" className="mb-12 block text-2xl font-semibold tracking-tight md:hidden">
              looksy
            </a>
            <p className="inline-flex rounded-full bg-[#0F3C65]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0F3C65]">
              Welcome back
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#202833]">
              Your wardrobe is waiting.
            </h1>
            <p className="mt-3 text-[#202833]/70">
              New to Looksy?{" "}
              <a
                href="/register"
                className="font-semibold text-[#0F3C65] underline decoration-[#EF6A4C] decoration-2 underline-offset-4"
              >
                Create an account
              </a>
            </p>

            <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#202833]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 text-[#202833] outline-none transition placeholder:text-[#8A6674] focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#202833]">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#3F2A47] underline decoration-[#8A6674]/60 underline-offset-4"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 text-[#202833] outline-none transition placeholder:text-[#8A6674] focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10"
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-[#EF6A4C]/30 bg-[#FFF2BA] px-4 py-3 text-sm text-[#845D3E]"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#EF6A4C] px-4 py-3.5 font-semibold text-[#202833] shadow-lg shadow-[#EF6A4C]/25 transition hover:-translate-y-0.5 hover:bg-[#df5a45] focus:outline-none focus:ring-4 focus:ring-[#EF6A4C]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[#202833] p-12 text-[#FFF2BA] md:flex md:flex-col md:justify-between">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#0F3C65] opacity-90 blur-2xl" />
          <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-[#3F2A47] opacity-90 blur-2xl" />
          <div className="absolute left-14 top-40 h-16 w-16 -rotate-12 rounded-[1.25rem] bg-[#8A6674]/50" />

          <a href="/" className="relative text-2xl font-semibold tracking-tight">
            looksy
          </a>
          <div className="relative">
            <div className="mb-6 inline-flex -rotate-2 items-center gap-3 rounded-2xl bg-[#EF6A4C] px-4 py-3 text-sm font-semibold text-[#202833] shadow-lg shadow-black/15">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#FFF2BA]">✦</span>
              24 pieces styled this month
            </div>
            <h2 className="max-w-sm text-5xl font-semibold leading-[1.06] tracking-tight">
              Less guessing. <span className="font-serif italic">More you.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#F5EFC6]">
              See your wardrobe as a collection of possibilities, not a row of difficult choices.
            </p>
          </div>
          <p className="relative max-w-56 border-t border-[#FFF2BA]/20 pt-6 text-sm leading-relaxed text-[#F5EFC6]">
            Pick an outfit you already love wearing.
          </p>
        </section>
      </div>
    </main>
  );
}
