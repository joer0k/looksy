"use client";

import { FormEvent, useEffect, useState } from "react";

type CurrentUser = {
  id: number;
  email: string;
  birth_date: string;
  is_active: boolean;
  created_at: string;
};

type ClothingItem = {
  id: number;
  name: string;
  category: string;
  color: string;
  season: string;
  image_url: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
};

const itemBackgrounds = ["#F5EFC6", "#0F3C65", "#8A6674", "#845D3E", "#3F2A47"];

export default function Home() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("looksy_access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    async function loadCurrentUser() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem("looksy_access_token");
          return;
        }

        const currentUser = (await response.json()) as CurrentUser;
        setUser(currentUser);

        const itemsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (itemsResponse.ok) {
          setWardrobeItems((await itemsResponse.json()) as ClothingItem[]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadCurrentUser();
  }, []);

  function signOut() {
    localStorage.removeItem("looksy_access_token");
    setUser(null);
    setWardrobeItems([]);
  }

  function openAddItemForm() {
    setItemError(null);
    setEditingItem(null);
    setIsAddItemOpen(true);
  }

  function openEditItemForm(item: ClothingItem) {
    setItemError(null);
    setIsAddItemOpen(false);
    setEditingItem(item);
  }

  function closeItemForm() {
    setItemError(null);
    setIsAddItemOpen(false);
    setEditingItem(null);
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setItemError(null);

    const token = localStorage.getItem("looksy_access_token");
    if (!token) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsCreatingItem(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          color: formData.get("color"),
          season: formData.get("season"),
          image_url: formData.get("image_url") || null,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as ClothingItem & {
        detail?: string;
      };

      if (!response.ok) {
        throw new Error(body.detail ?? "Не удалось добавить вещь.");
      }

      setWardrobeItems((items) => [body, ...items]);
      form.reset();
      closeItemForm();
    } catch (caughtError) {
      setItemError(
        caughtError instanceof Error ? caughtError.message : "Не удалось связаться с сервером.",
      );
    } finally {
      setIsCreatingItem(false);
    }
  }

  async function updateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItem) return;

    setItemError(null);
    const token = localStorage.getItem("looksy_access_token");
    if (!token) return;

    const formData = new FormData(event.currentTarget);
    setIsUpdatingItem(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${editingItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          color: formData.get("color"),
          season: formData.get("season"),
          image_url: formData.get("image_url") || null,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as ClothingItem & {
        detail?: string;
      };

      if (!response.ok) {
        throw new Error(body.detail ?? "Не удалось обновить вещь.");
      }

      setWardrobeItems((items) => items.map((item) => (item.id === body.id ? body : item)));
      closeItemForm();
    } catch (caughtError) {
      setItemError(
        caughtError instanceof Error ? caughtError.message : "Не удалось связаться с сервером.",
      );
    } finally {
      setIsUpdatingItem(false);
    }
  }

  async function deleteItem(item: ClothingItem) {
    if (!window.confirm(`Delete “${item.name}” from your wardrobe?`)) return;

    const token = localStorage.getItem("looksy_access_token");
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить вещь.");
      }

      setWardrobeItems((items) => items.filter((currentItem) => currentItem.id !== item.id));
    } catch (caughtError) {
      window.alert(
        caughtError instanceof Error ? caughtError.message : "Не удалось связаться с сервером.",
      );
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F0EADA] text-[#202833]">
        <p className="animate-pulse text-sm font-semibold tracking-[0.16em]">LOADING LOOKSY</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#FFF2BA_0%,_#F0EADA_45%,_#EAE0C8_100%)] px-5 py-6 text-[#202833] sm:px-10">
        <header className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-2xl font-semibold tracking-tight">looksy</a>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <a href="/login" className="rounded-full px-4 py-2 transition hover:bg-[#202833]/5">Sign in</a>
            <a href="/register" className="rounded-full bg-[#202833] px-5 py-2.5 text-[#FFF2BA] shadow-lg shadow-[#202833]/15 transition hover:-translate-y-0.5">Get started</a>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-12 pb-16 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-28">
          <div>
            <p className="inline-flex rounded-full bg-[#EF6A4C] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#202833]">Your digital wardrobe</p>
            <h1 className="mt-7 max-w-3xl text-6xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl">
              Style the clothes you <span className="font-serif italic text-[#0F3C65]">already own.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#202833]/70">
              Looksy turns your wardrobe into easy, personal outfit ideas — so getting dressed feels like the simplest part of your day.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="/register" className="rounded-xl bg-[#EF6A4C] px-6 py-4 font-semibold text-[#202833] shadow-xl shadow-[#EF6A4C]/20 transition hover:-translate-y-0.5">Build my wardrobe <span aria-hidden="true">→</span></a>
              <a href="/login" className="rounded-xl border border-[#845D3E]/20 bg-[#FFFDF4]/70 px-6 py-4 font-semibold transition hover:bg-[#FFFDF4]">I have an account</a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-9 -top-10 h-48 w-48 rounded-full bg-[#3F2A47]/70 blur-3xl" />
            <div className="absolute -bottom-12 -right-5 h-56 w-56 rounded-full bg-[#0F3C65]/60 blur-3xl" />
            <div className="relative rounded-[2rem] bg-[#202833] p-5 shadow-[0_32px_70px_rgba(32,40,51,0.28)] sm:p-7">
              <div className="flex items-center justify-between text-[#F5EFC6]">
                <span className="text-sm font-semibold">Today&apos;s edit</span>
                <span className="rounded-full border border-[#F5EFC6]/20 px-3 py-1 text-xs">Monday</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="col-span-2 h-48 rounded-3xl bg-[linear-gradient(135deg,_#F5EFC6,_#FFF2BA)] p-5 text-[#202833]">
                  <p className="text-sm font-semibold">Soft contrast</p>
                  <p className="mt-1 text-xs text-[#202833]/65">4 pieces · 3 colours</p>
                  <div className="mt-8 flex items-end gap-3">
                    <div className="h-20 w-16 rounded-t-[2rem] bg-[#845D3E]" />
                    <div className="h-28 w-20 rounded-t-[2.5rem] bg-[#0F3C65]" />
                    <div className="h-16 w-16 rounded-t-[1.5rem] bg-[#8A6674]" />
                  </div>
                </div>
                <div className="rounded-3xl bg-[#3F2A47] p-5 text-[#FFF2BA]">
                  <p className="text-3xl font-semibold">32</p>
                  <p className="mt-1 text-xs text-[#FFF2BA]/70">pieces in rotation</p>
                </div>
                <div className="rounded-3xl bg-[#EF6A4C] p-5 text-[#202833]">
                  <p className="text-3xl font-semibold">06</p>
                  <p className="mt-1 text-xs text-[#202833]/70">new outfit ideas</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const firstName = user.email.split("@")[0];

  return (
    <main className="min-h-screen bg-[#F0EADA] p-4 text-[#202833] sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1500px] overflow-hidden rounded-[2rem] bg-[#FFFAE9] shadow-[0_25px_70px_rgba(32,40,51,0.12)] lg:grid-cols-[230px_1fr]">
        <aside className="flex flex-col justify-between bg-[#202833] p-6 text-[#F5EFC6]">
          <div>
            <a href="/" className="text-2xl font-semibold tracking-tight">looksy</a>
            <nav className="mt-14 space-y-2 text-sm font-semibold">
              <a href="/" className="flex rounded-xl bg-[#FFF2BA] px-4 py-3 text-[#202833]">Overview</a>
              <button type="button" className="flex w-full rounded-xl px-4 py-3 text-left text-[#F5EFC6]/75 transition hover:bg-white/10">My wardrobe <span className="ml-auto">{wardrobeItems.length}</span></button>
              <button type="button" className="flex w-full rounded-xl px-4 py-3 text-left text-[#F5EFC6]/75 transition hover:bg-white/10">Outfit ideas</button>
              <button type="button" className="flex w-full rounded-xl px-4 py-3 text-left text-[#F5EFC6]/75 transition hover:bg-white/10">Calendar</button>
            </nav>
          </div>
          <div className="rounded-2xl border border-[#FFF2BA]/15 bg-white/5 p-4">
            <p className="truncate text-sm font-semibold">{user.email}</p>
            <button type="button" onClick={signOut} className="mt-2 text-xs font-semibold text-[#FFF2BA]/70 underline underline-offset-4 hover:text-[#FFF2BA]">Sign out</button>
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A6674]">Monday, 18 August</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Good morning, {firstName}.</h1>
              <p className="mt-2 text-[#202833]/65">Let&apos;s make getting dressed feel effortless.</p>
            </div>
            <button type="button" onClick={openAddItemForm} className="rounded-xl bg-[#EF6A4C] px-5 py-3 font-semibold text-[#202833] shadow-lg shadow-[#EF6A4C]/20 transition hover:-translate-y-0.5">+ Add an item</button>
          </header>

          <section className="mt-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="relative overflow-hidden rounded-[1.7rem] bg-[#0F3C65] p-7 text-[#FFF2BA]">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#8A6674]/80 blur-3xl" />
              <p className="relative text-sm font-semibold uppercase tracking-[0.14em] text-[#FFF2BA]/70">Today&apos;s outfit</p>
              <h2 className="relative mt-3 max-w-sm text-3xl font-semibold leading-tight">A calm palette for a full day ahead.</h2>
              <p className="relative mt-3 max-w-md text-[#F5EFC6]/80">Cream layers, blue denim and a warm brown finish.</p>
              <div className="relative mt-8 flex items-end gap-3">
                <div className="grid h-24 w-20 place-items-center rounded-t-[2rem] bg-[#F5EFC6] text-sm font-bold text-[#845D3E]">KN</div>
                <div className="grid h-32 w-24 place-items-center rounded-t-[2.5rem] bg-[#202833] text-sm font-bold text-[#F5EFC6]">DN</div>
                <div className="grid h-20 w-20 place-items-center rounded-t-[1.5rem] bg-[#845D3E] text-sm font-bold text-[#FFF2BA]">SL</div>
              </div>
              <button type="button" className="relative mt-7 rounded-xl bg-[#FFF2BA] px-4 py-3 text-sm font-semibold text-[#202833]">See outfit details →</button>
            </article>

            <article className="rounded-[1.7rem] bg-[#3F2A47] p-7 text-[#FFF2BA]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#FFF2BA]/70">Wardrobe pulse</p>
                  <p className="mt-5 text-5xl font-semibold">{wardrobeItems.length}</p>
                  <p className="mt-1 text-[#F5EFC6]/75">pieces in your wardrobe</p>
                </div>
                <span className="rounded-2xl bg-[#EF6A4C] px-3 py-2 text-sm font-bold text-[#202833]">+4 this week</span>
              </div>
              <div className="mt-11 h-3 overflow-hidden rounded-full bg-black/20"><div className="h-full w-[68%] rounded-full bg-[#EF6A4C]" /></div>
              <p className="mt-3 text-sm text-[#F5EFC6]/70">68% of your wardrobe has been worn this month.</p>
            </article>
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A6674]">In your rotation</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pieces you&apos;re reaching for</h2>
              </div>
              <button type="button" className="text-sm font-semibold text-[#0F3C65] underline decoration-[#EF6A4C] decoration-2 underline-offset-4">View wardrobe</button>
            </div>
            {wardrobeItems.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#845D3E]/25 bg-[#FFFDF4] px-6 py-10 text-center">
                <p className="font-semibold">Your wardrobe is still empty.</p>
                <p className="mt-2 text-sm text-[#202833]/60">Add your first item and Looksy will start building your rotation.</p>
                <button type="button" onClick={openAddItemForm} className="mt-5 font-semibold text-[#0F3C65] underline decoration-[#EF6A4C] decoration-2 underline-offset-4">Add my first item</button>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {wardrobeItems.map((item, index) => {
                  const backgroundColor = itemBackgrounds[index % itemBackgrounds.length];
                  const textColor = backgroundColor === "#F5EFC6" ? "#845D3E" : "#FFF2BA";

                  return (
                    <article key={item.id} className="group rounded-2xl border border-[#845D3E]/10 bg-[#FFFDF4] p-4 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#202833]/8">
                      <div className="grid h-36 place-items-center rounded-xl text-lg font-bold" style={{ backgroundColor, color: textColor }}>{getInitials(item.name)}</div>
                      <p className="mt-4 truncate font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-[#202833]/55">{item.category} · {item.color}</p>
                      <div className="mt-4 flex gap-3 border-t border-[#845D3E]/10 pt-3 text-sm font-semibold">
                        <button type="button" onClick={() => openEditItemForm(item)} className="text-[#0F3C65] underline decoration-[#EF6A4C] decoration-2 underline-offset-4">Edit</button>
                        <button type="button" onClick={() => void deleteItem(item)} className="text-[#845D3E] underline decoration-[#845D3E]/40 underline-offset-4">Delete</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </div>

      {(isAddItemOpen || editingItem) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#202833]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
          <div className="w-full max-w-lg rounded-[1.75rem] bg-[#FFFAE9] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A6674]">Your wardrobe</p>
                <h2 id="item-form-title" className="mt-2 text-2xl font-semibold tracking-tight">{editingItem ? "Edit this piece" : "Add a new piece"}</h2>
              </div>
              <button type="button" onClick={closeItemForm} className="grid h-9 w-9 place-items-center rounded-full bg-[#EAE0C8] text-lg transition hover:bg-[#FFF2BA]" aria-label="Close">×</button>
            </div>

            <form key={editingItem?.id ?? "new"} className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={editingItem ? updateItem : createItem}>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Name</span>
                <input name="name" required maxLength={120} defaultValue={editingItem?.name ?? ""} placeholder="e.g. White shirt" className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 outline-none transition focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Category</span>
                <select name="category" required defaultValue={editingItem?.category ?? ""} className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 outline-none transition focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10">
                  <option value="" disabled>Choose a category</option>
                  <option>Tops</option><option>Bottoms</option><option>Outerwear</option><option>Shoes</option><option>Accessories</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Colour</span>
                <input name="color" required maxLength={50} defaultValue={editingItem?.color ?? ""} placeholder="e.g. Navy blue" className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 outline-none transition focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Season</span>
                <select name="season" required defaultValue={editingItem?.season ?? ""} className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 outline-none transition focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10">
                  <option value="" disabled>Choose a season</option>
                  <option>Spring</option><option>Summer</option><option>Autumn</option><option>Winter</option><option>All season</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Image URL <span className="font-normal text-[#202833]/50">(optional)</span></span>
                <input name="image_url" type="url" defaultValue={editingItem?.image_url ?? ""} placeholder="https://..." className="w-full rounded-xl border border-[#EAE0C8] bg-[#FFFDF4] px-4 py-3 outline-none transition focus:border-[#0F3C65] focus:ring-4 focus:ring-[#0F3C65]/10" />
              </label>
              {itemError && <p role="alert" className="sm:col-span-2 rounded-xl bg-[#FFF2BA] px-4 py-3 text-sm text-[#845D3E]">{itemError}</p>}
              <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={closeItemForm} className="rounded-xl px-4 py-3 font-semibold text-[#202833]/70">Cancel</button>
                <button type="submit" disabled={isCreatingItem || isUpdatingItem} className="rounded-xl bg-[#EF6A4C] px-5 py-3 font-semibold text-[#202833] shadow-lg shadow-[#EF6A4C]/20 disabled:cursor-not-allowed disabled:opacity-60">{editingItem ? (isUpdatingItem ? "Saving..." : "Save changes") : (isCreatingItem ? "Adding..." : "Add to wardrobe")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
