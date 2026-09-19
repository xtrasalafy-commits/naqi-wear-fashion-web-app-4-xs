"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck, ChevronRight, Heart, Ruler, ShieldCheck, ShoppingBag, Star, Truck, Zap,
} from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { Stars } from "@/components/Stars";
import { QtyInput } from "@/components/QtyInput";
import { Modal } from "@/components/Modal";
import { ProductCard, type ProdukKartu } from "@/components/ProductCard";
import { KotakSkeleton } from "@/components/Skeletons";
import { rupiah, persenHemat, warnaHex, tanggalID } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

type VarianTipe = {
  id: number; sku: string; warna: string; ukuran: string; harga: number; stok: number; gambar_url: string; berat_gram: number;
};
type DetailTipe = {
  produk: {
    id: number; slug: string; nama: string; deskripsi: string; bahan: string;
    harga_dasar: number; harga_diskon: number | null; badge_syari: string; berat_gram: number;
  };
  kategori: { nama: string; slug: string } | null;
  gambar: Array<{ gambar_url: string; alt_text: string }>;
  varian: VarianTipe[];
  ulasan: Array<{ id: number; rating: number; judul: string; komentar: string; gambar_url_json: string[] | null; terverifikasi: boolean; created_at: string; nama: string }>;
  rating_avg: number;
  rating_count: number;
  terkait: ProdukKartu[];
};

const IKON_BADGE: Record<string, typeof ShieldCheck> = {
  "Tidak Menerawang": ShieldCheck,
  "Wudhu Friendly": BadgeCheck,
  "Busui Friendly": BadgeCheck,
  "Panjang Syar'i": Ruler,
};

