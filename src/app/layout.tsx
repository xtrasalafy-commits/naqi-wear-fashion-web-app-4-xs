import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import { FloatingWA } from "@/components/FloatingWA";
import { TrakteerWidget } from "@/components/TrakteerWidget";

export const metadata: Metadata = {
  title: "NAQI WEAR - Toko Fashion Muslim Online",
  description:
    "NAQI WEAR adalah toko online fashion muslim lengkap untuk wanita, pria, anak, dan keluarga. Koleksi hijab, gamis, mukena, baju koko, dan sarimbit berbahan premium, tidak menerawang, nyaman dipakai setiap hari. Belanja mudah, pengiriman aman ke seluruh Indonesia.",
  keywords: "hijab, gamis, mukena, baju koko, sarimbit, fashion muslim, toko online muslim",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-krem text-slate-800 antialiased">
        {children}
        <Toaster />
        <FloatingWA />
        <TrakteerWidget />
      </body>
    </html>
  );
}
