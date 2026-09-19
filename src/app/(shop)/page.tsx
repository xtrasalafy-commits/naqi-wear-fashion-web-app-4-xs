"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Baby, BookOpen, Flower2, Moon, Ruler, ShieldCheck, Shirt,
  Sparkles, Tag, Truck, Users, Wallet, Award, ChevronLeft, ChevronRight,
} from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { ProductCard, type ProdukKartu } from "@/components/ProductCard";
import { Stars } from "@/components/Stars";
import { Reveal } from "@/components/Reveal";
import { GridProdukSkeleton, KotakSkeleton } from "@/components/Skeletons";

type BannerTipe = { id: number; judul: string; subjudul: string; gambar_url: string; tautan: string };
type ArtikelTipe = { id: number; slug: string; judul: string; ringkasan: string; gambar_url: string; kategori: string };
type TestimoniTipe = { rating: number; komentar: string; nama: string };
type BerandaData = {
  banners: BannerTipe[];
  artikel: ArtikelTipe[];
  testimoni: TestimoniTipe[];
  terlaris: ProdukKartu[];
  terbaru: ProdukKartu[];
};

const MENU_BESAR = [
  { nama: "Wanita", href: "/katalog?kategori=wanita", Ikon: Flower2 },
  { nama: "Pria", href: "/katalog?kategori=pria", Ikon: Shirt },
  { nama: "Anak", href: "/katalog?kategori=anak", Ikon: Baby },
  { nama: "Keluarga", href: "/katalog?kategori=keluarga", Ikon: Users },
  { nama: "Mukena", href: "/katalog?kategori=mukena", Ikon: Moon },
  { nama: "Hijab", href: "/katalog?kategori=hijab", Ikon: Sparkles },
  { nama: "Promo", href: "/promo", Ikon: Tag },
  { nama: "Artikel", href: "/artikel", Ikon: BookOpen },
];

const KATEGORI_POPULER = [
  { nama: "Hijab", href: "/katalog?kategori=hijab", Ikon: Sparkles },
  { nama: "Gamis", href: "/katalog?kategori=gamis", Ikon: Flower2 },
  { nama: "Mukena", href: "/katalog?kategori=mukena", Ikon: Moon },
  { nama: "Baju Koko", href: "/katalog?kategori=baju-koko", Ikon: Shirt },
  { nama: "Anak", href: "/katalog?kategori=anak", Ikon: Baby },
  { nama: "Sarimbit", href: "/katalog?kategori=keluarga", Ikon: Users },
];

const KEUNGGULAN = [
  { Ikon: Award, judul: "Bahan Berkualitas", isi: "Kain premium pilihan yang adem dan awet." },
  { Ikon: Ruler, judul: "Ukuran Lengkap", isi: "Tersedia S sampai XXL, plus size Jumbo." },
  { Ikon: Truck, judul: "Pengiriman Aman", isi: "Dikemas rapi ke seluruh Indonesia." },
  { Ikon: Wallet, judul: "Pembayaran Mudah", isi: "QRIS, transfer, e-wallet, hingga COD." },
  { Ikon: ShieldCheck, judul: "Tidak Menerawang", isi: "Semua kain telah lulus uji ketebalan." },
];

