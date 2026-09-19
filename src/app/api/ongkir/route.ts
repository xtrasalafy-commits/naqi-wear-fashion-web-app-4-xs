import { NextResponse } from "next/server";
import { daftarKurir } from "@/lib/ongkir";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const kodepos = String(body?.kodepos ?? "");
  const berat = Number(body?.berat ?? 0);
  if (!/^\d{5}$/.test(kodepos)) {
    return NextResponse.json({ error: "Masukkan kode pos 5 digit yang valid." }, { status: 400 });
  }
  return NextResponse.json({ kurir: daftarKurir(kodepos, berat || 1000) });
}
