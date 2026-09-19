import { NextResponse } from "next/server";
import { ambilProduk } from "@/lib/katalog";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  try {
    const hasil = await ambilProduk({
      kategoriSlug: q.get("kategori") ?? undefined,
      cari: q.get("cari") ?? undefined,
      urut: q.get("urut") ?? "terbaru",
      hargaMin: q.get("min") ? Number(q.get("min")) : undefined,
      hargaMax: q.get("max") ? Number(q.get("max")) : undefined,
      ukuran: q.get("ukuran") ? q.get("ukuran")!.split(",") : undefined,
      warna: q.get("warna") ? q.get("warna")!.split(",") : undefined,
      promo: q.get("promo") === "1",
      limit: Math.min(Number(q.get("limit") ?? 12), 48),
      offset: Number(q.get("offset") ?? 0),
    });
    return NextResponse.json(hasil);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Maaf, data belum tersedia. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
