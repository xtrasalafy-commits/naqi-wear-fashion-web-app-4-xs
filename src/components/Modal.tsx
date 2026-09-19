"use client";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  buka,
  tutup,
  judul,
  children,
  lebar = "max-w-lg",
}: {
  buka: boolean;
  tutup: () => void;
  judul: string;
  children: ReactNode;
  lebar?: string;
}) {
  return (
    <AnimatePresence>
      {buka && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-zamrud-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={tutup}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl ${lebar}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-zamrud-800">{judul}</h3>
              <button onClick={tutup} aria-label="Tutup" className="rounded-full p-2 hover:bg-krem">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
