import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const rows = await db.select().from(articles).orderBy(desc(articles.id));
  return NextResponse.json({ artikel: rows });
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const judul = String(body?.judul ?? "").trim();
  if (!judul) return NextResponse.json({ error: "Judul artikel wajib diisi." }, { status: 400 });
  let slug = slugify(judul);
  const cek = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1);
  if (cek.length > 0) slug = `${slug}-${Date.now().toString(36)}`;
  await db.insert(articles).values({
    slug,
    judul,
    ringkasan: String(body?.ringkasan ?? ""),
    konten: String(body?.konten ?? ""),
    gambar_url: String(body?.gambar_url ?? ""),
    penulis: String(body?.penulis ?? "Tim NAQI WEAR"),
    kategori: String(body?.kategori ?? "Panduan"),
  });
  return NextResponse.json({ sukses: true, slug });
}
