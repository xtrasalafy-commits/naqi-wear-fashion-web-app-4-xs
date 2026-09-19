import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = process.env.AUTH_SECRET || "naqi-wear-secret-rahasia-toko";
export const COOKIE_NAME = "naqi_session";

export function hashPassword(pw: string): string {
  const salt = Math.random().toString(36).slice(2, 10);
  return salt + ":" + scryptSync(pw, salt, 32).toString("hex");
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = scryptSync(pw, salt, 32);
  return timingSafeEqual(Buffer.from(hash, "hex"), check);
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function makeToken(userId: number, role: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, role, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString("base64url");
  return payload + "." + sign(payload);
}

export function parseToken(token: string): { uid: number; role: string } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.uid !== "number" || data.exp < Date.now()) return null;
    return { uid: data.uid, role: data.role };
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: number;
  nama: string;
  email: string;
  nomor_wa: string;
  gender: string;
  tanggal_lahir: string;
  role: string;
  avatar_url: string;
  alamat_json: Record<string, string> | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = parseToken(token);
  if (!parsed) return null;
  const rows = await db
    .select({
      id: users.id, nama: users.nama, email: users.email, nomor_wa: users.nomor_wa,
      gender: users.gender, tanggal_lahir: users.tanggal_lahir, role: users.role,
      avatar_url: users.avatar_url, alamat_json: users.alamat_json,
    })
    .from(users)
    .where(eq(users.id, parsed.uid))
    .limit(1);
  return rows[0] ?? null;
}
