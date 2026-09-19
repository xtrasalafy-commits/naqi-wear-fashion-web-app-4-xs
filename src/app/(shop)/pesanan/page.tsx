"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { KotakSkeleton } from "@/components/Skeletons";
import { rupiah, tanggalID, LABEL_STATUS_PESANAN, warnaStatusPesanan } from "@/lib/format";
import { useAuth } from "@/store/auth";

type PesananTipe = {
  id: number;
  nomor_pesanan: string;
  total: number;
  status_pesanan: string;
  status_pembayaran: string;
  created_at: string;
  items: Array<{ gambar_url: string; snapshot_nama: string; qty: number }>;
};

export default function HalamanPesanan() {
  const { user, dimuat, muat } = useAuth();
  const [pesanan, setPesanan] = useState<PesananTipe[] | null>(null);

  useEffect(() => {
    if (!dimuat) muat();
  }, [dimuat, muat]);

  useEffect(() => {
    if (user) fetch("/api/pesanan").then((r) => r.json()).then((d) => setPesanan(d.pesanan ?? [])).catch(() => setPesanan([]));
  }, [user]);

  if (!dimuat) return <div className="p-16" />;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Pesanan Saya</h1>
        <p className="mt-2 text-slate-500">Silakan masuk untuk melihat daftar pesanan Anda.</p>
        <Link href="/masuk" className="mt-5 inline-block rounded-full bg-zamrud-700 px-8 py-3 font-extrabold text-white hover:bg-zamrud-600">Masuk</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Pesanan Saya</h1>
      <div className="mt-6 space-y-4">
        {!pesanan ? (
          Array.from({ length: 3 }).map((_, i) => <KotakSkeleton key={i} className="h-28" />)
        ) : pesanan.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center">
            <Package className="mx-auto h-14 w-14 text-krem-tua" />
            <p className="mt-3 font-display text-2xl font-bold text-zamrud-800">Belum ada pesanan</p>
            <p className="mt-1 text-slate-500">Yuk mulai belanja produk syar&apos;i favorit Anda.</p>
            <Link href="/katalog" className="mt-4 inline-block rounded-full bg-zamrud-700 px-8 py-3 font-extrabold text-white hover:bg-zamrud-600">Belanja Sekarang</Link>
          </div>
        ) : (
          pesanan.map((p) => (
            <Link key={p.id} href={`/pesanan/${p.nomor_pesanan}`} className="block rounded-2xl border border-krem-tua bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-extrabold text-zamrud-800">{p.nomor_pesanan}</p>
                  <p className="text-xs text-slate-400">{tanggalID(p.created_at)}</p>
                </div>
                <span className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold ${warnaStatusPesanan(p.status_pesanan)}`}>
                  {LABEL_STATUS_PESANAN[p.status_pesanan] ?? p.status_pesanan}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {p.items.slice(0, 4).map((it, i) => (
                  <ImageLoader key={i} src={it.gambar_url} alt={it.snapshot_nama} className="h-14 w-14 rounded-lg object-cover" />
                ))}
                {p.items.length > 4 && <span className="text-xs font-bold text-slate-400">+{p.items.length - 4} produk</span>}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-krem-tua pt-3">
                <p className="text-sm text-slate-500">{p.items.reduce((a, i) => a + i.qty, 0)} barang</p>
                <p className="text-lg font-extrabold text-zamrud-800">{rupiah(p.total)}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
