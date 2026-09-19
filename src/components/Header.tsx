"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Search, ShoppingBag, User, LogOut, Package, LayoutDashboard } from "lucide-react";
import { useCart, totalQty } from "@/store/cart";
import { useAuth } from "@/store/auth";

const MENU_KATEGORI = [
  { nama: "Wanita", href: "/katalog?kategori=wanita" },
  { nama: "Pria", href: "/katalog?kategori=pria" },
  { nama: "Anak", href: "/katalog?kategori=anak" },
  { nama: "Keluarga", href: "/katalog?kategori=keluarga" },
  { nama: "Mukena", href: "/katalog?kategori=mukena" },
  { nama: "Hijab", href: "/katalog?kategori=hijab" },
  { nama: "Promo", href: "/promo" },
  { nama: "Artikel", href: "/artikel" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const { user, dimuat, muat, keluar } = useAuth();
  const wishlistIds = useAuth((s) => s.wishlistIds);
  const [cari, setCari] = useState("");
  const [menuAkun, setMenuAkun] = useState(false);
  const refAkun = useRef<HTMLDivElement>(null);
  const qty = totalQty(items);

  useEffect(() => {
    muat();
  }, [muat]);

  useEffect(() => {
    function klikLuar(e: MouseEvent) {
      if (refAkun.current && !refAkun.current.contains(e.target as Node)) setMenuAkun(false);
    }
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  function kirimCari(e: React.FormEvent) {
    e.preventDefault();
    if (cari.trim()) router.push(`/katalog?cari=${encodeURIComponent(cari.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-krem-tua bg-white/95 shadow-sm backdrop-blur">
      <div className="bg-zamrud-700 py-1.5 text-center text-xs font-semibold text-krem">
        Gratis Ongkir Jabodetabek • Pakai kode <span className="text-emas-300">NAQI15</span> untuk diskon 15%
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
        <Link href="/" className="shrink-0" aria-label="Beranda NAQI WEAR">
          <span className="font-display text-2xl font-bold tracking-wide text-zamrud-800 md:text-3xl">
            NAQI<span className="text-emas-500">•</span>WEAR
          </span>
        </Link>

        <form onSubmit={kirimCari} className="hidden flex-1 md:flex">
          <div className="flex w-full overflow-hidden rounded-full border-2 border-zamrud-700/25 bg-krem focus-within:border-zamrud-600">
            <input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari gamis, hijab, mukena, koko…"
              className="w-full bg-transparent px-5 py-2.5 text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              aria-label="Cari produk"
              className="flex items-center gap-2 bg-zamrud-700 px-5 text-sm font-bold text-white transition hover:bg-zamrud-600"
            >
              <Search className="h-4 w-4" /> Cari
            </button>
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 md:gap-2">
          <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2.5 transition hover:bg-krem">
            <Heart className="h-6 w-6 text-zamrud-800" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-emas-400 text-[11px] font-bold text-zamrud-900">
                {wishlistIds.length}
              </span>
            )}
          </Link>
          <Link href="/keranjang" aria-label="Keranjang belanja" className="relative rounded-full p-2.5 transition hover:bg-krem">
            <ShoppingBag className="h-6 w-6 text-zamrud-800" />
            {qty > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-zamrud-700 text-[11px] font-bold text-white">
                {qty}
              </span>
            )}
          </Link>
          <div className="relative" ref={refAkun}>
            <button
              onClick={() => (dimuat ? setMenuAkun((v) => !v) : router.push("/masuk"))}
              aria-label="Akun"
              className="flex items-center gap-2 rounded-full p-2 transition hover:bg-krem"
            >
              {user ? (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-zamrud-700 text-sm font-bold text-emas-300">
                  {user.nama.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-6 w-6 text-zamrud-800" />
              )}
            </button>
            {menuAkun && (
              <div className="animate-pop absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-krem-tua bg-white shadow-xl">
                {user ? (
                  <>
                    <div className="border-b border-krem-tua bg-krem px-4 py-3">
                      <p className="text-sm font-bold text-zamrud-800">{user.nama}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-krem">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
                      </Link>
                    )}
                    <Link href="/pesanan" onClick={() => setMenuAkun(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-krem">
                      <Package className="h-4 w-4" /> Pesanan Saya
                    </Link>
                    <Link href="/wishlist" onClick={() => setMenuAkun(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-krem">
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    <button
                      onClick={async () => {
                        await keluar();
                        setMenuAkun(false);
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2 border-t border-krem-tua px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </>
                ) : (
                  <div className="p-3">
                    <Link href="/masuk" className="block rounded-xl bg-zamrud-700 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-zamrud-600">
                      Masuk
                    </Link>
                    <Link href="/daftar" className="mt-2 block rounded-xl border-2 border-zamrud-700/20 px-4 py-2 text-center text-sm font-bold text-zamrud-800 hover:bg-krem">
                      Daftar Akun Baru
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      <form onSubmit={kirimCari} className="px-4 pb-3 md:hidden">
        <div className="flex overflow-hidden rounded-full border-2 border-zamrud-700/25 bg-krem">
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari gamis, hijab, mukena…"
            className="w-full bg-transparent px-4 py-2.5 text-sm outline-none"
          />
          <button type="submit" aria-label="Cari" className="bg-zamrud-700 px-4 text-white">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      <nav className="hidden border-t border-krem-tua md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {MENU_KATEGORI.map((m) => (
            <Link
              key={m.nama}
              href={m.href}
              className={`border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                m.nama === "Promo"
                  ? "border-transparent text-tanah hover:border-emas-400"
                  : "border-transparent text-zamrud-800 hover:border-emas-400"
              }`}
            >
              {m.nama}
            </Link>
          ))}
          <span className="ml-auto py-2.5 text-xs font-semibold text-slate-400">
            Buka setiap hari 08.00–21.00 WIB
          </span>
        </div>
      </nav>
      <span className="hidden">{pathname}</span>
    </header>
  );
}
