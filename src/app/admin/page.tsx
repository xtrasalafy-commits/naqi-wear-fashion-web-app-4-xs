"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, Package, ShoppingBag, Users } from "lucide-react";
import { rupiah, tanggalJamID, LABEL_STATUS_PESANAN, warnaStatusPesanan } from "@/lib/format";
import { KotakSkeleton } from "@/components/Skeletons";

type Statistik = {
  penjualan_hari_ini: number;
  pesanan_baru: number;
  pelanggan_baru: number;
  produk_terjual: number;
  grafik: Array<{ hari: string; total: number }>;
  pesanan_terbaru: Array<{
    id: number; nomor_pesanan: string; total: number; status_pesanan: string; created_at: string; nama: string;
  }>;
};

function GrafikGaris({ data }: { data: Array<{ hari: string; total: number }> }) {
  const W = 640, H = 200, PAD = 30;
  const maks = Math.max(...data.map((d) => d.total), 1);
  const titik = data.map((d, i) => ({
    x: PAD + (i * (W - PAD * 2)) / Math.max(data.length - 1, 1),
    y: H - PAD - (d.total / maks) * (H - PAD * 2),
  }));
  const garis = titik.map((t, i) => `${i === 0 ? "M" : "L"}${t.x},${t.y}`).join(" ");
  const area = `${garis} L${titik[titik.length - 1].x},${H - PAD} L${titik[0].x},${H - PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - f * (H - PAD * 2)} y2={H - PAD - f * (H - PAD * 2)} stroke="#ece5d3" strokeWidth="1" />
      ))}
      <path d={area} fill="#d4af37" opacity="0.15" />
      <path d={garis} fill="none" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" />
      {titik.map((t, i) => (
        <g key={i}>
          <circle cx={t.x} cy={t.y} r="4.5" fill="#d4af37" stroke="#1b4332" strokeWidth="2" />
          <text x={t.x} y={H - 8} textAnchor="middle" fontSize="11" fill="#6d4c3d" fontWeight="700">{data[i].hari}</text>
          {data[i].total > 0 && (
            <text x={t.x} y={t.y - 10} textAnchor="middle" fontSize="10" fill="#1b4332" fontWeight="800">
              {(data[i].total / 1000).toFixed(0)}rb
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<Statistik | null>(null);

  useEffect(() => {
    fetch("/api/admin/statistik").then((r) => r.json()).then(setData).catch(() => setData(null));
  }, []);

  const kartu = data
    ? [
        { Ikon: Banknote, label: "Penjualan Hari Ini", nilai: rupiah(data.penjualan_hari_ini), warna: "bg-zamrud-700 text-white" },
        { Ikon: ShoppingBag, label: "Pesanan Baru", nilai: String(data.pesanan_baru), warna: "bg-emas-400 text-zamrud-900" },
        { Ikon: Users, label: "Pelanggan Baru", nilai: String(data.pelanggan_baru), warna: "bg-tanah text-white" },
        { Ikon: Package, label: "Produk Terjual", nilai: String(data.produk_terjual), warna: "bg-zamrud-100 text-zamrud-800" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-zamrud-800">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {!data
          ? Array.from({ length: 4 }).map((_, i) => <KotakSkeleton key={i} className="h-28" />)
          : kartu.map(({ Ikon, label, nilai, warna }) => (
              <div key={label} className={`rounded-2xl p-5 shadow-sm ${warna}`}>
                <Ikon className="h-6 w-6 opacity-80" />
                <p className="mt-3 text-2xl font-extrabold">{nilai}</p>
                <p className="text-xs font-bold opacity-80">{label}</p>
              </div>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-krem-tua bg-white p-5 lg:col-span-3">
          <p className="font-display text-xl font-bold text-zamrud-800">Penjualan 7 Hari Terakhir</p>
          {data ? <GrafikGaris data={data.grafik} /> : <KotakSkeleton className="mt-4 h-52" />}
        </div>
        <div className="rounded-2xl border border-krem-tua bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl font-bold text-zamrud-800">5 Pesanan Terbaru</p>
            <Link href="/admin/pesanan" className="text-xs font-bold text-emas-600 hover:underline">Lihat semua</Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {!data
              ? Array.from({ length: 5 }).map((_, i) => <KotakSkeleton key={i} className="h-14" />)
              : data.pesanan_terbaru.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-krem px-3.5 py-2.5">
                    <div>
                      <p className="text-sm font-extrabold text-zamrud-800">{p.nomor_pesanan}</p>
                      <p className="text-[11px] text-slate-500">{p.nama} • {tanggalJamID(p.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold">{rupiah(p.total)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${warnaStatusPesanan(p.status_pesanan)}`}>
                        {LABEL_STATUS_PESANAN[p.status_pesanan]}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
