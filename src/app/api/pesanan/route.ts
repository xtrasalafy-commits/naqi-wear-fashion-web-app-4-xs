import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants, productImages, orders, orderItems, payments, coupons, notifications, users } from "@/db/schema";
import { eq, and, inArray, desc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { validasiKupon } from "@/lib/kupon";
import { daftarKurir } from "@/lib/ongkir";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu untuk checkout." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const itemsIn: Array<{ variant_id: number; qty: number }> = Array.isArray(body?.items) ? body.items : [];
  const alamat = body?.alamat ?? {};
  if (itemsIn.length === 0) return NextResponse.json({ error: "Keranjang masih kosong." }, { status: 400 });
  if (!alamat.penerima || !alamat.alamat || !alamat.kodepos) {
    return NextResponse.json({ error: "Mohon lengkapi alamat pengiriman." }, { status: 400 });
  }

  const variantIds = itemsIn.map((i) => Number(i.variant_id)).filter(Boolean);
  const varian = await db
    .select({
      v: productVariants,
      nama: products.nama,
      slug: products.slug,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.product_id))
    .where(inArray(productVariants.id, variantIds));

  if (varian.length !== variantIds.length) {
    return NextResponse.json({ error: "Sebagian produk tidak ditemukan. Muat ulang keranjang Anda." }, { status: 400 });
  }
  for (const v of varian) {
    const qty = itemsIn.find((i) => Number(i.variant_id) === v.v.id)?.qty ?? 0;
    if (qty <= 0) return NextResponse.json({ error: "Jumlah produk tidak valid." }, { status: 400 });
    if (v.v.stok < qty) {
      return NextResponse.json({ error: `Stok ${v.nama} (${v.v.warna}, ${v.v.ukuran}) tersisa ${v.v.stok}.` }, { status: 409 });
    }
  }

  const subtotal = varian.reduce((a, v) => {
    const qty = itemsIn.find((i) => Number(i.variant_id) === v.v.id)?.qty ?? 0;
    return a + v.v.harga * qty;
  }, 0);
  const berat = varian.reduce((a, v) => {
    const qty = itemsIn.find((i) => Number(i.variant_id) === v.v.id)?.qty ?? 0;
    return a + v.v.berat_gram * qty;
  }, 0);

  const hasilKupon = await validasiKupon(String(body?.kupon_kode ?? ""), subtotal);
  const diskon = hasilKupon.valid ? hasilKupon.diskon : 0;

  const namaKurir = String(body?.kurir ?? "JNE");
  const layananKurir = String(body?.layanan ?? "REG");
  const opsiKurir = daftarKurir(String(alamat.kodepos), berat);
  const terpilih = opsiKurir.find((k) => k.nama === namaKurir && k.layanan === layananKurir) ?? opsiKurir[0];
  const ongkir = terpilih?.biaya ?? 0;
  const total = subtotal - diskon + ongkir;

  const nomor = `NQW-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

  const order = (
    await db
      .insert(orders)
      .values({
        nomor_pesanan: nomor,
        user_id: user.id,
        snapshot_alamat: alamat,
        subtotal,
        diskon,
        ongkir,
        total,
        kurir: namaKurir,
        layanan: layananKurir,
        kupon_kode: hasilKupon.valid ? hasilKupon.kupon!.kode : "",
        metode_bayar: String(body?.metode_bayar ?? "QRIS"),
        status_pembayaran: "menunggu",
        status_pesanan: "menunggu_pembayaran",
        catatan: String(body?.catatan ?? ""),
      })
      .returning()
  )[0];

  const gambarMap = new Map<number, string>();
  const prodIds = varian.map((v) => v.v.product_id);
  if (prodIds.length) {
    const imgs = await db.select().from(productImages).where(inArray(productImages.product_id, prodIds));
    for (const g of imgs) if (!gambarMap.has(g.product_id)) gambarMap.set(g.product_id, g.gambar_url);
  }

  for (const v of varian) {
    const qty = itemsIn.find((i) => Number(i.variant_id) === v.v.id)?.qty ?? 0;
    await db.insert(orderItems).values({
      order_id: order.id,
      product_id: v.v.product_id,
      variant_id: v.v.id,
      snapshot_nama: v.nama,
      snapshot_sku: v.v.sku,
      snapshot_varian: `${v.v.warna} • ${v.v.ukuran}`,
      qty,
      harga: v.v.harga,
      subtotal: v.v.harga * qty,
      gambar_url: gambarMap.get(v.v.product_id) ?? v.v.gambar_url,
    });
    await db
      .update(productVariants)
      .set({ stok: sql`${productVariants.stok} - ${qty}` })
      .where(eq(productVariants.id, v.v.id));
  }

  if (hasilKupon.valid && hasilKupon.kupon) {
    await db.update(coupons).set({ terpakai: sql`${coupons.terpakai} + 1` }).where(eq(coupons.id, hasilKupon.kupon.id));
  }

  await db.insert(payments).values({
    order_id: order.id,
    metode: order.metode_bayar,
    jumlah: total,
    status: "menunggu",
  });
  await db.insert(notifications).values({
    user_id: user.id,
    tipe: "pesanan",
    judul: "Pesanan dibuat",
    pesan: `Pesanan ${nomor} berhasil dibuat. Silakan selesaikan pembayaran.`,
  });
  await db.update(users).set({ alamat_json: alamat }).where(eq(users.id, user.id));

  return NextResponse.json({ nomor_pesanan: nomor, total, metode_bayar: order.metode_bayar });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const daftar = await db.select().from(orders).where(eq(orders.user_id, user.id)).orderBy(desc(orders.created_at));
  const ids = daftar.map((o) => o.id);
  const items = ids.length
    ? await db.select().from(orderItems).where(inArray(orderItems.order_id, ids))
    : [];
  return NextResponse.json({
    pesanan: daftar.map((o) => ({
      ...o,
      items: items.filter((i) => i.order_id === o.id),
    })),
  });
}