export default function HalamanProduk() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const tambah = useCart((s) => s.tambah);
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const tampil = useToast((s) => s.tampil);

  const [data, setData] = useState<DetailTipe | null>(null);
  const [gagal, setGagal] = useState(false);
  const [gambarAktif, setGambarAktif] = useState(0);
  const [warna, setWarna] = useState<string>("");
  const [ukuranPilih, setUkuranPilih] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"deskripsi" | "ulasan">("deskripsi");
  const [sizeChart, setSizeChart] = useState(false);
  const [kodepos, setKodepos] = useState("");
  const [ongkir, setOngkir] = useState<Array<{ nama: string; layanan: string; biaya: number; estimasi: string }> | null>(null);
  const [filterFoto, setFilterFoto] = useState(false);
  const [formUlasan, setFormUlasan] = useState({ rating: 5, judul: "", komentar: "" });

  useEffect(() => {
    fetch(`/api/produk/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: DetailTipe) => {
        setData(d);
        const vAktif = d.varian.find((v) => v.stok > 0) ?? d.varian[0];
        if (vAktif) {
          setWarna(vAktif.warna);
          setUkuranPilih(vAktif.ukuran);
        }
      })
      .catch(() => setGagal(true));
  }, [slug]);

  const daftarWarna = useMemo(() => [...new Set(data?.varian.map((v) => v.warna) ?? [])], [data]);
  const daftarUkuran = useMemo(
    () => [...new Set(data?.varian.filter((v) => v.warna === warna).map((v) => v.ukuran))],
    [data, warna]
  );
  const varianTerpilih = data?.varian.find((v) => v.warna === warna && v.ukuran === ukuranPilih);
  const stokWarna = (w: string) => (data?.varian.filter((v) => v.warna === w).reduce((a, v) => a + v.stok, 0) ?? 0) > 0;
  const stokUkuran = (u: string) => (data?.varian.find((v) => v.warna === warna && v.ukuran === u)?.stok ?? 0) > 0;

  if (gagal) {
    return <p className="p-20 text-center text-slate-500">Maaf, data belum tersedia. Coba lagi nanti.</p>;
  }
  if (!data) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2">
        <KotakSkeleton className="aspect-square" />
        <div className="space-y-4">
          <KotakSkeleton className="h-8 w-3/4" />
          <KotakSkeleton className="h-6 w-1/3" />
          <KotakSkeleton className="h-12 w-1/2" />
          <KotakSkeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  const p = data.produk;
  const hargaFinal = p.harga_diskon ?? p.harga_dasar;
  const hemat = p.harga_diskon ? persenHemat(p.harga_dasar, p.harga_diskon) : 0;
  const ulasanTampil = filterFoto ? data.ulasan.filter((u) => (u.gambar_url_json ?? []).length > 0) : data.ulasan;

  function masukkanKeranjang() {
    const v = varianTerpilih;
    if (!v || v.stok <= 0) {
      tampil("error", "Mohon pilih warna dan ukuran yang tersedia.");
      return;
    }
    tambah({
      productId: p.id, variantId: v.id, nama: p.nama, slug: p.slug,
      gambar: v.gambar_url || data!.gambar[0]?.gambar_url || "",
      warna: v.warna, ukuran: v.ukuran, harga: v.harga, stok: v.stok, berat: v.berat_gram,
    }, qty);
    tampil("sukses", `${p.nama} masuk ke keranjang.`);
  }

  function beliSekarang() {
    const v = varianTerpilih;
    if (!v || v.stok <= 0) {
      tampil("error", "Mohon pilih warna dan ukuran yang tersedia.");
      return;
    }
    tambah({
      productId: p.id, variantId: v.id, nama: p.nama, slug: p.slug,
      gambar: v.gambar_url || data!.gambar[0]?.gambar_url || "",
      warna: v.warna, ukuran: v.ukuran, harga: v.harga, stok: v.stok, berat: v.berat_gram,
    }, qty);
    router.push("/checkout");
  }

  function cekOngkir(e: React.FormEvent) {
    e.preventDefault();
    fetch("/api/ongkir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kodepos, berat: (varianTerpilih?.berat_gram ?? p.berat_gram) * qty }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.kurir) setOngkir(d.kurir);
        else tampil("error", d.error ?? "Kode pos tidak valid.");
      });
  }

  async function kirimUlasan(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/ulasan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: p.id, ...formUlasan }),
    });
    const d = await res.json();
    if (res.ok) {
      tampil("sukses", d.pesan);
      setFormUlasan({ rating: 5, judul: "", komentar: "" });
      fetch(`/api/produk/${slug}`).then((r) => r.json()).then(setData).catch(() => undefined);
    } else tampil("error", d.error ?? "Gagal mengirim ulasan.");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-zamrud-700">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {data.kategori && (
          <>
            <Link href={`/katalog?kategori=${data.kategori.slug}`} className="hover:text-zamrud-700">{data.kategori.nama}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-zamrud-800">{p.nama}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        {/* GALERI */}
        <div>
          <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-krem-tua bg-krem-tua md:aspect-square">
            <ImageLoader
              src={data.gambar[gambarAktif]?.gambar_url}
              alt={data.gambar[gambarAktif]?.alt_text ?? p.nama}
              eager
              className="h-full w-full object-cover transition duration-500 group-hover:scale-125"
            />
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {data.gambar.map((g, i) => (
              <button
                key={i}
                onClick={() => setGambarAktif(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  i === gambarAktif ? "border-emas-400" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`Foto ${i + 1}`}
              >
                <ImageLoader src={g.gambar_url} alt={g.alt_text} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <div className="flex flex-wrap gap-1.5">
            {p.badge_syari.split("|").map((b) => {
              const Ikon = IKON_BADGE[b.trim()] ?? ShieldCheck;
              return (
                <span key={b} className="inline-flex items-center gap-1 rounded-full bg-zamrud-50 px-3 py-1 text-[11px] font-bold text-zamrud-700">
                  <Ikon className="h-3 w-3" /> {b.trim()}
                </span>
              );
            })}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-zamrud-900 md:text-4xl">{p.nama}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Stars nilai={data.rating_avg} ukuran="h-5 w-5" />
            <span className="text-sm font-bold text-zamrud-800">{data.rating_avg > 0 ? data.rating_avg.toFixed(1) : "Belum ada"}</span>
            <span className="text-sm text-slate-400">({data.rating_count} ulasan)</span>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4">
            <p className="text-3xl font-extrabold text-emas-600 md:text-4xl">{rupiah(hargaFinal)}</p>
            {p.harga_diskon && (
              <>
                <p className="text-lg text-slate-400 line-through">{rupiah(p.harga_dasar)}</p>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-600">Hemat {hemat}%</span>
              </>
            )}
          </div>

          {/* WARNA */}
          <div className="mt-6">
            <p className="text-sm font-extrabold text-zamrud-800">Pilih Warna: <span className="text-tanah">{warna}</span></p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {daftarWarna.map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setWarna(w);
                    const v = data.varian.find((v) => v.warna === w && v.stok > 0) ?? data.varian.find((v) => v.warna === w);
                    if (v) setUkuranPilih(v.ukuran);
                  }}
                  title={w}
                  className={`relative h-11 w-11 rounded-full border-2 transition ${
                    warna === w ? "border-zamrud-700 ring-2 ring-zamrud-300" : "border-slate-200"
                  } ${stokWarna(w) ? "" : "opacity-40"}`}
                  style={{ backgroundColor: warnaHex(w) }}
                  aria-label={`Warna ${w}`}
                >
                  {stokWarna(w) && <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* UKURAN */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-zamrud-800">Pilih Ukuran</p>
              <button onClick={() => setSizeChart(true)} className="flex items-center gap-1 text-sm font-bold text-emas-600 hover:underline">
                <Ruler className="h-4 w-4" /> Lihat Size Chart
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {daftarUkuran.map((u) => (
                <button
                  key={u}
                  onClick={() => setUkuranPilih(u)}
                  disabled={!stokUkuran(u)}
                  className={`relative min-w-14 rounded-xl border-2 px-4 py-2.5 text-sm font-extrabold transition ${
                    ukuranPilih === u
                      ? "border-zamrud-700 bg-zamrud-700 text-white"
                      : stokUkuran(u)
                      ? "border-krem-tua bg-white text-zamrud-800 hover:border-zamrud-400"
                      : "border-krem-tua bg-krem text-slate-300 line-through"
                  }`}
                >
                  {u}
                  {stokUkuran(u) && ukuranPilih !== u && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {varianTerpilih
                ? varianTerpilih.stok > 0
                  ? `Stok tersedia: ${varianTerpilih.stok} pcs`
                  : "Stok varian ini sedang kosong. Silakan pilih varian lain."
                : "Silakan pilih warna dan ukuran."}
            </p>
          </div>

          {/* QTY + TOMBOL */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtyInput nilai={qty} ubah={setQty} max={Math.max(varianTerpilih?.stok ?? 1, 1)} />
            <button
              onClick={async (e) => {
                e.preventDefault();
                if (!user) return tampil("info", "Silakan masuk terlebih dahulu untuk wishlist.");
                const ok = await toggleWishlist(p.id);
                tampil(ok ? "sukses" : "info", ok ? "Ditambahkan ke wishlist." : "Dihapus dari wishlist.");
              }}
              aria-label="Simpan ke wishlist"
              className="grid h-12 w-12 place-items-center rounded-xl border-2 border-zamrud-700/20 bg-white transition hover:border-red-300"
            >
              <Heart className={`h-5 w-5 ${wishlistIds.includes(p.id) ? "fill-red-500 text-red-500" : "text-zamrud-800"}`} />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={masukkanKeranjang}
              className="flex items-center justify-center gap-2 rounded-2xl bg-zamrud-700 px-6 py-4 text-base font-extrabold text-white shadow-md transition hover:scale-[1.02] hover:bg-zamrud-600"
            >
              <ShoppingBag className="h-5 w-5" /> Tambah ke Keranjang
            </button>
            <button
              onClick={beliSekarang}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emas-400 px-6 py-4 text-base font-extrabold text-zamrud-900 shadow-md transition hover:scale-[1.02] hover:bg-emas-300"
            >
              <Zap className="h-5 w-5" /> Beli Sekarang
            </button>
          </div>

          {/* ESTIMASI ONGKIR */}
          <div className="mt-6 rounded-2xl border border-krem-tua bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-zamrud-800">
              <Truck className="h-4 w-4 text-emas-500" /> Cek Estimasi Pengiriman
            </p>
            <form onSubmit={cekOngkir} className="mt-2 flex gap-2">
              <input
                value={kodepos} onChange={(e) => setKodepos(e.target.value)} placeholder="Masukkan kode pos, mis. 12810"
                className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-2.5 text-sm outline-none focus:border-zamrud-500"
              />
              <button className="rounded-xl bg-zamrud-700 px-5 text-sm font-bold text-white hover:bg-zamrud-600">Cek</button>
            </form>
            {ongkir && (
              <ul className="mt-3 space-y-2">
                {ongkir.map((k) => (
                  <li key={k.nama + k.layanan} className="flex items-center justify-between rounded-xl bg-krem px-3 py-2 text-sm">
                    <span className="font-bold text-zamrud-800">{k.nama} {k.layanan}</span>
                    <span className="text-slate-600">{rupiah(k.biaya)} • {k.estimasi}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* TAB */}
      <div className="mt-12">
        <div className="flex gap-2 border-b-2 border-krem-tua">
          {(["deskripsi", "ulasan"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-4 px-6 py-3 text-base font-extrabold capitalize transition ${
                tab === t ? "border-emas-400 text-zamrud-800" : "border-transparent text-slate-400 hover:text-zamrud-700"
              }`}
            >
              {t === "ulasan" ? `Ulasan (${data.rating_count})` : "Deskripsi"}
            </button>
          ))}
        </div>

        {tab === "deskripsi" ? (
          <div className="mt-6 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p className="leading-relaxed whitespace-pre-line text-slate-600">{p.deskripsi}</p>
            </div>
            <div className="space-y-3 rounded-2xl border border-krem-tua bg-white p-5 text-sm">
              <div><span className="font-extrabold text-zamrud-800">Bahan:</span> <span className="text-slate-600">{p.bahan}</span></div>
              <div><span className="font-extrabold text-zamrud-800">Perawatan:</span> <span className="text-slate-600">Cuci lembut dengan air dingin, jemur di tempat teduh, setrika suhu rendah.</span></div>
              <div><span className="font-extrabold text-zamrud-800">Detail Potongan:</span> <span className="text-slate-600">Potongan longgar menutup aurat, jahitan obras rapi di bagian dalam.</span></div>
              <div><span className="font-extrabold text-zamrud-800">Ukuran Model:</span> <span className="text-slate-600">Tinggi 165 cm, berat 55 kg, memakai ukuran M.</span></div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3">
                <p className="text-4xl font-extrabold text-zamrud-800">{data.rating_avg > 0 ? data.rating_avg.toFixed(1) : "-"}</p>
                <div>
                  <Stars nilai={data.rating_avg} />
                  <p className="text-xs text-slate-500">{data.rating_count} ulasan terverifikasi</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-zamrud-800">
                <input type="checkbox" checked={filterFoto} onChange={(e) => setFilterFoto(e.target.checked)} className="h-4 w-4 accent-zamrud-700" />
                Hanya dengan foto
              </label>
            </div>

            <div className="mt-5 space-y-4">
              {ulasanTampil.length === 0 && (
                <p className="rounded-2xl bg-white p-8 text-center text-slate-500">Belum ada ulasan yang cocok.</p>
              )}
              {ulasanTampil.map((u) => (
                <article key={u.id} className="rounded-2xl border border-krem-tua bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-zamrud-700 font-bold text-emas-300">{u.nama.charAt(0)}</span>
                    <div>
                      <p className="text-sm font-bold text-zamrud-800">{u.nama}</p>
                      <p className="text-xs text-slate-400">{tanggalID(u.created_at)}</p>
                    </div>
                    {u.terverifikasi && (
                      <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" /> Pembelian Terverifikasi
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars nilai={u.rating} ukuran="h-3.5 w-3.5" />
                    {u.judul && <p className="text-sm font-bold text-zamrud-800">{u.judul}</p>}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{u.komentar}</p>
                  {(u.gambar_url_json ?? []).length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {(u.gambar_url_json ?? []).map((g, i) => (
                        <img key={i} src={g} alt="Foto ulasan pelanggan" className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* FORM ULASAN */}
            <form onSubmit={kirimUlasan} className="mt-6 rounded-2xl border border-krem-tua bg-white p-5">
              <p className="font-display text-xl font-bold text-zamrud-800">Tulis Ulasan Anda</p>
              {user ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" onClick={() => setFormUlasan((f) => ({ ...f, rating: i }))} aria-label={`${i} bintang`}>
                        <Star className={`h-7 w-7 ${i <= formUlasan.rating ? "fill-emas-400 text-emas-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                  <input
                    value={formUlasan.judul} onChange={(e) => setFormUlasan((f) => ({ ...f, judul: e.target.value }))}
                    placeholder="Judul ulasan (contoh: Bahannya adem)"
                    className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-2.5 text-sm outline-none focus:border-zamrud-500"
                  />
                  <textarea
                    required value={formUlasan.komentar} onChange={(e) => setFormUlasan((f) => ({ ...f, komentar: e.target.value }))}
                    placeholder="Ceritakan pengalaman Anda dengan produk ini…" rows={3}
                    className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-2.5 text-sm outline-none focus:border-zamrud-500"
                  />
                  <button className="rounded-xl bg-zamrud-700 px-6 py-2.5 text-sm font-extrabold text-white hover:bg-zamrud-600">
                    Kirim Ulasan
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  <Link href="/masuk" className="font-bold text-zamrud-700 hover:underline">Masuk</Link> untuk menulis ulasan produk ini.
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      {/* PRODUK TERKAIT */}
      {data.terkait.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-3xl font-bold text-zamrud-800">Produk Terkait</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {data.terkait.map((t) => <ProductCard key={t.id} p={t} />)}
          </div>
        </section>
      )}

      {/* MODAL SIZE CHART */}
      <Modal buka={sizeChart} tutup={() => setSizeChart(false)} judul="Panduan Ukuran NAQI WEAR">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zamrud-700 text-left text-white">
              <th className="px-3 py-2.5 font-bold">Ukuran</th>
              <th className="px-3 py-2.5 font-bold">Lingkar Dada</th>
              <th className="px-3 py-2.5 font-bold">Panjang Baju</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {[["S", "88–92 cm", "130 cm"], ["M", "93–98 cm", "134 cm"], ["L", "99–104 cm", "138 cm"], ["XL", "105–112 cm", "140 cm"], ["XXL", "113–122 cm", "142 cm"], ["Jumbo", "123–135 cm", "145 cm"]].map((r) => (
              <tr key={r[0]} className="border-b border-krem-tua">
                <td className="px-3 py-2.5 font-bold text-zamrud-800">{r[0]}</td>
                <td className="px-3 py-2.5">{r[1]}</td>
                <td className="px-3 py-2.5">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">Jika ragu di antara dua ukuran, pilih ukuran yang lebih besar agar tetap longgar dan nyaman.</p>
      </Modal>
    </div>
  );
}
