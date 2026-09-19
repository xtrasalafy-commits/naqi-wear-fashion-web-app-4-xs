"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, FilterX, SlidersHorizontal } from "lucide-react";
import { ProductCard, type ProdukKartu } from "@/components/ProductCard";
import { GridProdukSkeleton } from "@/components/Skeletons";
import { WARNA_HEX } from "@/lib/format";

const PILIHAN_UKURAN = ["S", "M", "L", "XL", "XXL", "All Size", "Jumbo", "4-6 Tahun", "7-9 Tahun", "10-12 Tahun"];
const SORTIR = [
  { nilai: "terbaru", label: "Terbaru" },
  { nilai: "terlaris", label: "Terlaris" },
  { nilai: "murah", label: "Murah" },
  { nilai: "mahal", label: "Mahal" },
  { nilai: "rating", label: "Rating" },
];

function KatalogIsi() {
  const sp = useSearchParams();
  const kategori = sp.get("kategori") ?? "";
  const cari = sp.get("cari") ?? "";
  const grupPromo = sp.get("promo") === "1";

  const [produk, setProduk] = useState<ProdukKartu[]>([]);
  const [total, setTotal] = useState(0);
  const [memuat, setMemuat] = useState(true);
  const [gagal, setGagal] = useState(false);
  const [urut, setUrut] = useState("terbaru");
  const [hargaMax, setHargaMax] = useState(700000);
  const [ukuran, setUkuran] = useState<string[]>([]);
  const [warna, setWarna] = useState<string[]>([]);
  const [hanyaPromo, setHanyaPromo] = useState(grupPromo);
  const [filterBuka, setFilterBuka] = useState(false);
  const [namaKategori, setNamaKategori] = useState<{ slug: string; nama: string; induk?: string } | null>(null);

  useEffect(() => {
    fetch("/api/kategori")
      .then((r) => r.json())
      .then((d) => {
        for (const induk of d.kategori ?? []) {
          if (induk.slug === kategori) return setNamaKategori({ slug: induk.slug, nama: induk.nama });
          const anak = (induk.anak ?? []).find((a: { slug: string }) => a.slug === kategori);
          if (anak) return setNamaKategori({ slug: anak.slug, nama: anak.nama, induk: induk.nama });
        }
        for (const khusus of ["hijab", "mukena"]) {
          if (kategori === khusus) setNamaKategori({ slug: khusus, nama: khusus === "hijab" ? "Hijab" : "Mukena" });
        }
      })
      .catch(() => undefined);
  }, [kategori]);

  const muatProduk = useCallback(
    (reset: boolean) => {
      setMemuat(true);
      setGagal(false);
      const params = new URLSearchParams();
      if (kategori) params.set("kategori", kategori);
      if (cari) params.set("cari", cari);
      params.set("urut", urut);
      params.set("max", String(hargaMax));
      params.set("limit", "12");
      params.set("offset", reset ? "0" : String(produk.length));
      if (ukuran.length) params.set("ukuran", ukuran.join(","));
      if (warna.length) params.set("warna", warna.join(","));
      if (hanyaPromo) params.set("promo", "1");
      fetch(`/api/katalog?${params.toString()}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          setProduk((lama) => (reset ? d.items : [...lama, ...d.items]));
          setTotal(d.total);
          setMemuat(false);
        })
        .catch(() => {
          setGagal(true);
          setMemuat(false);
        });
    },
    [kategori, cari, urut, hargaMax, ukuran, warna, hanyaPromo, produk.length]
  );

  useEffect(() => {
    muatProduk(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategori, cari, urut, hargaMax, ukuran.join(","), warna.join(","), hanyaPromo]);

  function toggleArr(daftar: string[], nilai: string, set: (v: string[]) => void) {
    set(daftar.includes(nilai) ? daftar.filter((d) => d !== nilai) : [...daftar, nilai]);
  }

  const PanelFilter = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-extrabold text-zamrud-800">Harga Maksimal</p>
        <input
          type="range" min={25000} max={700000} step={25000} value={hargaMax}
          onChange={(e) => setHargaMax(Number(e.target.value))}
          className="w-full accent-zamrud-700"
        />
        <p className="mt-1 text-sm font-bold text-tanah">Sampai Rp{hargaMax.toLocaleString("id-ID")}</p>
      </div>
      <div>
        <p className="mb-2 text-sm font-extrabold text-zamrud-800">Ukuran</p>
        <div className="flex flex-wrap gap-2">
          {PILIHAN_UKURAN.map((u) => (
            <button
              key={u}
              onClick={() => toggleArr(ukuran, u, setUkuran)}
              className={`rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition ${
                ukuran.includes(u) ? "border-zamrud-700 bg-zamrud-700 text-white" : "border-krem-tua bg-white text-slate-600 hover:border-zamrud-300"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-extrabold text-zamrud-800">Warna</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(WARNA_HEX).filter(([k]) => !k.endsWith(" ")).map(([nama, hex]) => (
            <button
              key={nama}
              title={nama}
              onClick={() => toggleArr(warna, nama, setWarna)}
              className={`h-9 w-9 rounded-lg border-2 transition ${
                warna.includes(nama) ? "border-zamrud-700 ring-2 ring-zamrud-300" : "border-slate-200"
              }`}
              style={{ backgroundColor: hex }}
              aria-label={`Warna ${nama}`}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-3 rounded-xl border-2 border-krem-tua bg-white p-3">
          <input type="checkbox" checked={hanyaPromo} onChange={(e) => setHanyaPromo(e.target.checked)} className="h-5 w-5 accent-zamrud-700" />
          <span className="text-sm font-bold text-zamrud-800">Hanya produk promo/diskon</span>
        </label>
      </div>
      <button
        onClick={() => { setUkuran([]); setWarna([]); setHargaMax(700000); setHanyaPromo(false); }}
        className="flex items-center gap-2 text-sm font-bold text-tanah hover:text-emas-600"
      >
        <FilterX className="h-4 w-4" /> Bersihkan semua filter
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-zamrud-700">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/katalog" className="hover:text-zamrud-700">Katalog</Link>
        {namaKategori && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zamrud-800">{namaKategori.nama}</span>
          </>
        )}
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">
          {cari ? `Hasil pencarian "${cari}"` : namaKategori?.nama ?? "Semua Produk"}
        </h1>
        <button
          onClick={() => setFilterBuka((v) => !v)}
          className="flex items-center gap-2 rounded-full border-2 border-zamrud-700/20 bg-white px-4 py-2 text-sm font-bold text-zamrud-800 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SORTIR.map((s) => (
          <button
            key={s.nilai}
            onClick={() => setUrut(s.nilai)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              urut === s.nilai ? "bg-zamrud-700 text-white" : "border-2 border-krem-tua bg-white text-slate-600 hover:border-zamrud-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filterBuka && (
        <div className="mt-4 rounded-2xl border border-krem-tua bg-white p-4 lg:hidden">{PanelFilter}</div>
      )}

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-40 rounded-2xl border border-krem-tua bg-white p-5">{PanelFilter}</div>
        </aside>
        <div className="min-w-0 flex-1">
          {gagal ? (
            <p className="rounded-2xl bg-white p-10 text-center text-slate-500">Maaf, data belum tersedia. Coba lagi nanti.</p>
          ) : memuat && produk.length === 0 ? (
            <GridProdukSkeleton jumlah={8} />
          ) : produk.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center">
              <p className="font-display text-2xl font-bold text-zamrud-800">Tidak ada produk yang cocok</p>
              <p className="mt-2 text-slate-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold text-slate-500">Menampilkan {produk.length} dari {total} produk</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {produk.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
              {produk.length < total && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => muatProduk(false)}
                    disabled={memuat}
                    className="rounded-full border-2 border-zamrud-700 px-8 py-3 text-base font-extrabold text-zamrud-800 transition hover:bg-zamrud-700 hover:text-white disabled:opacity-50"
                  >
                    {memuat ? "Memuat…" : "Muat Lebih Banyak"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HalamanKatalog() {
  return (
    <Suspense fallback={<div className="p-10"><GridProdukSkeleton jumlah={8} /></div>}>
      <KatalogIsi />
    </Suspense>
  );
}
