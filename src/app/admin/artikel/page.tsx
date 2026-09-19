"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { KotakSkeleton } from "@/components/Skeletons";
import { tanggalID } from "@/lib/format";
import { useToast } from "@/store/toast";

type Artikel = { id: number; slug: string; judul: string; ringkasan: string; konten: string; gambar_url: string; kategori: string; created_at: string };
const FORM = { judul: "", ringkasan: "", konten: "", gambar_url: "", kategori: "Panduan" };

export default function AdminArtikel() {
  const tampil = useToast((s) => s.tampil);
  const [daftar, setDaftar] = useState<Artikel[] | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM);
  const [editId, setEditId] = useState(0);

  function muat() {
    fetch("/api/admin/artikel").then((r) => r.json()).then((d) => setDaftar(d.artikel ?? [])).catch(() => setDaftar([]));
  }
  useEffect(() => muat(), []);

  async function simpan() {
    if (!form.judul) return tampil("error", "Judul artikel wajib diisi.");
    const url = editId ? `/api/admin/artikel/${editId}` : "/api/admin/artikel";
    const res = await fetch(url, {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      tampil("sukses", editId ? "Artikel diperbarui." : "Artikel baru diterbitkan.");
      setModal(false);
      setForm(FORM);
      setEditId(0);
      muat();
    } else tampil("error", "Gagal menyimpan artikel.");
  }

  const inputCls = "w-full rounded-xl border-2 border-krem-tua bg-krem px-3.5 py-2.5 text-sm outline-none focus:border-zamrud-500";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Manajemen Artikel</h1>
        <button onClick={() => { setForm(FORM); setEditId(0); setModal(true); }} className="flex items-center gap-1.5 rounded-xl bg-zamrud-700 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-zamrud-600">
          <Plus className="h-4 w-4" /> Tulis Artikel
        </button>
      </div>
      <div className="space-y-3">
        {!daftar
          ? Array.from({ length: 3 }).map((_, i) => <KotakSkeleton key={i} className="h-20" />)
          : daftar.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-krem-tua bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-zamrud-800">{a.judul}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{a.ringkasan}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{a.kategori} • {tanggalID(a.created_at)}</p>
                </div>
                <button
                  onClick={() => { setEditId(a.id); setForm({ judul: a.judul, ringkasan: a.ringkasan, konten: a.konten, gambar_url: a.gambar_url, kategori: a.kategori }); setModal(true); }}
                  className="rounded-full border-2 border-zamrud-700/30 px-4 py-1.5 text-xs font-extrabold text-zamrud-800 hover:bg-zamrud-50"
                >
                  Ubah
                </button>
              </div>
            ))}
      </div>

      <Modal buka={modal} tutup={() => setModal(false)} judul={editId ? "Ubah Artikel" : "Tulis Artikel Baru"} lebar="max-w-2xl">
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Judul</label>
            <input className={inputCls} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Kategori</label>
              <input className={inputCls} value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} /></div>
            <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">URL Gambar</label>
              <input className={inputCls} value={form.gambar_url} onChange={(e) => setForm({ ...form, gambar_url: e.target.value })} /></div>
          </div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Ringkasan</label>
            <input className={inputCls} value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Konten (pisahkan paragraf dengan baris kosong)</label>
            <textarea rows={8} className={inputCls} value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} /></div>
        </div>
        <button onClick={simpan} className="mt-4 w-full rounded-2xl bg-zamrud-700 py-3.5 font-extrabold text-white hover:bg-zamrud-600">
          {editId ? "Simpan Perubahan" : "Terbitkan Artikel"}
        </button>
      </Modal>
    </div>
  );
}
