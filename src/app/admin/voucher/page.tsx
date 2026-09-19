"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { rupiah, tanggalID } from "@/lib/format";
import { Modal } from "@/components/Modal";
import { KotakSkeleton } from "@/components/Skeletons";
import { useToast } from "@/store/toast";

type Voucher = {
  id: number; kode: string; tipe: string; nilai: number; minimal_order: number;
  maksimal_diskon: number; kuota: number; terpakai: number; mulai: string; berakhir: string; aktif: boolean;
};
const FORM = { kode: "", tipe: "persen", nilai: "10", minimal_order: "99000", maksimal_diskon: "0", kuota: "100", mulai: "", berakhir: "" };

export default function AdminVoucher() {
  const tampil = useToast((s) => s.tampil);
  const [daftar, setDaftar] = useState<Voucher[] | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM);

  function muat() {
    fetch("/api/admin/voucher").then((r) => r.json()).then((d) => setDaftar(d.voucher ?? [])).catch(() => setDaftar([]));
  }
  useEffect(() => muat(), []);

  async function tambah() {
    const res = await fetch("/api/admin/voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, nilai: Number(form.nilai), minimal_order: Number(form.minimal_order), maksimal_diskon: Number(form.maksimal_diskon), kuota: Number(form.kuota) }),
    });
    if (res.ok) {
      tampil("sukses", "Voucher baru berhasil ditambahkan.");
      setModal(false);
      setForm(FORM);
      muat();
    } else tampil("error", "Gagal menambahkan voucher.");
  }

  async function toggle(v: Voucher) {
    await fetch(`/api/admin/voucher/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !v.aktif }),
    });
    muat();
  }

  const inputCls = "w-full rounded-xl border-2 border-krem-tua bg-krem px-3.5 py-2.5 text-sm outline-none focus:border-zamrud-500";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Manajemen Voucher</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-xl bg-zamrud-700 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-zamrud-600">
          <Plus className="h-4 w-4" /> Tambah Voucher
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-krem-tua bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-krem text-left text-xs font-extrabold tracking-wide text-tanah uppercase">
              <th className="px-4 py-3">Kode</th><th className="px-4 py-3">Nilai</th><th className="px-4 py-3">Minimal</th>
              <th className="px-4 py-3">Kuota</th><th className="px-4 py-3">Berlaku</th><th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {!daftar ? (
              <tr><td colSpan={6} className="p-6"><KotakSkeleton className="h-28" /></td></tr>
            ) : (
              daftar.map((v) => (
                <tr key={v.id} className="border-t border-krem-tua hover:bg-krem/50">
                  <td className="px-4 py-3 font-extrabold tracking-wider text-zamrud-800">{v.kode}</td>
                  <td className="px-4 py-3 font-bold">{v.tipe === "persen" ? `${v.nilai}%` : rupiah(v.nilai)}{v.tipe === "persen" && v.maksimal_diskon > 0 ? ` (maks ${rupiah(v.maksimal_diskon)})` : ""}</td>
                  <td className="px-4 py-3">{rupiah(v.minimal_order)}</td>
                  <td className="px-4 py-3">{v.terpakai}/{v.kuota}</td>
                  <td className="px-4 py-3 text-xs">{tanggalID(v.mulai)} — {tanggalID(v.berakhir)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(v)} className={`rounded-full px-3.5 py-1 text-[11px] font-extrabold ${v.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                      {v.aktif ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal buka={modal} tutup={() => setModal(false)} judul="Tambah Voucher Baru">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Kode Voucher</label>
            <input className={inputCls + " uppercase"} value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })} placeholder="Contoh: LEBARAN25" /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Tipe</label>
            <select className={inputCls} value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
              <option value="persen">Persen (%)</option><option value="nominal">Nominal (Rp)</option>
            </select></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Nilai</label>
            <input type="number" className={inputCls} value={form.nilai} onChange={(e) => setForm({ ...form, nilai: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Minimal Order (Rp)</label>
            <input type="number" className={inputCls} value={form.minimal_order} onChange={(e) => setForm({ ...form, minimal_order: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Maksimal Diskon (Rp)</label>
            <input type="number" className={inputCls} value={form.maksimal_diskon} onChange={(e) => setForm({ ...form, maksimal_diskon: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Kuota Pemakaian</label>
            <input type="number" className={inputCls} value={form.kuota} onChange={(e) => setForm({ ...form, kuota: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Mulai</label>
            <input type="date" className={inputCls} value={form.mulai} onChange={(e) => setForm({ ...form, mulai: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Berakhir</label>
            <input type="date" className={inputCls} value={form.berakhir} onChange={(e) => setForm({ ...form, berakhir: e.target.value })} /></div>
        </div>
        <button onClick={tambah} className="mt-5 w-full rounded-2xl bg-zamrud-700 py-3.5 font-extrabold text-white hover:bg-zamrud-600">Simpan Voucher</button>
      </Modal>
    </div>
  );
}
