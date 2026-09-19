"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: number;
  variantId: number;
  nama: string;
  slug: string;
  gambar: string;
  warna: string;
  ukuran: string;
  harga: number;
  stok: number;
  qty: number;
  berat: number;
};

type CartState = {
  items: CartItem[];
  tambah: (item: Omit<CartItem, "qty">, qty?: number) => void;
  ubahQty: (variantId: number, qty: number) => void;
  hapus: (variantId: number) => void;
  kosongkan: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      tambah: (item, qty = 1) =>
        set((s) => {
          const ada = s.items.find((i) => i.variantId === item.variantId);
          if (ada) {
            return {
              items: s.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, qty: Math.min(i.qty + qty, Math.max(i.stok, 1)) }
                  : i
              ),
            };
          }
          return { items: [...s.items, { ...item, qty: Math.min(qty, Math.max(item.stok, 1)) }] };
        }),
      ubahQty: (variantId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
        })),
      hapus: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      kosongkan: () => set({ items: [] }),
    }),
    { name: "naqi-cart" }
  )
);

export function subtotalKeranjang(items: CartItem[]): number {
  return items.reduce((a, i) => a + i.harga * i.qty, 0);
}
export function totalQty(items: CartItem[]): number {
  return items.reduce((a, i) => a + i.qty, 0);
}
export function totalBerat(items: CartItem[]): number {
  return items.reduce((a, i) => a + i.berat * i.qty, 0);
}
