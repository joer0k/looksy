"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError, clearToken, getToken } from "@/lib/api";
import type { CurrentUser } from "@/lib/types";

export type Session =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "error" }
  | { status: "authenticated"; user: CurrentUser; token: string };

/** Resolves the stored JWT into the current user. */
export function useSession() {
  const [session, setSession] = useState<Session>({ status: "loading" });

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setSession({ status: "guest" });
      return;
    }

    try {
      const user = await api.me(token);
      setSession({ status: "authenticated", user, token });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearToken();
        setSession({ status: "guest" });
      } else {
        // Server or network trouble: keep the token and let the user retry.
        setSession({ status: "error" });
      }
    }
  }, []);

  useEffect(() => {
    // Reading localStorage and calling the API can only happen after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const retry = useCallback(() => {
    setSession({ status: "loading" });
    void load();
  }, [load]);

  const signOut = useCallback(() => {
    clearToken();
    setSession({ status: "guest" });
  }, []);

  return { session, retry, signOut };
}
