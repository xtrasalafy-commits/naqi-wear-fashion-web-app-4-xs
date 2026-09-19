"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, RotateCcw, Truck } from "lucide-react";
import { ImageLoader } from "@/components/ImageLoader";
import { Modal } from "@/components/Modal";
import { KotakSkeleton } from "@/components/Skeletons";
import { rupiah, tanggalJamID, LABEL_STATUS_PESANAN, warnaStatusPesanan, linkWA } from "@/lib/format";
import { useToast } from "@/store/toast";

const LANGKAH = ["Dibuat", "Dibayar", "Diproses", "Dikirim", "Selesai"];
const INDEX_STATUS: Record<string, number> = {
  menunggu_pembayaran: 0,
  dibayar: 1,
  diproses: 2,
  dikemas: 2,
  dikirim: 3,
  selesai: 4,
};

type DetailTipe = {
  pesanan: {
    id: number;
    nomor_pesanan: string;
    subtotal: number;
    diskon: number;
    ongkir: number;
    total: number;
    kurir: string;
    layanan: string;
    resi: string;
    metode_bayar: string;
    status_pembayaran: string;
    status_pesanan: string;
    catatan: string;
    kupon_kode: string;
    created_at: string;
    snapshot_alamat: Record<string, string>;
    items: Array<{ id: number; gambar_url: string; snapshot_nama: string; snapshot_varian: string; qty: number; harga: number; subtotal: number }>;
    retur: { alasan: string; status: string } | null;
  };
};

