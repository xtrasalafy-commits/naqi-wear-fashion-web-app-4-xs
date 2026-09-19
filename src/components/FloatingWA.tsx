"use client";
import { MessageCircle } from "lucide-react";
import { linkWA } from "@/lib/format";

export function FloatingWA() {
  return (
    <a
      href={linkWA("Assalamu'alaikum Admin NAQI WEAR, saya ingin bertanya tentang produk.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp Admin"
      className="fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-zamrud-700 px-4 py-3.5 text-white shadow-xl transition hover:scale-105 hover:bg-zamrud-600 md:bottom-6"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-bold">Chat WhatsApp</span>
    </a>
  );
}
