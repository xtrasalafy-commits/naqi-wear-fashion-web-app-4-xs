import { db } from "@/db";
import { coupons } from "@/db/schema";
import { ilike } from "drizzle-orm";
import { rupiah } from "./format";

export async function validasiKupon(kode: string, subtotal: number) {
  if (!kode) return { valid: false, diskon: 0, error: "", kupon: null };
  const rows = await db.select().from(coupons).where(ilike(coupons.kode, kode.trim())).limit(1);
  const c = rows[0];
  if (!c || !c.aktif) return { valid: false, diskon: 0, error: "Kode voucher tidak ditemukan.", kupon: null };
  const hariIni = new Date().toISOString().slice(0, 10);
  if (hariIni < c.mulai || hariIni > c.berakhir)
    return { valid: false, diskon: 0, error: "Maaf, voucher ini sudah tidak berlaku.", kupon: null };
  if (c.terpakai >= c.kuota) return { valid: false, diskon: 0, error: "Kuota voucher sudah habis.", kupon: null };
  if (subtotal < c.minimal_order)
    return {
      valid: false,
      diskon: 0,
      error: `Minimal belanja ${rupiah(c.minimal_order)} untuk memakai voucher ini.`,
      kupon: null,
    };
  let diskon = c.tipe === "persen" ? Math.round((subtotal * c.nilai) / 100) : c.nilai;
  if (c.maksimal_diskon > 0) diskon = Math.min(diskon, c.maksimal_diskon);
  return { valid: true, diskon, error: "", kupon: c };
}
