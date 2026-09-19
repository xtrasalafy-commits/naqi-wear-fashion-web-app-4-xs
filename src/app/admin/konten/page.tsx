"use client";
import { useEffect, useState } from "react";
import { KotakSkeleton } from "@/components/Skeletons";
import { useToast } from "@/store/toast";

type Konten = { kunci: string; judul: string; konten: string };

export default function AdminKonten() {
  const tampil = useToast((s) => s.tampil);
  const [daftar, setDaftar] = useState<Konten[] | null>(null);
  const [aktif, setAktif] = useState<Konten | null>(null);

  useEffect(() => {
    fetch("/api/admin/konten")
      .then((r) => r.json())
      .then((d) => {
        setDaftar(d.konten ?? []);
        if (d.konten?.length) setAktif(d.konten[0]);
      })
      .catch(() => setDaftar([]));
  }, []);

  async function simpan() {
    if (!aktif) return;
    const res = await fetch("/api/admin/konten", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kunci: aktif.kunci, judul: aktif.judul, konten: aktif.konten }),
    });
    if (res.ok) tampil("sukses", "Konten berhasil disimpan.");
    else tampil("error", "Gagal menyimpan konten.");
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold text-zamrud-800">Manajemen Konten</h1>
      <p className="text-sm text-slate-500">Kelola halaman statis: Tentang, Syarat & Ketentuan, Kebijakan Retur, dan FAQ.</p>
      {!daftar ? (
        <KotakSkeleton className="h-64" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-1">
            {daftar.map((k) => (
              <button
                key={k.kunci}
                onClick={() => setAktif(k)}
                className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-extrabold transition ${
                  aktif?.kunci === k.kunci ? "bg-zamrud-700 text-white" : "bg-white text-zamrud-800 hover:bg-krem"
                }`}
              >
                {k.judul}
              </button>
            ))}
          </div>
          {aktif && (
            <div className="rounded-2xl border border-krem-tua bg-white p-5 lg:col-span-3">
              <label className="mb-1 block text-xs font-extrabold text-zamrud-800">Judul Halaman</label>
              <input
                value={aktif.judul}
                onChange={(e) => setAktif({ ...aktif, judul: e.target.value })}
                className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 text-sm font-bold outline-none focus:border-zamrud-500"
              />
              <label className="mt-4 mb-1 block text-xs font-extrabold text-zamrud-800">Isi Konten</label>
              <textarea
                rows={14}
                value={aktif.konten}
                onChange={(e) => setAktif({ ...aktif, konten: e.target.value })}
                className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 text-sm leading-relaxed outline-none focus:border-zamrud-500"
              />
              <button onClick={simpan} className="mt-4 rounded-2xl bg-zamrud-700 px-8 py-3 font-extrabold text-white hover:bg-zamrud-600">
                Simpan Konten
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
