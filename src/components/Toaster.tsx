"use client";
import { useToast } from "@/store/toast";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";

export function Toaster() {
  const { daftar, tutup } = useToast();
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {daftar.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              t.tipe === "sukses"
                ? "border-zamrud-200 bg-zamrud-700 text-white"
                : t.tipe === "error"
                ? "border-red-200 bg-red-600 text-white"
                : "border-emas-200 bg-white text-slate-800"
            }`}
          >
            {t.tipe === "sukses" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : t.tipe === "error" ? (
              <XCircle className="h-5 w-5 shrink-0" />
            ) : (
              <Info className="h-5 w-5 shrink-0 text-emas-500" />
            )}
            <p className="flex-1 text-sm font-semibold">{t.pesan}</p>
            <button onClick={() => tutup(t.id)} aria-label="Tutup notifikasi" className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
