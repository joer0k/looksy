"use client";

import { useCallback, useEffect, useState } from "react";

import { isUnauthorized } from "@/i18n/errors";
import { api } from "@/lib/api";
import type { ClothingItem, ClothingItemInput } from "@/lib/types";

export type SaveResult =
  | { ok: true; item: ClothingItem }
  /** The item itself was saved, only the photo upload failed. */
  | { ok: false; reason: "photo"; item: ClothingItem }
  | { ok: false; reason: "request"; error: unknown };

/** Wardrobe items for the signed-in user, with the same request sequence as before the redesign. */
export function useWardrobe(token: string) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [sessionExpired, setSessionExpired] = useState(false);

  const trackAuth = useCallback((error: unknown) => {
    if (isUnauthorized(error)) setSessionExpired(true);
  }, []);

  const load = useCallback(async () => {
    try {
      setItems(await api.listItems(token));
      setStatus("ready");
    } catch (error) {
      trackAuth(error);
      setStatus("error");
    }
  }, [token, trackAuth]);

  useEffect(() => {
    // Fetching on mount: state is only set once the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const reload = useCallback(() => {
    setStatus("loading");
    void load();
  }, [load]);

  const replace = useCallback((updated: ClothingItem) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const uploadPhoto = useCallback(
    async (item: ClothingItem, photo: File | null): Promise<SaveResult> => {
      if (!photo) return { ok: true, item };
      try {
        const updated = await api.uploadItemImage(token, item.id, photo);
        replace(updated);
        return { ok: true, item: updated };
      } catch (error) {
        trackAuth(error);
        return { ok: false, reason: "photo", item };
      }
    },
    [token, replace, trackAuth],
  );

  const createItem = useCallback(
    async (input: ClothingItemInput, photo: File | null): Promise<SaveResult> => {
      let created: ClothingItem;
      try {
        created = await api.createItem(token, input);
      } catch (error) {
        trackAuth(error);
        return { ok: false, reason: "request", error };
      }
      setItems((current) => [created, ...current]);
      return uploadPhoto(created, photo);
    },
    [token, uploadPhoto, trackAuth],
  );

  const updateItem = useCallback(
    async (id: number, input: ClothingItemInput, photo: File | null): Promise<SaveResult> => {
      let updated: ClothingItem;
      try {
        updated = await api.updateItem(token, id, input);
      } catch (error) {
        trackAuth(error);
        return { ok: false, reason: "request", error };
      }
      replace(updated);
      return uploadPhoto(updated, photo);
    },
    [token, replace, uploadPhoto, trackAuth],
  );

  const deleteItem = useCallback(
    async (id: number) => {
      try {
        await api.deleteItem(token, id);
        setItems((current) => current.filter((item) => item.id !== id));
        return { ok: true as const };
      } catch (error) {
        trackAuth(error);
        return { ok: false as const, error };
      }
    },
    [token, trackAuth],
  );

  return { items, status, sessionExpired, reload, createItem, updateItem, deleteItem };
}
