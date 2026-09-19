"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { rupiah } from "@/lib/format";
import { useToast } from "@/store/toast";

export default function AdminLaporan() {
  const tampil = useToast((s) => s.tampil);
  const hariIni = new Date().toISOString().slice(0, 10);
  const bulanLalu = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const [dari, setDari] = useState(bulanLalu);
  const [sampai, setSampai] = useState(hariIni);
  const [produkTerlaris, setProdukTerlaris] = useState<Array<{ nama: string; qty: string; omzet: string }>>([]);

  async function muatTerlaris() {
    const res = await fetch(`/api/admin/laporan?tipe=produk&dari=${dari}&sampai=${sampai}`);
    const teks = await res.text();
    const baris = teks.trim().split("\n").slice(1);
    setProdukTerlaris(
      baris.filter(Boolean).map((b) => {
        const [nama, qty, omzet] = b.split(";");
        return { nama, qty, omzet };
      })
    );
    tampil("sukses", "Data produk terlaris dimuat.");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-zamrud-800">Laporan & Ekspor</h1>

      <div className="rounded-2xl border border-krem-tua bg-white p-6">
        <p className="font-display text-xl font-bold text-zamrud-800">Pilih Rentang Tanggal</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-extrabold text-zamrud-800">Dari Tanggal</label>
            <input type="date" value={dari} onChange={(e) => setDari(e.target.value)}
              className="rounded-xl border-2 border-krem-tua bg-krem px-4 py-2.5 text-sm outline-none focus:border-zamrud-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-extrabold text-zamrud-800">Sampai Tanggal</label>
            <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)}
              className="rounded-xl border-2 border-krem-tua bg-krem px-4 py-2.5 text-sm outline-none focus:border-zamrud-500" />
          </div>
          <a
            href={`/api/admin/laporan?tipe=penjualan&dari=${dari}&sampai=${sampai}`}
            className="flex items-center gap-2 rounded-xl bg-zamrud-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-zamrud-600"
          >
            <Download className="h-4 w-4" /> Ekspor CSV Penjualan
          </a>
          <button onClick={muatTerlaris} className="flex items-center gap-2 rounded-xl bg-emas-400 px-6 py-3 text-sm font-extrabold text-zamrud-900 hover:bg-emas-300">
            Lihat Produk Terlaris
          </button>
        </div>
        <a href={`/api/admin/laporan?tipe=produk&dari=${dari}&sampai=${sampai}`} className="mt-3 inline-block text-xs font-bold text-tanah hover:underline">
          ↓ Unduh CSV produk terlaris
        </a>
      </div>

      {produkTerlaris.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-krem-tua bg-white">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-krem text-left text-xs font-extrabold tracking-wide text-tanah uppercase">
                <th className="px-4 py-3">Produk</th><th className="px-4 py-3">Terjual</th><th className="px-4 py-3">Omzet</th>
              </tr>
            </thead>
            <tbody>
              {produkTerlaris.map((p, i) => (
                <tr key={i} className="border-t border-krem-tua">
                  <td className="px-4 py-3 font-bold text-zamrud-800">{p.nama}</td>
                  <td className="px-4 py-3 font-extrabold">{p.qty} pcs</td>
                  <td className="px-4 py-3 font-extrabold text-emas-600">{rupiah(Number(p.omzet))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
