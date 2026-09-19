import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });

  const awalHari = new Date();
  awalHari.setHours(0, 0, 0, 0);

  const [penjualanRows, pesananBaruRows, pelangganBaruRows, produkTerjualRows, grafikRows, terbaru] =
    await Promise.all([
      db
        .select({ total: sql<number>`coalesce(sum(${orders.total}),0)::int` })
        .from(orders)
        .where(and(gte(orders.created_at, awalHari), eq(orders.status_pembayaran, "lunas"))),
      db
        .select({ jumlah: sql<number>`count(*)::int` })
        .from(orders)
        .where(gte(orders.created_at, awalHari)),
      db
        .select({ jumlah: sql<number>`count(*)::int` })
        .from(users)
        .where(and(gte(users.created_at, awalHari), eq(users.role, "customer"))),
      db
        .select({ jumlah: sql<number>`coalesce(sum(${orderItems.qty}),0)::int` })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.order_id))
        .where(gte(orders.created_at, awalHari)),
      db
        .select({
          hari: sql<string>`to_char(${orders.created_at}, 'YYYY-MM-DD')`,
          total: sql<number>`coalesce(sum(${orders.total}),0)::int`,
        })
        .from(orders)
        .where(and(gte(orders.created_at, new Date(Date.now() - 6 * 24 * 3600 * 1000)), eq(orders.status_pembayaran, "lunas")))
        .groupBy(sql`to_char(${orders.created_at}, 'YYYY-MM-DD')`),
      db
        .select({
          id: orders.id,
          nomor_pesanan: orders.nomor_pesanan,
          total: orders.total,
          status_pesanan: orders.status_pesanan,
          status_pembayaran: orders.status_pembayaran,
          created_at: orders.created_at,
          nama: users.nama,
        })
        .from(orders)
        .innerJoin(users, eq(users.id, orders.user_id))
        .orderBy(desc(orders.created_at))
        .limit(5),
    ]);

  const grafik: Array<{ hari: string; total: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000);
    const kunci = d.toISOString().slice(0, 10);
    grafik.push({
      hari: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      total: grafikRows.find((g) => g.hari === kunci)?.total ?? 0,
    });
  }

  return NextResponse.json({
    penjualan_hari_ini: penjualanRows[0]?.total ?? 0,
    pesanan_baru: pesananBaruRows[0]?.jumlah ?? 0,
    pelanggan_baru: pelangganBaruRows[0]?.jumlah ?? 0,
    produk_terjual: produkTerjualRows[0]?.jumlah ?? 0,
    grafik,
    pesanan_terbaru: terbaru,
  });
}
