"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { BarisSkeleton } from "@/components/Skeletons";
import { tanggalID } from "@/lib/format";

export default function HalamanDetailArtikel() {
  const { slug } = useParams<{ slug: string }>();
  const [artikel, setArtikel] = useState<{ judul: string; konten: string; gambar_url: string; penulis: string; kategori: string; created_at: string } | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    fetch(`/api/artikel/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setArtikel(d.artikel))
      .catch(() => setGagal(true));
  }, [slug]);

  if (gagal) return <p className="p-16 text-center text-slate-500">Maaf, artikel belum tersedia. Coba lagi nanti.</p>;
  if (!artikel) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-12">
        <BarisSkeleton className="h-8 w-2/3" />
        <BarisSkeleton className="h-56 w-full" />
        <BarisSkeleton className="w-full" />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/artikel" className="inline-flex items-center gap-1 text-sm font-bold text-tanah hover:text-emas-600">
        <ChevronLeft className="h-4 w-4" /> Semua Artikel
      </Link>
      <p className="mt-4 text-xs font-extrabold tracking-widest text-tanah uppercase">{artikel.kategori}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight font-bold text-zamrud-900">{artikel.judul}</h1>
      <p className="mt-2 text-sm text-slate-400">
        Oleh {artikel.penulis} • {tanggalID(artikel.created_at)}
      </p>
      <div className="mt-6 overflow-hidden rounded-3xl">
        <ImageLoader src={artikel.gambar_url} alt={artikel.judul} eager className="w-full object-cover" />
      </div>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-700">
        {artikel.konten.split("\n\n").map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
    </article>
  );
}
