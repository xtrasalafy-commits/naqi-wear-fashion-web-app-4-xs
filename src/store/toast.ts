"use client";
import { create } from "zustand";

export type Toast = { id: number; tipe: "sukses" | "error" | "info"; pesan: string };

type ToastState = {
  daftar: Toast[];
  tampil: (tipe: Toast["tipe"], pesan: string) => void;
  tutup: (id: number) => void;
};

let counter = 0;

export const useToast = create<ToastState>((set) => ({
  daftar: [],
  tampil: (tipe, pesan) => {
    const id = ++counter;
    set((s) => ({ daftar: [...s.daftar, { id, tipe, pesan }] }));
    setTimeout(() => set((s) => ({ daftar: s.daftar.filter((t) => t.id !== id) })), 3200);
  },
  tutup: (id) => set((s) => ({ daftar: s.daftar.filter((t) => t.id !== id) })),
}));
