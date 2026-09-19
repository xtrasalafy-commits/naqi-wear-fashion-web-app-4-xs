"use client";
import { create } from "zustand";

export type UserAktif = {
  id: number;
  nama: string;
  email: string;
  nomor_wa: string;
  gender: string;
  tanggal_lahir: string;
  role: string;
  alamat_json: Record<string, string> | null;
};

type AuthState = {
  user: UserAktif | null;
  dimuat: boolean;
  wishlistIds: number[];
  muat: () => Promise<void>;
  setUser: (u: UserAktif | null) => void;
  keluar: () => Promise<void>;
  tarikWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  dimuat: false,
  wishlistIds: [],
  muat: async () => {
    try {
      const res = await fetch("/api/auth/saya");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          set({ user: data.user, dimuat: true });
          get().tarikWishlist();
          return;
        }
      }
    } catch {
      /* abaikan */
    }
    set({ user: null, dimuat: true });
  },
  setUser: (u) => set({ user: u }),
  keluar: async () => {
    await fetch("/api/auth/keluar", { method: "POST" });
    set({ user: null, wishlistIds: [] });
  },
  tarikWishlist: async () => {
    const res = await fetch("/api/wishlist?hanyaId=1").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      set({ wishlistIds: data.ids ?? [] });
    }
  },
  toggleWishlist: async (productId) => {
    const { user } = get();
    if (!user) return false;
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    set({ wishlistIds: data.ids ?? [] });
    return data.ditambahkan;
  },
}));