export default function HalamanDetailPesanan() {
  const { nomor } = useParams<{ nomor: string }>();
  const tampil = useToast((s) => s.tampil);
  const [data, setData] = useState<DetailTipe | null>(null);
  const [gagal, setGagal] = useState(false);
  const [modalRetur, setModalRetur] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [foto, setFoto] = useState<string[]>([]);
  const [kirim, setKirim] = useState(false);

  useEffect(() => {
    fetch(`/api/pesanan/${nomor}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setGagal(true));
  }, [nomor]);

  function unggahFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - foto.length);
    for (const f of files) {
      const reader = new FileReader();
      reader.onload = () => setFoto((x) => (x.length < 3 ? [...x, String(reader.result)] : x));
      reader.readAsDataURL(f);
    }
  }

  async function ajukanRetur() {
    setKirim(true);
    const res = await fetch(`/api/pesanan/${nomor}/retur`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alasan, foto }),
    });
    const d = await res.json();
    setKirim(false);
    if (res.ok) {
      tampil("sukses", d.pesan);
      setModalRetur(false);
      fetch(`/api/pesanan/${nomor}`).then((r) => r.json()).then(setData).catch(() => undefined);
    } else tampil("error", d.error ?? "Gagal mengajukan retur.");
  }

  if (gagal) return <p className="p-16 text-center text-slate-500">Pesanan tidak ditemukan. Silakan masuk terlebih dahulu.</p>;
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <KotakSkeleton className="h-24" />
        <KotakSkeleton className="h-64" />
      </div>
    );
  }

  const p = data.pesanan;
  const idxLangkah = INDEX_STATUS[p.status_pesanan] ?? 0;
  const dibatalkan = p.status_pesanan === "dibatalkan";
  const returDiajukan = p.status_pesanan === "retur_diajukan";
  const alamat = p.snapshot_alamat;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-zamrud-800">{p.nomor_pesanan}</h1>
          <p className="text-sm text-slate-400">{tanggalJamID(p.created_at)} • {p.metode_bayar}</p>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-extrabold ${warnaStatusPesanan(p.status_pesanan)}`}>
          {LABEL_STATUS_PESANAN[p.status_pesanan] ?? p.status_pesanan}
        </span>
      </div>

      {/* TIMELINE */}
      {dibatalkan || returDiajukan ? (
        <div className={`mt-6 rounded-2xl p-5 text-sm font-bold ${dibatalkan ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-700"}`}>
          {dibatalkan
            ? "Pesanan ini telah dibatalkan. Stok telah dikembalikan."
            : `Retur sedang ditinjau tim kami. ${p.retur ? `Alasan: ${p.retur.alasan}` : ""}`}
        </div>
      ) : (
        <ol className="mt-6 flex items-start">
          {LANGKAH.map((langkah, i) => (
            <li key={langkah} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span className={`h-1 flex-1 rounded ${i === 0 ? "bg-transparent" : i <= idxLangkah ? "bg-zamrud-600" : "bg-krem-tua"}`} />
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xs font-extrabold ${
                  i <= idxLangkah ? "border-zamrud-600 bg-zamrud-600 text-white" : "border-krem-tua bg-white text-slate-400"
                }`}>
                  {i < idxLangkah ? <Check className="h-4 w-4" /> : i === 3 ? <Truck className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`h-1 flex-1 rounded ${i === LANGKAH.length - 1 ? "bg-transparent" : i < idxLangkah ? "bg-zamrud-600" : "bg-krem-tua"}`} />
              </div>
              <span className={`mt-2 text-[11px] font-bold sm:text-xs ${i <= idxLangkah ? "text-zamrud-800" : "text-slate-400"}`}>{langkah}</span>
            </li>
          ))}
        </ol>
      )}

      {p.resi && (
        <div className="mt-5 rounded-2xl border border-emas-200 bg-emas-50 p-4 text-sm">
          <p className="font-extrabold text-tanah">Nomor Resi {p.kurir}: <span className="tracking-wider text-zamrud-800">{p.resi}</span></p>
          <a href={linkWA(`Halo Admin, saya ingin melacak resi ${p.resi} untuk pesanan ${p.nomor_pesanan}.`)} target="_blank" rel="noopener noreferrer" className="font-bold text-emas-600 hover:underline">
            Minta bantuan lacak paket →
          </a>
        </div>
      )}

      {/* ITEM */}
      <div className="mt-6 rounded-2xl border border-krem-tua bg-white p-5">
        <p className="font-display text-xl font-bold text-zamrud-800">Produk ({p.items.length})</p>
        <div className="mt-3 space-y-3">
          {p.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <ImageLoader src={it.gambar_url} alt={it.snapshot_nama} className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-zamrud-800">{it.snapshot_nama}</p>
                <p className="text-xs text-slate-500">{it.snapshot_varian} • {rupiah(it.harga)} × {it.qty}</p>
              </div>
              <p className="font-extrabold">{rupiah(it.subtotal)}</p>
            </div>
          ))}
        </div>
        <dl className="mt-4 space-y-2 border-t border-krem-tua pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-bold">{rupiah(p.subtotal)}</dd></div>
          {p.diskon > 0 && <div className="flex justify-between text-emerald-600"><dt>Diskon {p.kupon_kode && `(${p.kupon_kode})`}</dt><dd className="font-bold">− {rupiah(p.diskon)}</dd></div>}
          <div className="flex justify-between"><dt className="text-slate-500">Ongkir ({p.kurir} {p.layanan})</dt><dd className="font-bold">{rupiah(p.ongkir)}</dd></div>
          <div className="flex justify-between border-t border-krem-tua pt-3 text-base"><dt className="font-extrabold text-zamrud-800">Total</dt><dd className="font-extrabold text-zamrud-800">{rupiah(p.total)}</dd></div>
        </dl>
        {p.catatan && <p className="mt-3 rounded-xl bg-krem p-3 text-xs text-tanah"><b>Catatan:</b> {p.catatan}</p>}
      </div>

      {/* ALAMAT */}
      <div className="mt-4 rounded-2xl border border-krem-tua bg-white p-5 text-sm">
        <p className="font-display text-xl font-bold text-zamrud-800">Alamat Pengiriman</p>
        <p className="mt-2 leading-relaxed text-slate-600">
          <b>{alamat.penerima}</b> ({alamat.wa})<br />
          {alamat.alamat}, {alamat.kecamatan}, {alamat.kota}, {alamat.provinsi} {alamat.kodepos}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {p.status_pesanan === "selesai" && (
          <button onClick={() => setModalRetur(true)} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200 px-6 py-3 font-extrabold text-red-600 transition hover:bg-red-50">
            <RotateCcw className="h-5 w-5" /> Ajukan Retur
          </button>
        )}
        {p.status_pesanan === "menunggu_pembayaran" && (
          <Link href={`/checkout/sukses?nomor=${p.nomor_pesanan}`} className="rounded-2xl bg-zamrud-700 px-6 py-3 text-center font-extrabold text-white hover:bg-zamrud-600">
            Selesaikan Pembayaran
          </Link>
        )}
        <Link href="/pesanan" className="rounded-2xl border-2 border-krem-tua px-6 py-3 text-center font-extrabold text-zamrud-800 hover:bg-krem">
          Kembali ke Daftar Pesanan
        </Link>
      </div>

      <Modal buka={modalRetur} tutup={() => setModalRetur(false)} judul="Ajukan Retur Pesanan">
        <p className="text-sm text-slate-500">Retur maksimal 3 hari setelah paket diterima. Jelaskan alasan Anda dengan lengkap.</p>
        <textarea
          rows={4} value={alasan} onChange={(e) => setAlasan(e.target.value)}
          placeholder="Contoh: ukuran terlalu kecil, ingin tukar ke ukuran L…"
          className="mt-3 w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 text-sm outline-none focus:border-zamrud-500"
        />
        <label className="mt-3 block text-sm font-bold text-zamrud-800">Foto bukti (maks. 3)</label>
        <input type="file" accept="image/*" multiple onChange={unggahFoto} className="mt-1 block w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-zamrud-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-zamrud-700" />
        {foto.length > 0 && (
          <div className="mt-2 flex gap-2">
            {foto.map((f, i) => <img key={i} src={f} alt="Bukti retur" className="h-16 w-16 rounded-lg object-cover" />)}
          </div>
        )}
        <button onClick={ajukanRetur} disabled={kirim || alasan.length < 10}
          className="mt-4 w-full rounded-2xl bg-red-600 py-3.5 font-extrabold text-white transition hover:bg-red-500 disabled:opacity-50">
          {kirim ? "Mengirim…" : "Kirim Pengajuan Retur"}
        </button>
      </Modal>
    </div>
  );
}
