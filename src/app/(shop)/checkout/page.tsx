"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Check, CreditCard, Landmark, MapPin, QrCode, Smartphone, Truck, Wallet } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { rupiah } from "@/lib/format";
import { useCart, subtotalKeranjang, totalBerat } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

const METODE_BAYAR = [
  { id: "QRIS", nama: "QRIS", deskripsi: "Bayar dengan scan QR dari semua aplikasi bank & e-wallet.", Ikon: QrCode },
  { id: "Virtual Account", nama: "Virtual Account", deskripsi: "BCA, BRI, Mandiri, BNI — bayar dari m-banking/ATM.", Ikon: Landmark },
  { id: "Transfer Bank", nama: "Transfer Bank", deskripsi: "Transfer manual ke rekening NAQI WEAR.", Ikon: Banknote },
  { id: "E-Wallet", nama: "E-Wallet", deskripsi: "GoPay, OVO, DANA, ShopeePay.", Ikon: Wallet },
  { id: "Kartu Kredit/Debit", nama: "Kartu Kredit/Debit", deskripsi: "Visa, Mastercard, GPN.", Ikon: CreditCard },
  { id: "COD", nama: "Bayar di Tempat (COD)", deskripsi: "Bayar tunai saat paket sampai di rumah Anda.", Ikon: Smartphone },
];

type Alamat = { penerima: string; wa: string; alamat: string; provinsi: string; kota: string; kecamatan: string; kodepos: string };
type KurirOpsi = { nama: string; layanan: string; biaya: number; estimasi: string; catatan: string };

const ALAMAT_KOSONG: Alamat = { penerima: "", wa: "", alamat: "", provinsi: "", kota: "", kecamatan: "", kodepos: "" };

