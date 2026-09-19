import Link from "next/link";
import { MessageCircle, Mail, MapPin, Download } from "lucide-react";
import { linkWA } from "@/lib/format";

function IkonSosmed({ label, path }: { label: string; path: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="rounded-full bg-zamrud-700 p-2.5 transition hover:bg-emas-400 hover:text-zamrud-900"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-zamrud-800 text-krem">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold">
            NAQI<span className="text-emas-400">•</span>WEAR
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zamrud-100">
            Toko fashion muslim keluarga yang amanah. Bahan berkualitas, tidak menerawang, dan nyaman
            dipakai setiap hari. Melayani pengiriman ke seluruh Indonesia.
          </p>
          <div className="mt-4 flex gap-3">
            <IkonSosmed
              label="Instagram NAQI WEAR"
              path="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.6 6.4h.01"
            />
            <IkonSosmed
              label="Facebook NAQI WEAR"
              path="M14 8h3V5h-3a4 4 0 0 0-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9a1 1 0 0 1 1-1Z"
            />
            <IkonSosmed
              label="YouTube NAQI WEAR"
              path="M22 12s0-3.5-.5-5a2.8 2.8 0 0 0-2-2C18 4.5 12 4.5 12 4.5s-6 0-7.5.5a2.8 2.8 0 0 0-2 2C2 8.5 2 12 2 12s0 3.5.5 5a2.8 2.8 0 0 0 2 2c1.5.5 7.5.5 7.5.5s6 0 7.5-.5a2.8 2.8 0 0 0 2-2c.5-1.5.5-5 .5-5Zm-12 3V9l5 3-5 3Z"
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-wide text-emas-300 uppercase">Belanja</p>
          <ul className="mt-3 space-y-2 text-sm text-zamrud-100">
            <li><Link href="/katalog?kategori=wanita" className="hover:text-emas-300">Koleksi Wanita</Link></li>
            <li><Link href="/katalog?kategori=pria" className="hover:text-emas-300">Koleksi Pria</Link></li>
            <li><Link href="/katalog?kategori=anak" className="hover:text-emas-300">Koleksi Anak</Link></li>
            <li><Link href="/katalog?kategori=keluarga" className="hover:text-emas-300">Sarimbit Keluarga</Link></li>
            <li><Link href="/promo" className="hover:text-emas-300">Promo & Voucher</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-wide text-emas-300 uppercase">Bantuan</p>
          <ul className="mt-3 space-y-2 text-sm text-zamrud-100">
            <li><Link href="/halaman/tentang" className="hover:text-emas-300">Tentang NAQI WEAR</Link></li>
            <li><Link href="/halaman/faq" className="hover:text-emas-300">Pertanyaan Umum</Link></li>
            <li><Link href="/halaman/syarat-ketentuan" className="hover:text-emas-300">Syarat & Ketentuan</Link></li>
            <li><Link href="/halaman/kebijakan-retur" className="hover:text-emas-300">Kebijakan Retur</Link></li>
            <li><Link href="/artikel" className="hover:text-emas-300">Artikel Islami</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-wide text-emas-300 uppercase">Hubungi Kami</p>
          <ul className="mt-3 space-y-3 text-sm text-zamrud-100">
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emas-300" />
              <a href={linkWA("Assalamu'alaikum, saya ingin bertanya tentang produk NAQI WEAR.")} className="hover:text-emas-300">
                WhatsApp: 0812-3456-7890
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emas-300" /> salam@naqiwear.id
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emas-300" />
              Jl. Zamrud Raya No. 7, Jakarta Selatan
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zamrud-700 py-4 text-center text-xs text-zamrud-200">
        <a
          href="https://github.com/MZF-2026/naqi-wear-fashion-web-app/archive/refs/heads/main.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-zamrud-700/60 px-4 py-2 text-zamrud-50 transition hover:bg-zamrud-600 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Download Source Code (Open Source)
        </a>
        <p className="mt-2">© {new Date().getFullYear()} NAQI WEAR · Open Source oleh MZF - 2026</p>
      </div>
    </footer>
  );
}
