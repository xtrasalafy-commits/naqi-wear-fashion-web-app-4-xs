"use client";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { ImageLoader } from "./ImageLoader";
import { Stars } from "./Stars";
import { rupiah, persenHemat } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

export type ProdukKartu = {
  id: number;
  slug: string;
  nama: string;
  gambar: string;
  harga_dasar: number;
  harga_diskon: number | null;
  rating_avg: number;
  rating_count: number;
  terlaris: boolean;
  unggulan: boolean;
  baru: boolean;
  kategori_nama?: string;
  first_variant: {
    id: number;
    warna: string;
    ukuran: string;
    harga: number;
    stok: number;
    berat_gram: number;
  } | null;
};

export function ProductCard({ p }: { p: ProdukKartu }) {
  const tambah = useCart((s) => s.tambah);
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const tampil = useToast((s) => s.tampil);
  const disukai = wishlistIds.includes(p.id);
  const hargaFinal = p.harga_diskon ?? p.harga_dasar;
  const hemat = p.harga_diskon ? persenHemat(p.harga_dasar, p.harga_diskon) : 0;

  function tambahKeranjang(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const v = p.first_variant;
    if (!v || v.stok <= 0) {
      tampil("error", "Maaf, stok produk ini sedang kosong.");
      return;
    }
    tambah({
      productId: p.id,
      variantId: v.id,
      nama: p.nama,
      slug: p.slug,
      gambar: p.gambar,
      warna: v.warna,
      ukuran: v.ukuran,
      harga: v.harga,
      stok: v.stok,
      berat: v.berat_gram,
    });
    tampil("sukses", `${p.nama} masuk ke keranjang.`);
  }

  async function klikWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      tampil("info", "Silakan masuk terlebih dahulu untuk menyimpan wishlist.");
      return;
    }
    const ditambah = await toggleWishlist(p.id);
    tampil(ditambah ? "sukses" : "info", ditambah ? "Ditambahkan ke wishlist." : "Dihapus dari wishlist.");
  }

  return (
    <Link
      href={`/produk/${p.slug}`}
      className="group block overflow-hidden rounded-2xl border border-krem-tua bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-krem-tua">
        <ImageLoader
          src={p.gambar}
          alt={p.nama}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {p.terlaris && (
            <span className="rounded-full bg-emas-400 px-2.5 py-1 text-[10px] font-extrabold text-zamrud-900">
              Best Seller
            </span>
          )}
          {hemat > 0 && (
            <span className="rounded-full bg-tanah px-2.5 py-1 text-[10px] font-extrabold text-white">
              Promo {hemat}%
            </span>
          )}
          {p.baru && !p.terlaris && (
            <span className="rounded-full bg-zamrud-700 px-2.5 py-1 text-[10px] font-extrabold text-white">Baru</span>
          )}
        </div>
        <button
          onClick={klikWishlist}
          aria-label="Simpan ke wishlist"
          className="absolute top-2 right-2 rounded-full bg-white/90 p-2 shadow transition hover:scale-110"
        >
          <Heart className={`h-4 w-4 ${disukai ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
        </button>
        <button
          onClick={tambahKeranjang}
          className="absolute inset-x-3 bottom-3 hidden items-center justify-center gap-2 rounded-xl bg-zamrud-700 py-2.5 text-sm font-bold text-white opacity-0 shadow-lg transition duration-300 group-hover:opacity-100 hover:bg-zamrud-600 md:flex"
        >
          <ShoppingBag className="h-4 w-4" /> Tambah Keranjang
        </button>
        <button
          onClick={tambahKeranjang}
          aria-label="Tambah ke keranjang"
          className="absolute right-2 bottom-2 grid h-10 w-10 place-items-center rounded-full bg-zamrud-700 text-white shadow-lg md:hidden"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3 md:p-4">
        {p.kategori_nama && <p className="text-[11px] font-bold tracking-wide text-tanah uppercase">{p.kategori_nama}</p>}
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.6em] text-sm leading-snug font-bold text-slate-800">{p.nama}</h3>
        <div className="mt-1 flex items-center gap-1.5">
          <Stars nilai={p.rating_avg} ukuran="h-3.5 w-3.5" />
          <span className="text-xs font-semibold text-slate-500">
            {p.rating_avg > 0 ? p.rating_avg.toFixed(1) : "Baru"} ({p.rating_count})
          </span>
        </div>
        <div className="mt-2">
          <p className="text-lg font-extrabold text-zamrud-800">{rupiah(hargaFinal)}</p>
          {p.harga_diskon && (
            <p className="text-xs text-slate-400">
              <span className="line-through">{rupiah(p.harga_dasar)}</span>
              <span className="ml-1.5 font-bold text-emas-600">Hemat {hemat}%</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
