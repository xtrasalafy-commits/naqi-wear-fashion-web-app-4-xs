import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, makeToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const nama = String(body?.nama ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const nomor_wa = String(body?.nomor_wa ?? "").trim();

  if (!nama || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Mohon lengkapi nama, email, dan kata sandi minimal 6 karakter." },
      { status: 400 }
    );
  }
  const ada = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (ada.length > 0) {
    return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
  }

  const user = (
    await db
      .insert(users)
      .values({ nama, email, password_hash: hashPassword(password), nomor_wa, role: "customer" })
      .returning({ id: users.id, nama: users.nama, email: users.email, role: users.role })
  )[0];

  const res = NextResponse.json({ user });
  res.cookies.set(COOKIE_NAME, makeToken(user.id, user.role), {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 3600,
    sameSite: "lax",
  });
  return res;
}
