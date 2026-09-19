import { NextResponse } from "next/server";
import { validasiKupon } from "@/lib/kupon";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const kode = String(body?.kode ?? "");
  const subtotal = Number(body?.subtotal ?? 0);
  const hasil = await validasiKupon(kode, subtotal);
  if (!hasil.valid) return NextResponse.json({ valid: false, error: hasil.error }, { status: 400 });
  return NextResponse.json({
    valid: true,
    diskon: hasil.diskon,
    kupon: { kode: hasil.kupon!.kode, tipe: hasil.kupon!.tipe, nilai: hasil.kupon!.nilai },
  });
}
