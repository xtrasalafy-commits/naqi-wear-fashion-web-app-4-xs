"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, TicketPercent } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { QtyInput } from "@/components/QtyInput";
import { ProductCard, type ProdukKartu } from "@/components/ProductCard";
import { rupiah } from "@/lib/format";
import { useCart, subtotalKeranjang } from "@/store/cart";
import { useToast } from "@/store/toast";

export default function HalamanKeranjang() {
  const router = useRouter();
  const { items, ubahQty, hapus } = useCart();
  const tampil = useToast((s) => s.tampil);
  const [rekomendasi, setRekomendasi] = useState<ProdukKartu[]>([]);
  const [kode, setKode] = useState("");
  const [voucher, setVoucher] = useState<{ kode: string; diskon: number } | null>(() => {
    if (typeof window === "undefined") return null;
    const s = sessionStorage.getItem("naqi-voucher");
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    fetch("/api/katalog?urut=terlaris&limit=8")
      .then((r) => r.json())
      .then((d) => setRekomendasi(d.items ?? []))
      .catch(() => undefined);
  }, []);

  const subtotal = subtotalKeranjang(items);
  const diskon = voucher?.diskon ?? 0;
  const total = Math.max(subtotal - diskon, 0);
  const dalamKeranjang = new Set(items.map((i) => i.productId));

  async function pakaiVoucher() {
    const res = await fetch("/api/voucher/cek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kode, subtotal }),
    });
    const d = await res.json();
    if (res.ok) {
      const v = { kode: d.kupon.kode, diskon: d.diskon };
      setVoucher(v);
      sessionStorage.setItem("naqi-voucher", JSON.stringify(v));
      tampil("sukses", `Voucher ${v.kode} berhasil dipakai! Hemat ${rupiah(v.diskon)}.`);
    } else {
      setVoucher(null);
      sessionStorage.removeItem("naqi-voucher");
      tampil("error", d.error ?? "Voucher tidak valid.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-krem-tua" />
        <h1 className="mt-4 font-display text-3xl font-bold text-zamrud-800">Keranjang Masih Kosong</h1>
        <p className="mt-2 text-slate-500">Yuk mulai belanja. Koleksi terbaik kami sudah menanti Anda.</p>
        <Link href="/katalog" className="mt-6 inline-block rounded-full bg-zamrud-700 px-8 py-3.5 font-extrabold text-white transition hover:bg-zamrud-600">
          Belanja Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <h1 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Keranjang Belanja</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((i) => (
            <div key={i.variantId} className="flex gap-4 rounded-2xl border border-krem-tua bg-white p-4">
              <Link href={`/produk/${i.slug}`} className="shrink-0">
                <ImageLoader src={i.gambar} alt={i.nama} className="h-24 w-24 rounded-xl object-cover md:h-28 md:w-28" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/produk/${i.slug}`} className="line-clamp-2 font-bold text-zamrud-800 hover:underline">{i.nama}</Link>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{i.warna} • {i.ukuran}</p>
                <p className="mt-1 text-lg font-extrabold text-zamrud-800">{rupiah(i.harga)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <QtyInput nilai={i.qty} ubah={(n) => ubahQty(i.variantId, n)} max={Math.max(i.stok, 1)} />
                  <p className="text-sm font-bold text-tanah">Subtotal: {rupiah(i.harga * i.qty)}</p>
                  <button
                    onClick={() => { hapus(i.variantId); tampil("info", "Produk dihapus dari keranjang."); }}
                    className="ml-auto flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}

          {rekomendasi.length > 0 && (
            <div className="pt-4">
              <h2 className="font-display text-xl font-bold text-zamrud-800">Lengkapi Belanja Anda</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {rekomendasi.filter((r) => !dalamKeranjang.has(r.id)).slice(0, 4).map((r) => (
                  <ProductCard key={r.id} p={r} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-fit space-y-4 lg:sticky lg:top-40">
          <div className="rounded-2xl border border-krem-tua bg-white p-5">
            <p className="flex items-center gap-2 font-extrabold text-zamrud-800">
              <TicketPercent className="h-5 w-5 text-emas-500" /> Punya Kode Voucher?
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())} placeholder="Contoh: NAQI15"
                className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-2.5 text-sm font-bold uppercase outline-none focus:border-zamrud-500"
              />
              <button onClick={pakaiVoucher} className="rounded-xl bg-zamrud-700 px-5 text-sm font-bold text-white hover:bg-zamrud-600">
                Gunakan
              </button>
            </div>
            {voucher && <p className="mt-2 text-xs font-bold text-emerald-600">Voucher {voucher.kode} aktif, hemat {rupiah(voucher.diskon)}.</p>}
          </div>

          <div className="rounded-2xl border border-krem-tua bg-white p-5">
            <p className="font-display text-xl font-bold text-zamrud-800">Ringkasan Belanja</p>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal ({items.length} produk)</dt><dd className="font-bold">{rupiah(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Ongkir</dt><dd className="font-bold text-slate-400">Dihitung saat checkout</dd></div>
              {diskon > 0 && (
                <div className="flex justify-between text-emerald-600"><dt>Diskon voucher</dt><dd className="font-bold">− {rupiah(diskon)}</dd></div>
              )}
              <div className="flex justify-between border-t border-krem-tua pt-3 text-base">
                <dt className="font-extrabold text-zamrud-800">Total</dt>
                <dd className="font-extrabold text-zamrud-800">{rupiah(total)}</dd>
              </div>
            </dl>
            <button
              onClick={() => router.push("/checkout")}
              className="mt-5 w-full rounded-2xl bg-emas-400 py-4 text-base font-extrabold text-zamrud-900 shadow-md transition hover:scale-[1.02] hover:bg-emas-300"
            >
              Lanjut ke Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
