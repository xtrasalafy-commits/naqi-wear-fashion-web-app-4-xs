"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { Modal } from "@/components/Modal";
import { KotakSkeleton } from "@/components/Skeletons";
import { useToast } from "@/store/toast";

type Banner = { id: number; judul: string; subjudul: string; gambar_url: string; tautan: string; urutan: number; aktif: boolean };
const FORM = { judul: "", subjudul: "", gambar_url: "", tautan: "/katalog", urutan: "99" };

export default function AdminBanner() {
  const tampil = useToast((s) => s.tampil);
  const [daftar, setDaftar] = useState<Banner[] | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM);

  function muat() {
    fetch("/api/admin/banner").then((r) => r.json()).then((d) => setDaftar(d.banner ?? [])).catch(() => setDaftar([]));
  }
  useEffect(() => muat(), []);

  async function tambah() {
    const res = await fetch("/api/admin/banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, urutan: Number(form.urutan) }),
    });
    if (res.ok) {
      tampil("sukses", "Banner berhasil ditambahkan.");
      setModal(false);
      setForm(FORM);
      muat();
    } else tampil("error", "Judul dan gambar wajib diisi.");
  }

  async function toggle(b: Banner) {
    await fetch(`/api/admin/banner/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !b.aktif }),
    });
    muat();
  }

  const inputCls = "w-full rounded-xl border-2 border-krem-tua bg-krem px-3.5 py-2.5 text-sm outline-none focus:border-zamrud-500";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Manajemen Banner</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-xl bg-zamrud-700 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-zamrud-600">
          <Plus className="h-4 w-4" /> Tambah Banner
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {!daftar
          ? Array.from({ length: 4 }).map((_, i) => <KotakSkeleton key={i} className="h-44" />)
          : daftar.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-2xl border border-krem-tua bg-white">
                <div className="relative h-36 bg-krem-tua">
                  <ImageLoader src={b.gambar_url} alt={b.judul} className="h-full w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-zamrud-800/80 px-2.5 py-1 text-[10px] font-extrabold text-white">Urutan {b.urutan}</span>
                </div>
                <div className="p-4">
                  <p className="font-extrabold text-zamrud-800">{b.judul}</p>
                  <p className="text-xs text-slate-500">{b.subjudul}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Tautan: {b.tautan}</p>
                  <button onClick={() => toggle(b)} className={`mt-3 rounded-full px-4 py-1.5 text-xs font-extrabold ${b.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                    {b.aktif ? "Aktif" : "Nonaktif"}
                  </button>
                </div>
              </div>
            ))}
      </div>

      <Modal buka={modal} tutup={() => setModal(false)} judul="Tambah Banner Baru">
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Judul Banner</label>
            <input className={inputCls} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Subjudul</label>
            <input className={inputCls} value={form.subjudul} onChange={(e) => setForm({ ...form, subjudul: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">URL Gambar (Drive/Pexels)</label>
            <input className={inputCls} value={form.gambar_url} onChange={(e) => setForm({ ...form, gambar_url: e.target.value })} placeholder="https://…" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Tautan</label>
              <input className={inputCls} value={form.tautan} onChange={(e) => setForm({ ...form, tautan: e.target.value })} /></div>
            <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Urutan</label>
              <input type="number" className={inputCls} value={form.urutan} onChange={(e) => setForm({ ...form, urutan: e.target.value })} /></div>
          </div>
        </div>
        <button onClick={tambah} className="mt-5 w-full rounded-2xl bg-zamrud-700 py-3.5 font-extrabold text-white hover:bg-zamrud-600">Simpan Banner</button>
      </Modal>
    </div>
  );
}
