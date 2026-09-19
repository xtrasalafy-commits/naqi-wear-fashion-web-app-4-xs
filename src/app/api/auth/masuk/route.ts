import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, makeToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Email atau kata sandi salah. Silakan coba lagi." }, { status: 401 });
  }

  const res = NextResponse.json({
    user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
  });
  res.cookies.set(COOKIE_NAME, makeToken(user.id, user.role), {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 3600,
    sameSite: "lax",
  });
  return res;
}
