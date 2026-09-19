"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RotateCcw, Search, Truck } from "lucide-react";
import { rupiah, tanggalJamID, LABEL_STATUS_PESANAN, warnaStatusPesanan } from "@/lib/format";
import { Modal } from "@/components/Modal";
import { KotakSkeleton } from "@/components/Skeletons";
import { useToast } from "@/store/toast";

type PesananAdmin = {
  id: number; nomor_pesanan: string; total: number; kurir: string; layanan: string; resi: string;
  metode_bayar: string; status_pembayaran: string; status_pesanan: string; catatan: string;
  snapshot_alamat: Record<string, string>; created_at: string; nama: string;
};

const STATUS_FILTER = ["", "menunggu_pembayaran", "dibayar", "diproses", "dikemas", "dikirim", "selesai", "dibatalkan", "retur_diajukan"];

export default function AdminPesanan() {
  const tampil = useToast((s) => s.tampil);
  const [daftar, setDaftar] = useState<PesananAdmin[] | null>(null);
  const [filter, setFilter] = useState("");
  const [cari, setCari] = useState("");
  const [detail, setDetail] = useState<PesananAdmin | null>(null);
  const [resi, setResi] = useState("");

  const muat = useCallback(() => {
    fetch(`/api/admin/pesanan${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => setDaftar(d.pesanan ?? []))
      .catch(() => setDaftar([]));
  }, [filter]);

  useEffect(() => {
    muat();
  }, [muat]);

  async function ubahStatus(id: number, status: string, resiBaru?: string) {
    const res = await fetch(`/api/admin/pesanan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status_pesanan: status, resi: resiBaru }),
    });
    if (res.ok) {
      tampil("sukses", `Status pesanan diperbarui: ${LABEL_STATUS_PESANAN[status] ?? status}.`);
      muat();
      setDetail(null);
    } else tampil("error", "Gagal memperbarui status.");
  }

  async function verifikasiBayar(p: PesananAdmin) {
    const res = await fetch(`/api/admin/pesanan/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status_pembayaran: "lunas", status_pesanan: "diproses" }),
    });
    if (res.ok) {
      tampil("sukses", `Pembayaran ${p.nomor_pesanan} diverifikasi. Pesanan diproses.`);
      muat();
      setDetail(null);
    } else tampil("error", "Gagal memverifikasi pembayaran.");
  }

  const tampilkan = (daftar ?? []).filter(
    (p) => !cari || p.nomor_pesanan.toLowerCase().includes(cari.toLowerCase()) || p.nama.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Manajemen Pesanan</h1>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nomor / nama…"
            className="rounded-xl border-2 border-krem-tua bg-white py-2.5 pr-4 pl-9 text-sm outline-none focus:border-zamrud-500"
          />
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {STATUS_FILTER.map((s) => (
          <button
            key={s || "semua"}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${
              filter === s ? "bg-zamrud-700 text-white" : "border-2 border-krem-tua bg-white text-slate-600"
            }`}
          >
            {s === "" ? "Semua" : LABEL_STATUS_PESANAN[s]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-krem-tua bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-krem text-left text-xs font-extrabold tracking-wide text-tanah uppercase">
              <th className="px-4 py-3">Pesanan</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Bayar</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {!daftar ? (
              <tr><td colSpan={6} className="p-6"><KotakSkeleton className="h-24" /></td></tr>
            ) : tampilkan.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-slate-400">Tidak ada pesanan pada filter ini.</td></tr>
            ) : (
              tampilkan.map((p) => (
                <tr key={p.id} className="border-t border-krem-tua hover:bg-krem/50">
                  <td className="px-4 py-3">
                    <p className="font-extrabold text-zamrud-800">{p.nomor_pesanan}</p>
                    <p className="text-[11px] text-slate-400">{tanggalJamID(p.created_at)} • {p.kurir} {p.layanan}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.nama}</td>
                  <td className="px-4 py-3 font-extrabold">{rupiah(p.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${p.status_pembayaran === "lunas" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.status_pembayaran === "lunas" ? "Lunas" : "Menunggu"}
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-400">{p.metode_bayar}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${warnaStatusPesanan(p.status_pesanan)}`}>
                      {LABEL_STATUS_PESANAN[p.status_pesanan]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setDetail(p); setResi(p.resi); }} className="rounded-full bg-zamrud-700 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-zamrud-600">
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal buka={Boolean(detail)} tutup={() => setDetail(null)} judul={`Pesanan ${detail?.nomor_pesanan ?? ""}`} lebar="max-w-2xl">
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <p><b>Pelanggan:</b> {detail.nama}</p>
              <p><b>Total:</b> {rupiah(detail.total)} ({detail.metode_bayar})</p>
              <p className="sm:col-span-2"><b>Alamat:</b> {detail.snapshot_alamat.penerima}, {detail.snapshot_alamat.alamat}, {detail.snapshot_alamat.kota}, {detail.snapshot_alamat.provinsi} {detail.snapshot_alamat.kodepos}</p>
              {detail.catatan && <p className="sm:col-span-2"><b>Catatan:</b> {detail.catatan}</p>}
            </div>

            <div className="rounded-xl bg-krem p-4">
              <p className="font-extrabold text-zamrud-800">Ubah Status Pesanan</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {detail.status_pembayaran !== "lunas" && (
                  <button onClick={() => verifikasiBayar(detail)} className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verifikasi Pembayaran
                  </button>
                )}
                {[["diproses", "Proses"], ["dikemas", "Kemas"], ["dikirim", "Kirim"], ["selesai", "Selesai"]].map(([s, label]) => (
                  <button
                    key={s}
                    onClick={() => ubahStatus(detail.id, s, s === "dikirim" ? resi : undefined)}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                      detail.status_pesanan === s ? "bg-zamrud-700 text-white" : "border-2 border-zamrud-700/30 text-zamrud-800 hover:bg-zamrud-50"
                    }`}
                  >
                    {s === "dikirim" && <Truck className="mr-1 inline h-3.5 w-3.5" />}{label}
                  </button>
                ))}
                <button onClick={() => ubahStatus(detail.id, "dibatalkan")} className="flex items-center gap-1.5 rounded-full border-2 border-red-200 px-4 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50">
                  <RotateCcw className="h-3.5 w-3.5" /> Batalkan & Refund
                </button>
              </div>
              <div className="mt-3">
                <label className="text-xs font-extrabold text-zamrud-800">Nomor Resi ({detail.kurir})</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={resi} onChange={(e) => setResi(e.target.value)} placeholder="Contoh: JNE123456789"
                    className="w-full rounded-xl border-2 border-krem-tua bg-white px-3 py-2 text-sm outline-none focus:border-zamrud-500"
                  />
                  <button onClick={() => ubahStatus(detail.id, "dikirim", resi)} className="rounded-xl bg-zamrud-700 px-4 text-xs font-extrabold text-white hover:bg-zamrud-600">
                    Simpan & Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
