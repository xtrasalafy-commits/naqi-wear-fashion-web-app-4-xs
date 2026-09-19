"use client";
import { useEffect, useState } from "react";
import { rupiah, tanggalID } from "@/lib/format";
import { KotakSkeleton } from "@/components/Skeletons";

type Pelanggan = {
  id: number; nama: string; email: string; nomor_wa: string; created_at: string;
  jumlah_pesanan: number; total_belanja: number;
};

export default function AdminPelanggan() {
  const [daftar, setDaftar] = useState<Pelanggan[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/pelanggan").then((r) => r.json()).then((d) => setDaftar(d.pelanggan ?? [])).catch(() => setDaftar([]));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold text-zamrud-800">Manajemen Pelanggan</h1>
      <div className="overflow-x-auto rounded-2xl border border-krem-tua bg-white">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-krem text-left text-xs font-extrabold tracking-wide text-tanah uppercase">
              <th className="px-4 py-3">Pelanggan</th><th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Daftar</th><th className="px-4 py-3">Pesanan</th><th className="px-4 py-3">Total Belanja</th>
            </tr>
          </thead>
          <tbody>
            {!daftar ? (
              <tr><td colSpan={5} className="p-6"><KotakSkeleton className="h-32" /></td></tr>
            ) : daftar.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Belum ada pelanggan terdaftar.</td></tr>
            ) : (
              daftar.map((p) => (
                <tr key={p.id} className="border-t border-krem-tua hover:bg-krem/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zamrud-700 text-sm font-bold text-emas-300">{p.nama.charAt(0)}</span>
                      <div>
                        <p className="font-extrabold text-zamrud-800">{p.nama}</p>
                        <p className="text-[11px] text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.nomor_wa || "—"}</td>
                  <td className="px-4 py-3">{tanggalID(p.created_at)}</td>
                  <td className="px-4 py-3 font-bold">{p.jumlah_pesanan}</td>
                  <td className="px-4 py-3 font-extrabold text-zamrud-800">{rupiah(p.total_belanja)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
