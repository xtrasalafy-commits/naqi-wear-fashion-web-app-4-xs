import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const rows = await db
    .select({
      id: users.id,
      nama: users.nama,
      email: users.email,
      nomor_wa: users.nomor_wa,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.role, "customer"));
  const orderRows = await db
    .select({ user_id: orders.user_id, total: orders.total, lunas: orders.status_pembayaran })
    .from(orders);
  const hasil = rows.map((u) => {
    const milik = orderRows.filter((o) => o.user_id === u.id);
    return {
      ...u,
      jumlah_pesanan: milik.length,
      total_belanja: milik.filter((o) => o.lunas === "lunas").reduce((a, o) => a + o.total, 0),
    };
  });
  hasil.sort((a, b) => b.total_belanja - a.total_belanja);
  return NextResponse.json({ pelanggan: hasil });
}
