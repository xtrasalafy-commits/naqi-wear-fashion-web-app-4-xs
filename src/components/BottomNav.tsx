"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, Home, Package, User } from "lucide-react";

const MENU = [
  { nama: "Beranda", href: "/", Ikon: Home },
  { nama: "Kategori", href: "/katalog", Ikon: Grid3X3 },
  { nama: "Pesanan", href: "/pesanan", Ikon: Package },
  { nama: "Akun", href: "/akun", Ikon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-krem-tua bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-4">
        {MENU.map(({ nama, href, Ikon }) => {
          const aktif = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-2.5">
              <Ikon className={`h-5 w-5 ${aktif ? "text-zamrud-700" : "text-slate-400"}`} strokeWidth={aktif ? 2.4 : 2} />
              <span className={`text-[11px] font-bold ${aktif ? "text-zamrud-700" : "text-slate-400"}`}>{nama}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
