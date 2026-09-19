"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BarisSkeleton } from "@/components/Skeletons";

export default function HalamanKonten() {
  const { kunci } = useParams<{ kunci: string }>();
  const [konten, setKonten] = useState<{ judul: string; konten: string } | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    fetch(`/api/konten/${kunci}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setKonten(d.konten))
      .catch(() => setGagal(true));
  }, [kunci]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {gagal ? (
        <p className="text-center text-slate-500">Maaf, data belum tersedia. Coba lagi nanti.</p>
      ) : !konten ? (
        <div className="space-y-3">
          <BarisSkeleton className="h-8 w-1/2" />
          <BarisSkeleton className="w-full" />
          <BarisSkeleton className="w-full" />
          <BarisSkeleton className="w-3/4" />
        </div>
      ) : (
        <>
          <h1 className="font-display text-4xl font-bold text-zamrud-800">{konten.judul}</h1>
          <div className="mt-6 space-y-4 leading-relaxed whitespace-pre-line text-slate-600">{konten.konten}</div>
        </>
      )}
    </div>
  );
}
