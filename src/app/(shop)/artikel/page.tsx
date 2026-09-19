"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { KotakSkeleton } from "@/components/Skeletons";
import { tanggalID } from "@/lib/format";

type ArtikelTipe = {
  id: number; slug: string; judul: string; ringkasan: string; gambar_url: string; kategori: string; created_at: string;
};

export default function HalamanArtikel() {
  const [artikel, setArtikel] = useState<ArtikelTipe[] | null>(null);

  useEffect(() => {
    fetch("/api/artikel").then((r) => r.json()).then((d) => setArtikel(d.artikel ?? [])).catch(() => setArtikel([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="font-display text-4xl font-bold text-zamrud-800">Artikel Islami</h1>
      <p className="mt-2 max-w-xl text-slate-500">Panduan belanja syar&apos;i, tips perawatan busana, dan inspirasi keluarga dari tim NAQI WEAR.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {!artikel
          ? Array.from({ length: 3 }).map((_, i) => <KotakSkeleton key={i} className="h-72" />)
          : artikel.map((a) => (
              <Link key={a.id} href={`/artikel/${a.slug}`} className="group block overflow-hidden rounded-2xl border border-krem-tua bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[16/9] overflow-hidden bg-krem-tua">
                  <ImageLoader src={a.gambar_url} alt={a.judul} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-wide uppercase">
                    <span className="text-tanah">{a.kategori}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400">{tanggalID(a.created_at)}</span>
                  </div>
                  <h2 className="mt-2 line-clamp-2 font-display text-xl font-bold text-zamrud-800 group-hover:text-zamrud-600">{a.judul}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">{a.ringkasan}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emas-600">Baca Selengkapnya <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
