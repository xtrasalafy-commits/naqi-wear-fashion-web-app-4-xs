import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { and, gte, lte, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const tipe = q.get("tipe") ?? "penjualan";
  const dari = q.get("dari") ?? new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const sampai = q.get("sampai") ?? new Date().toISOString().slice(0, 10);
  const mulai = new Date(dari + "T00:00:00");
  const akhir = new Date(sampai + "T23:59:59");

  if (tipe === "produk") {
    const rows = await db
      .select({
        snapshot_nama: orderItems.snapshot_nama,
        qty: orderItems.qty,
        subtotal: orderItems.subtotal,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.order_id))
      .where(and(gte(orders.created_at, mulai), lte(orders.created_at, akhir)));
    const rekap = new Map<string, { nama: string; qty: number; omzet: number }>();
    for (const r of rows) {
      const ada = rekap.get(r.snapshot_nama) ?? { nama: r.snapshot_nama, qty: 0, omzet: 0 };
      ada.qty += r.qty;
      ada.omzet += r.subtotal;
      rekap.set(r.snapshot_nama, ada);
    }
    const daftar = [...rekap.values()].sort((a, b) => b.qty - a.qty);
    const csv = ["Produk;Terjual;Omzet", ...daftar.map((d) => `${d.nama};${d.qty};${d.omzet}`)].join("\n");
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=produk-terlaris-${dari}-${sampai}.csv` },
    });
  }

  const rows = await db
    .select({
      nomor: orders.nomor_pesanan,
      tanggal: orders.created_at,
      nama: users.nama,
      status_pembayaran: orders.status_pembayaran,
      status_pesanan: orders.status_pesanan,
      subtotal: orders.subtotal,
      diskon: orders.diskon,
      ongkir: orders.ongkir,
      total: orders.total,
      kurir: orders.kurir,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.user_id))
    .where(and(gte(orders.created_at, mulai), lte(orders.created_at, akhir)));

  const csv = [
    "Nomor Pesanan;Tanggal;Pelanggan;Status Pembayaran;Status Pesanan;Subtotal;Diskon;Ongkir;Total;Kurir",
    ...rows.map((r) =>
      [
        r.nomor,
        new Date(r.tanggal).toLocaleString("id-ID"),
        r.nama,
        r.status_pembayaran,
        r.status_pesanan,
        r.subtotal,
        r.diskon,
        r.ongkir,
        r.total,
        r.kurir,
      ].join(";")
    ),
  ].join("\n");
  return new NextResponse("\uFEFF" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=penjualan-${dari}-${sampai}.csv` },
  });
}
