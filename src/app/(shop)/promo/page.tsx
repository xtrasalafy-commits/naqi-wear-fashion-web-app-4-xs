"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Gift, TicketPercent } from "lucide-react";
import { rupiah, tanggalID } from "@/lib/format";
import { KotakSkeleton } from "@/components/Skeletons";
import { useToast } from "@/store/toast";

type VoucherTipe = {
  id: number; kode: string; tipe: string; nilai: number;
  minimal_order: number; maksimal_diskon: number; mulai: string; berakhir: string;
};

export default function HalamanPromo() {
  const tampil = useToast((s) => s.tampil);
  const [voucher, setVoucher] = useState<VoucherTipe[] | null>(null);

  useEffect(() => {
    fetch("/api/promo").then((r) => r.json()).then((d) => setVoucher(d.voucher ?? [])).catch(() => setVoucher([]));
  }, []);

  function salin(kode: string) {
    navigator.clipboard.writeText(kode).then(
      () => tampil("sukses", `Kode ${kode} berhasil disalin. Tempel saat checkout.`),
      () => tampil("info", `Gunakan kode: ${kode}`)
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emas-100 text-tanah">
          <Gift className="h-8 w-8" />
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold text-zamrud-800">Promo & Voucher</h1>
        <p className="mx-auto mt-2 max-w-lg text-slate-500">
          Salin kode di bawah ini dan gunakan saat checkout. Semua voucher gratis, tanpa syarat tersembunyi.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {!voucher
          ? Array.from({ length: 4 }).map((_, i) => <KotakSkeleton key={i} className="h-44" />)
          : voucher.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-2xl border-2 border-dashed border-emas-400 bg-white">
                <div className="bg-gradient-to-r from-zamrud-700 to-zamrud-600 px-5 py-3">
                  <p className="flex items-center gap-2 text-2xl font-extrabold tracking-widest text-emas-300">
                    <TicketPercent className="h-6 w-6" /> {v.kode}
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-xl font-extrabold text-zamrud-800">
                    {v.tipe === "persen" ? `Diskon ${v.nilai}%` : `Potongan ${rupiah(v.nilai)}`}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-500">
                    <li>Minimal belanja {rupiah(v.minimal_order)}</li>
                    {v.maksimal_diskon > 0 && v.tipe === "persen" && <li>Maksimal diskon {rupiah(v.maksimal_diskon)}</li>}
                    <li>Berlaku hingga {tanggalID(v.berakhir)}</li>
                  </ul>
                  <button
                    onClick={() => salin(v.kode)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emas-400 py-3 font-extrabold text-zamrud-900 transition hover:bg-emas-300"
                  >
                    <Copy className="h-4 w-4" /> Salin Kode
                  </button>
                </div>
              </div>
            ))}
      </div>

      {voucher && voucher.length === 0 && (
        <p className="mt-8 rounded-2xl bg-white p-10 text-center text-slate-500">Belum ada voucher aktif. Cek kembali nanti ya.</p>
      )}

      <div className="mt-8 text-center">
        <Link href="/katalog?promo=1" className="inline-block rounded-full bg-zamrud-700 px-8 py-3.5 font-extrabold text-white transition hover:bg-zamrud-600">
          Belanja Produk Diskon Sekarang
        </Link>
      </div>
    </div>
  );
}