export default function HalamanUtama() {
  const [data, setData] = useState<BerandaData | null>(null);
  const [gagal, setGagal] = useState(false);
  const [bannerAktif, setBannerAktif] = useState(0);

  useEffect(() => {
    fetch("/api/beranda")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setGagal(true));
  }, []);

  useEffect(() => {
    if (!data || data.banners.length <= 1) return;
    const t = setInterval(() => setBannerAktif((v) => (v + 1) % data.banners.length), 6000);
    return () => clearInterval(t);
  }, [data]);

  if (gagal) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-display text-2xl font-bold text-zamrud-800">Maaf, data belum tersedia.</p>
        <p className="mt-2 text-slate-500">Silakan coba lagi nanti.</p>
      </div>
    );
  }

  const banner = data?.banners[bannerAktif];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-zamrud-800">
        <div className="absolute inset-0">
          {banner && (
            <ImageLoader src={banner.gambar_url} alt={banner.judul} eager className="h-full w-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zamrud-900/95 via-zamrud-900/70 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emas-400/50 bg-zamrud-700/60 px-4 py-1.5 text-xs font-bold tracking-wide text-emas-300">
              <Moon className="h-3.5 w-3.5" /> Koleksi Syar&apos;i Keluarga Indonesia
            </p>
            <h1 className="font-display text-4xl leading-tight font-bold text-white md:text-6xl">
              Tampil Syar&apos;i, Nyaman, dan Elegan <span className="text-emas-400">Setiap Hari</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zamrud-100 md:text-lg">
              {banner?.subjudul ??
                "Hijab, gamis, mukena, koko, dan sarimbit keluarga berbahan premium. Tidak menerawang, jahitan rapi, harga jujur."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/katalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emas-400 px-8 py-4 text-base font-extrabold text-zamrud-900 shadow-lg transition hover:scale-[1.03] hover:bg-emas-300"
              >
                Belanja Sekarang <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/katalog?kategori=paket-promo"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 px-8 py-4 text-base font-bold text-white transition hover:bg-white hover:text-zamrud-900"
              >
                Lihat Koleksi Ramadhan
              </Link>
            </div>
          </div>
          {data && data.banners.length > 1 && (
            <div className="mt-10 flex items-center gap-3">
              <button
                onClick={() => setBannerAktif((v) => (v - 1 + data.banners.length) % data.banners.length)}
                aria-label="Banner sebelumnya"
                className="rounded-full border border-white/40 p-2 text-white transition hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setBannerAktif((v) => (v + 1) % data.banners.length)}
                aria-label="Banner berikutnya"
                className="rounded-full border border-white/40 p-2 text-white transition hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="ml-2 flex gap-1.5">
                {data.banners.map((b, i) => (
                  <button
                    key={b.id}
                    onClick={() => setBannerAktif(i)}
                    aria-label={`Banner ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === bannerAktif ? "w-6 bg-emas-400" : "w-2 bg-white/40"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MENU KATEGORI BESAR */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="-mt-8 grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-3">
          {MENU_BESAR.map(({ nama, href, Ikon }) => (
            <Link
              key={nama}
              href={href}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-krem-tua bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:border-emas-300 hover:shadow-md md:p-4"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-zamrud-50 text-zamrud-700 transition group-hover:bg-emas-100">
                <Ikon className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-zamrud-800 md:text-sm">{nama}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* KATEGORI POPULER */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Kategori Populer</h2>
          <p className="mt-1 text-slate-500">Pilih kategori favorit Anda, semua siap dikirim hari ini.</p>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {KATEGORI_POPULER.map(({ nama, href, Ikon }, i) => (
            <Reveal key={nama} delay={i * 0.05}>
              <Link
                href={href}
                className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-krem-tua bg-white p-6 text-center transition hover:-translate-y-1 hover:border-zamrud-300 hover:shadow-lg"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-zamrud-700 text-emas-300">
                  <Ikon className="h-7 w-7" />
                </span>
                <span className="text-base font-extrabold text-zamrud-800">{nama}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRODUK TERLARIS */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Produk Terlaris</h2>
              <p className="mt-1 text-slate-500">Paling banyak dibayar pelanggan bulan ini.</p>
            </div>
            <Link href="/katalog?urut=terlaris" className="hidden items-center gap-1 text-sm font-bold text-tanah hover:text-emas-600 md:flex">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-6">
          {!data ? (
            <GridProdukSkeleton jumlah={4} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {data.terlaris.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard p={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
        <Link href="/katalog?urut=terlaris" className="mt-6 flex items-center justify-center gap-1 text-sm font-bold text-tanah md:hidden">
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* BANNER PROMO TENGAH */}
      {data && data.banners.length > 1 && (
        <section className="mx-auto max-w-7xl px-4 pt-16">
          <Reveal>
            <Link href={data.banners[1].tautan} className="group relative block overflow-hidden rounded-3xl">
              <ImageLoader
                src={data.banners[1].gambar_url}
                alt={data.banners[1].judul}
                className="h-56 w-full object-cover transition duration-700 group-hover:scale-105 md:h-72"
              />
              <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-tanah/90 via-tanah/60 to-transparent p-6 md:p-10">
                <p className="text-xs font-extrabold tracking-widest text-emas-300 uppercase">Diskon Spesial</p>
                <p className="mt-1 max-w-md font-display text-2xl font-bold text-white md:text-4xl">{data.banners[1].judul}</p>
                <p className="mt-1 max-w-md text-sm text-white/80">{data.banners[1].subjudul}</p>
                <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-emas-400 px-5 py-2.5 text-sm font-extrabold text-zamrud-900">
                  Lihat Koleksi <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* PRODUK TERBARU */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Produk Terbaru</h2>
              <p className="mt-1 text-slate-500">Baru tiba di gudang kami, stok masih lengkap.</p>
            </div>
            <Link href="/katalog" className="hidden items-center gap-1 text-sm font-bold text-tanah hover:text-emas-600 md:flex">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-6">
          {!data ? (
            <GridProdukSkeleton jumlah={4} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {data.terbaru.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard p={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="mt-16 bg-zamrud-700 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold text-white md:text-4xl">
              Mengapa Belanja di <span className="text-emas-400">NAQI WEAR</span>?
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
            {KEUNGGULAN.map(({ Ikon, judul, isi }, i) => (
              <Reveal key={judul} delay={i * 0.07}>
                <div className="flex h-full flex-col items-center gap-3 rounded-2xl bg-zamrud-800/60 p-5 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-emas-400 text-zamrud-900">
                    <Ikon className="h-6 w-6" />
                  </span>
                  <p className="font-extrabold text-white">{judul}</p>
                  <p className="text-sm leading-relaxed text-zamrud-100">{isi}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Kata Pelanggan Kami</h2>
          <p className="mt-1 text-center text-slate-500">Ulasan asli dari pembeli NAQI WEAR.</p>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {!data
            ? Array.from({ length: 3 }).map((_, i) => <KotakSkeleton key={i} className="h-44" />)
            : data.testimoni.map((t, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <figure className="h-full rounded-2xl border border-krem-tua bg-white p-6 shadow-sm">
                    <Stars nilai={t.rating} ukuran="h-4 w-4" />
                    <blockquote className="mt-3 text-sm leading-relaxed text-slate-600">“{t.komentar}”</blockquote>
                    <figcaption className="mt-4 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-zamrud-700 font-bold text-emas-300">
                        {t.nama.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-zamrud-800">{t.nama}</p>
                        <p className="text-xs text-emerald-700">✓ Pembeli Terverifikasi</p>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
        </div>
      </section>

      {/* ARTIKEL */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Artikel Islami</h2>
              <p className="mt-1 text-slate-500">Panduan dan inspirasi untuk keluarga Anda.</p>
            </div>
            <Link href="/artikel" className="hidden items-center gap-1 text-sm font-bold text-tanah hover:text-emas-600 md:flex">
              Semua Artikel <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
          {!data
            ? Array.from({ length: 3 }).map((_, i) => <KotakSkeleton key={i} className="h-64" />)
            : data.artikel.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.08}>
                  <Link href={`/artikel/${a.slug}`} className="group block overflow-hidden rounded-2xl border border-krem-tua bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="aspect-[16/9] overflow-hidden bg-krem-tua">
                      <ImageLoader src={a.gambar_url} alt={a.judul} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] font-extrabold tracking-wide text-tanah uppercase">{a.kategori}</p>
                      <h3 className="mt-1 line-clamp-2 font-display text-xl font-bold text-zamrud-800 group-hover:text-zamrud-600">{a.judul}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{a.ringkasan}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emas-600">
                        Baca Artikel <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
        </div>
      </section>
    </div>
  );
}