export default function HalamanCheckout() {
  const router = useRouter();
  const { items, kosongkan } = useCart();
  const { user, dimuat, muat } = useAuth();
  const tampil = useToast((s) => s.tampil);

  const [langkah, setLangkah] = useState(1);
  const [alamat, setAlamat] = useState<Alamat>(ALAMAT_KOSONG);
  const [kurirList, setKurirList] = useState<KurirOpsi[]>([]);
  const [kurirPilih, setKurirPilih] = useState<KurirOpsi | null>(null);
  const [metode, setMetode] = useState("QRIS");
  const [catatan, setCatatan] = useState("");
  const [proses, setProses] = useState(false);

  useEffect(() => {
    if (!dimuat) muat();
  }, [dimuat, muat]);

  useEffect(() => {
    if (user?.alamat_json) setAlamat((a) => ({ ...ALAMAT_KOSONG, ...(user.alamat_json as Partial<Alamat>) }));
    else if (user) setAlamat((a) => ({ ...a, penerima: user.nama, wa: user.nomor_wa }));
  }, [user]);

  useEffect(() => {
    if (langkah === 2 && /^\d{5}$/.test(alamat.kodepos)) {
      fetch("/api/ongkir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kodepos: alamat.kodepos, berat: totalBerat(items) }),
      })
        .then((r) => r.json())
        .then((d) => {
          setKurirList(d.kurir ?? []);
          if (d.kurir?.length) setKurirPilih(d.kurir[0]);
        });
    }
  }, [langkah, alamat.kodepos, items]);

  const subtotal = subtotalKeranjang(items);
  const voucher = useMemo(() => {
    if (typeof window === "undefined") return null;
    const s = sessionStorage.getItem("naqi-voucher");
    return s ? (JSON.parse(s) as { kode: string; diskon: number }) : null;
  }, []);
  const diskon = Math.min(voucher?.diskon ?? 0, subtotal);
  const total = subtotal - diskon + (kurirPilih?.biaya ?? 0);

  if (!dimuat) return <div className="p-16 text-center text-slate-500">Memuat…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Masuk Dahulu</h1>
        <p className="mt-2 text-slate-500">Untuk melanjutkan checkout, silakan masuk atau daftar akun gratis.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/masuk" className="rounded-full bg-zamrud-700 px-8 py-3 font-extrabold text-white hover:bg-zamrud-600">Masuk</Link>
          <Link href="/daftar" className="rounded-full border-2 border-zamrud-700 px-8 py-3 font-extrabold text-zamrud-800 hover:bg-krem">Daftar</Link>
        </div>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Keranjang Kosong</h1>
        <Link href="/katalog" className="mt-4 inline-block rounded-full bg-zamrud-700 px-8 py-3 font-extrabold text-white">Ke Katalog</Link>
      </div>
    );
  }

  function lanjutKeLangkah2() {
    if (!alamat.penerima || !alamat.wa || !alamat.alamat || !alamat.provinsi || !alamat.kota || !alamat.kodepos) {
      tampil("error", "Mohon lengkapi semua kolom alamat terlebih dahulu.");
      return;
    }
    fetch("/api/akun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipe: "profil", alamat_json: alamat }),
    }).catch(() => undefined);
    setLangkah(2);
  }

  async function buatPesanan() {
    if (!kurirPilih) {
      tampil("error", "Silakan pilih kurir pengiriman.");
      return;
    }
    setProses(true);
    const res = await fetch("/api/pesanan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variant_id: i.variantId, qty: i.qty })),
        alamat,
        kurir: kurirPilih.nama,
        layanan: kurirPilih.layanan,
        metode_bayar: metode,
        kupon_kode: voucher?.kode ?? "",
        catatan,
      }),
    });
    const d = await res.json();
    setProses(false);
    if (!res.ok) {
      tampil("error", d.error ?? "Gagal membuat pesanan. Coba lagi.");
      return;
    }
    kosongkan();
    sessionStorage.removeItem("naqi-voucher");
    tampil("sukses", "Alhamdulillah! Pesanan Anda berhasil dibuat.");
    router.push(`/checkout/sukses?nomor=${d.nomor_pesanan}`);
  }

  const inputCls = "w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 text-sm outline-none focus:border-zamrud-500";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <h1 className="font-display text-3xl font-bold text-zamrud-800 md:text-4xl">Checkout</h1>
      {/* STEPPER */}
      <ol className="mt-5 flex items-center gap-2">
        {["Alamat", "Pengiriman & Bayar", "Review"].map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
              langkah > i ? "bg-zamrud-700 text-white" : langkah === i + 1 ? "bg-emas-400 text-zamrud-900" : "bg-krem-tua text-slate-400"
            }`}>
              {langkah > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`hidden text-sm font-bold sm:block ${langkah >= i + 1 ? "text-zamrud-800" : "text-slate-400"}`}>{label}</span>
            {i < 2 && <span className="h-0.5 flex-1 rounded bg-krem-tua" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {langkah === 1 && (
            <div className="rounded-2xl border border-krem-tua bg-white p-6">
              <p className="flex items-center gap-2 font-display text-xl font-bold text-zamrud-800">
                <MapPin className="h-5 w-5 text-emas-500" /> Alamat Pengiriman
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Nama Penerima</label>
                  <input className={inputCls} value={alamat.penerima} onChange={(e) => setAlamat({ ...alamat, penerima: e.target.value })} placeholder="Nama lengkap" /></div>
                <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Nomor WhatsApp</label>
                  <input className={inputCls} value={alamat.wa} onChange={(e) => setAlamat({ ...alamat, wa: e.target.value })} placeholder="08xxxxxxxxxx" /></div>
                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold text-zamrud-800">Alamat Lengkap</label>
                  <textarea className={inputCls} rows={2} value={alamat.alamat} onChange={(e) => setAlamat({ ...alamat, alamat: e.target.value })} placeholder="Nama jalan, nomor rumah, RT/RW, patokan" /></div>
                <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Provinsi</label>
                  <input className={inputCls} value={alamat.provinsi} onChange={(e) => setAlamat({ ...alamat, provinsi: e.target.value })} placeholder="Contoh: DKI Jakarta" /></div>
                <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kota/Kabupaten</label>
                  <input className={inputCls} value={alamat.kota} onChange={(e) => setAlamat({ ...alamat, kota: e.target.value })} placeholder="Contoh: Jakarta Selatan" /></div>
                <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kecamatan</label>
                  <input className={inputCls} value={alamat.kecamatan} onChange={(e) => setAlamat({ ...alamat, kecamatan: e.target.value })} placeholder="Contoh: Tebet" /></div>
                <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kode Pos</label>
                  <input className={inputCls} value={alamat.kodepos} onChange={(e) => setAlamat({ ...alamat, kodepos: e.target.value.replace(/\D/g, "").slice(0, 5) })} placeholder="5 digit" /></div>
              </div>
              <button onClick={lanjutKeLangkah2} className="mt-6 w-full rounded-2xl bg-zamrud-700 py-4 text-base font-extrabold text-white transition hover:bg-zamrud-600 sm:w-auto sm:px-10">
                Simpan & Lanjutkan
              </button>
            </div>
          )}

          {langkah === 2 && (
            <>
              <div className="rounded-2xl border border-krem-tua bg-white p-6">
                <p className="flex items-center gap-2 font-display text-xl font-bold text-zamrud-800">
                  <Truck className="h-5 w-5 text-emas-500" /> Pilih Kurir Pengiriman
                </p>
                <div className="mt-4 space-y-3">
                  {kurirList.length === 0 && <p className="text-sm text-slate-500">Memuat pilihan kurir…</p>}
                  {kurirList.map((k) => (
                    <label key={k.nama + k.layanan} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${
                      kurirPilih?.nama === k.nama && kurirPilih?.layanan === k.layanan ? "border-zamrud-600 bg-zamrud-50" : "border-krem-tua hover:border-zamrud-300"
                    }`}>
                      <input
                        type="radio" name="kurir" className="h-5 w-5 accent-zamrud-700"
                        checked={kurirPilih?.nama === k.nama && kurirPilih?.layanan === k.layanan}
                        onChange={() => setKurirPilih(k)}
                      />
                      <div className="flex-1">
                        <p className="font-extrabold text-zamrud-800">{k.nama} {k.layanan}</p>
                        <p className="text-xs text-slate-500">{k.catatan} • Estimasi {k.estimasi}</p>
                      </div>
                      <p className="font-extrabold text-zamrud-800">{rupiah(k.biaya)}</p>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-krem-tua bg-white p-6">
                <p className="font-display text-xl font-bold text-zamrud-800">Pilih Metode Pembayaran</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {METODE_BAYAR.map((m) => (
                    <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                      metode === m.id ? "border-zamrud-600 bg-zamrud-50" : "border-krem-tua hover:border-zamrud-300"
                    }`}>
                      <input type="radio" name="bayar" className="mt-1 h-5 w-5 accent-zamrud-700" checked={metode === m.id} onChange={() => setMetode(m.id)} />
                      <div>
                        <p className="flex items-center gap-2 font-extrabold text-zamrud-800"><m.Ikon className="h-4 w-4 text-emas-500" /> {m.nama}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{m.deskripsi}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setLangkah(1)} className="rounded-2xl border-2 border-krem-tua px-8 py-3.5 font-extrabold text-zamrud-800 hover:bg-krem">Kembali</button>
                <button onClick={() => (kurirPilih ? setLangkah(3) : tampil("error", "Silakan pilih kurir terlebih dahulu."))}
                  className="flex-1 rounded-2xl bg-zamrud-700 py-3.5 font-extrabold text-white transition hover:bg-zamrud-600">
                  Lanjut ke Review
                </button>
              </div>
            </>
          )}

          {langkah === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-krem-tua bg-white p-6">
                <p className="font-display text-xl font-bold text-zamrud-800">Periksa Pesanan Anda</p>
                <div className="mt-4 space-y-3">
                  {items.map((i) => (
                    <div key={i.variantId} className="flex items-center gap-3">
                      <ImageLoader src={i.gambar} alt={i.nama} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-zamrud-800">{i.nama}</p>
                        <p className="text-xs text-slate-500">{i.warna} • {i.ukuran} • {i.qty} pcs</p>
                      </div>
                      <p className="text-sm font-extrabold">{rupiah(i.harga * i.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 rounded-xl bg-krem p-4 text-sm sm:grid-cols-2">
                  <p><span className="font-bold text-zamrud-800">Dikirim ke:</span><br />{alamat.penerima} ({alamat.wa})<br />{alamat.alamat}, {alamat.kecamatan}, {alamat.kota}, {alamat.provinsi} {alamat.kodepos}</p>
                  <p><span className="font-bold text-zamrud-800">Pengiriman:</span> {kurirPilih?.nama} {kurirPilih?.layanan}<br />
                    <span className="font-bold text-zamrud-800">Pembayaran:</span> {metode}</p>
                </div>
                <label className="mt-4 block text-xs font-bold text-zamrud-800">Catatan untuk penjual (opsional)</label>
                <textarea rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: tolong dipacking kado"
                  className="mt-1 w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 text-sm outline-none focus:border-zamrud-500" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setLangkah(2)} className="rounded-2xl border-2 border-krem-tua px-8 py-3.5 font-extrabold text-zamrud-800 hover:bg-krem">Kembali</button>
                <button onClick={buatPesanan} disabled={proses}
                  className="flex-1 rounded-2xl bg-emas-400 py-4 text-base font-extrabold text-zamrud-900 shadow-md transition hover:bg-emas-300 disabled:opacity-60">
                  {proses ? "Memproses Pesanan…" : "Buat Pesanan & Bayar"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RINGKASAN */}
        <div className="h-fit rounded-2xl border border-krem-tua bg-white p-5 lg:sticky lg:top-40">
          <p className="font-display text-xl font-bold text-zamrud-800">Ringkasan</p>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-bold">{rupiah(subtotal)}</dd></div>
            {diskon > 0 && <div className="flex justify-between text-emerald-600"><dt>Diskon ({voucher?.kode})</dt><dd className="font-bold">− {rupiah(diskon)}</dd></div>}
            <div className="flex justify-between"><dt className="text-slate-500">Ongkir</dt><dd className="font-bold">{kurirPilih ? rupiah(kurirPilih.biaya) : "—"}</dd></div>
            <div className="flex justify-between border-t border-krem-tua pt-3 text-base">
              <dt className="font-extrabold text-zamrud-800">Total</dt><dd className="font-extrabold text-zamrud-800">{rupiah(total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
