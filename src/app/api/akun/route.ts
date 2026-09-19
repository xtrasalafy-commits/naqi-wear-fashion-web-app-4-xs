import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const tipe = String(body?.tipe ?? "profil");

  if (tipe === "password") {
    const lama = String(body?.lama ?? "");
    const baru = String(body?.baru ?? "");
    if (baru.length < 6) return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter." }, { status: 400 });
    const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!rows[0] || !verifyPassword(lama, rows[0].password_hash)) {
      return NextResponse.json({ error: "Kata sandi lama salah." }, { status: 400 });
    }
    await db.update(users).set({ password_hash: hashPassword(baru) }).where(eq(users.id, user.id));
    return NextResponse.json({ sukses: true, pesan: "Kata sandi berhasil diperbarui." });
  }

  await db
    .update(users)
    .set({
      nama: body.nama ? String(body.nama) : user.nama,
      nomor_wa: body.nomor_wa !== undefined ? String(body.nomor_wa) : user.nomor_wa,
      gender: body.gender !== undefined ? String(body.gender) : user.gender,
      tanggal_lahir: body.tanggal_lahir !== undefined ? String(body.tanggal_lahir) : user.tanggal_lahir,
      alamat_json: body.alamat_json ? (body.alamat_json as Record<string, string>) : user.alamat_json,
    })
    .where(eq(users.id, user.id));
  return NextResponse.json({ sukses: true, pesan: "Profil berhasil disimpan." });
}
