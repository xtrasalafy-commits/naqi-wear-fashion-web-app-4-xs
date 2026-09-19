"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3, BookOpen, FileText, Image as GambarIkon, LayoutDashboard,
  LogOut, Package, ShoppingBag, Store, TicketPercent, Users, ClipboardList,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

const MENU = [
  { href: "/admin", label: "Dashboard", Ikon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", Ikon: Package },
  { href: "/admin/pesanan", label: "Pesanan", Ikon: ClipboardList },
  { href: "/admin/pelanggan", label: "Pelanggan", Ikon: Users },
  { href: "/admin/voucher", label: "Voucher", Ikon: TicketPercent },
  { href: "/admin/banner", label: "Banner", Ikon: GambarIkon },
  { href: "/admin/artikel", label: "Artikel", Ikon: BookOpen },
  { href: "/admin/konten", label: "Konten", Ikon: FileText },
  { href: "/admin/laporan", label: "Laporan", Ikon: BarChart3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, dimuat, muat, keluar } = useAuth();
  const tampil = useToast((s) => s.tampil);

  useEffect(() => {
    if (!dimuat) muat();
  }, [dimuat, muat]);

  useEffect(() => {
    if (dimuat && (!user || user.role !== "admin")) router.replace("/masuk");
  }, [dimuat, user, router]);

  if (!dimuat || !user || user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-zamrud-800">
        <div className="text-center">
          <p className="font-display text-3xl font-bold text-white">NAQI<span className="text-emas-400">•</span>WEAR Admin</p>
          <p className="mt-2 text-zamrud-100">Memeriksa sesi admin…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-krem">
      {/* SIDEBAR */}
      <aside className="hidden w-60 shrink-0 flex-col bg-zamrud-800 lg:flex">
        <div className="px-5 py-5">
          <p className="font-display text-xl font-bold text-white">NAQI<span className="text-emas-400">•</span>WEAR</p>
          <p className="text-[11px] font-bold tracking-widest text-emas-300 uppercase">Panel Admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {MENU.map(({ href, label, Ikon }) => {
            const aktif = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  aktif ? "bg-emas-400 text-zamrud-900" : "text-zamrud-100 hover:bg-zamrud-700"
                }`}
              >
                <Ikon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-zamrud-100 hover:bg-zamrud-700">
            <Store className="h-4 w-4" /> Lihat Toko
          </Link>
          <button
            onClick={async () => { await keluar(); tampil("info", "Anda telah keluar dari panel admin."); router.push("/"); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-zamrud-700"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* KONTEN */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-krem-tua bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-lg font-bold text-zamrud-800 lg:hidden">NAQI<span className="text-emas-500">•</span>WEAR Admin</p>
            <p className="hidden text-sm font-semibold text-slate-500 lg:block">
              Assalamu&apos;alaikum, <span className="font-extrabold text-zamrud-800">{user.nama}</span>
            </p>
            <Link href="/" className="flex items-center gap-1.5 rounded-full border-2 border-krem-tua px-4 py-1.5 text-xs font-extrabold text-zamrud-800 hover:bg-krem lg:hidden">
              <Store className="h-3.5 w-3.5" /> Toko
            </Link>
          </div>
          <nav className="no-scrollbar mt-3 flex gap-1 overflow-x-auto lg:hidden">
            {MENU.map(({ href, label, Ikon }) => {
              const aktif = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold ${
                    aktif ? "bg-zamrud-700 text-white" : "bg-krem text-zamrud-800"
                  }`}
                >
                  <Ikon className="h-3.5 w-3.5" /> {label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
