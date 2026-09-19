"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { KotakSkeleton } from "@/components/Skeletons";
import { rupiah, persenHemat } from "@/lib/format";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";

type ItemWishlist = {
  id: number;
  slug: string;
  nama: string;
  gambar: string;
  harga_dasar: number;
  harga_diskon: number | null;
  first_variant: { id: number; warna: string; ukuran: string; harga: number; stok: number; berat_gram: number } | null;
};

export default function HalamanWishlist() {
  const { user, dimuat, muat, toggleWishlist } = useAuth();
  const tambah = useCart((s) => s.tambah);
  const tampil = useToast((s) => s.tampil);
  const [items, setItems] = useState<ItemWishlist[] | null>(null);

  useEffect(() => {
    if (!dimuat) muat();
  }, [dimuat, muat]);

  useEffect(() => {
    if (user) {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((d) => setItems(d.items ?? []))
        .catch(() => setItems([]));
    } else setItems([]);
  }, [user]);

  async function pindahkan(item: ItemWishlist) {
    const v = item.first_variant;
    if (!v || v.stok <= 0) {
      tampil("error", "Stok produk sedang kosong.");
      return;
    }
    tambah({
      productId: item.id, variantId: v.id, nama: item.nama, slug: item.slug, gambar: item.gambar,
      warna: v.warna, ukuran: v.ukuran, harga: v.harga, stok: v.stok, berat: v.berat_gram,
    });
    await toggleWishlist(item.id);
    setItems((x) => (x ? x.filter((i) => i.id !== item.id) : x));
    tampil("sukses", `${item.nama} dipindahkan ke keranjang.`);
  }

  if (!dimuat) return <div className="p-16" />;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Wishlist Saya</h1>
        <p className="mt-2 text-slate-500">Silakan masuk untuk melihat produk favorit Anda.</p>
        <Link href="/masuk" className="mt-5 inline-block rounded-full bg-zamrud-700 px-8 py-3 font-extrabold text-white">Masuk</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Wishlist Saya</h1>
      <div className="mt-6">
        {!items ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <KotakSkeleton key={i} className="h-40" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center">
            <Heart className="mx-auto h-14 w-14 text-krem-tua" />
            <p className="mt-3 font-display text-2xl font-bold text-zamrud-800">Wishlist masih kosong</p>
            <p className="mt-1 text-slate-500">Tekan ikon hati pada produk untuk menyimpannya di sini.</p>
            <Link href="/katalog" className="mt-4 inline-block rounded-full bg-zamrud-700 px-8 py-3 font-extrabold text-white">Jelajahi Katalog</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const hargaFinal = item.harga_diskon ?? item.harga_dasar;
              const hemat = item.harga_diskon ? persenHemat(item.harga_dasar, item.harga_diskon) : 0;
              return (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-krem-tua bg-white p-4">
                  <Link href={`/produk/${item.slug}`} className="shrink-0">
                    <ImageLoader src={item.gambar} alt={item.nama} className="h-28 w-24 rounded-xl object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/produk/${item.slug}`} className="line-clamp-2 font-bold text-zamrud-800 hover:underline">{item.nama}</Link>
                    <p className="mt-1 text-lg font-extrabold text-zamrud-800">{rupiah(hargaFinal)}</p>
                    {item.harga_diskon && <p className="text-xs text-slate-400 line-through">{rupiah(item.harga_dasar)} <span className="font-bold text-emas-600 no-underline">−{hemat}%</span></p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button onClick={() => pindahkan(item)} className="flex items-center gap-1.5 rounded-full bg-zamrud-700 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-zamrud-600">
                        <ShoppingBag className="h-3.5 w-3.5" /> Pindah ke Keranjang
                      </button>
                      <button
                        onClick={async () => { await toggleWishlist(item.id); setItems((x) => (x ? x.filter((i) => i.id !== item.id) : x)); tampil("info", "Dihapus dari wishlist."); }}
                        className="flex items-center gap-1.5 rounded-full border-2 border-red-200 px-3.5 py-2 text-xs font-extrabold text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
