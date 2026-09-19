"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle, Package } from "lucide-react";
import { rupiah, linkWA } from "@/lib/format";
import { useToast } from "@/store/toast";
import { KotakSkeleton } from "@/components/Skeletons";

const INSTRUKSI: Record<string, string> = {
  QRIS: "Buka aplikasi bank atau e-wallet Anda, lalu scan kode QRIS yang dikirim admin melalui WhatsApp/email.",
  "Virtual Account": "Bayar melalui m-banking atau ATM menggunakan nomor Virtual Account yang dikirim admin.",
  "Transfer Bank": "Transfer ke rekening BCA 8830-1122-99 a.n. NAQI WEAR, lalu kirim bukti transfer ke admin.",
  "E-Wallet": "Kirim pembayaran ke akun GoPay/OVO/DANA 0812-3456-7890 a.n. NAQI WEAR.",
  "Kartu Kredit/Debit": "Admin akan mengirimkan tautan pembayaran kartu yang aman melalui WhatsApp.",
  COD: "Siapkan uang tunai sesuai total. Kurir akan menagih saat paket tiba.",
};

function SuksesIsi() {
  const nomor = useSearchParams().get("nomor") ?? "";
  const tampil = useToast((s) => s.tampil);
  const [pesanan, setPesanan] = useState<{ nomor_pesanan: string; total: number; metode_bayar: string; status_pembayaran: string } | null>(null);
  const [memuatBayar, setMemuatBayar] = useState(false);

  useEffect(() => {
    if (nomor) fetch(`/api/pesanan/${nomor}`).then((r) => r.json()).then((d) => setPesanan(d.pesanan)).catch(() => undefined);
  }, [nomor]);

  async function konfirmasiBayar() {
    setMemuatBayar(true);
    const res = await fetch(`/api/pesanan/${nomor}/bayar`, { method: "POST" });
    const d = await res.json();
    setMemuatBayar(false);
    if (res.ok) {
      tampil("sukses", d.pesan);
      setPesanan((p) => (p ? { ...p, status_pembayaran: "lunas" } : p));
    } else tampil("error", d.error ?? "Gagal konfirmasi pembayaran.");
  }

  if (!nomor) return <p className="p-20 text-center text-slate-500">Pesanan tidak ditemukan.</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center">
      <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-500" />
      <h1 className="mt-5 font-display text-4xl font-bold text-zamrud-800">Alhamdulillah, Pesanan Dibuat!</h1>
      <p className="mt-2 text-slate-500">Terima kasih sudah berbelanja di NAQI WEAR.</p>
      <div className="mt-6 rounded-3xl border-2 border-dashed border-emas-400 bg-white p-6">
        <p className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">Nomor Pesanan Anda</p>
        <p className="mt-1 text-3xl font-extrabold tracking-wide text-zamrud-800">{nomor}</p>
        {pesanan ? (
          <>
            <p className="mt-3 text-lg">
              Total: <span className="font-extrabold text-emas-600">{rupiah(pesanan.total)}</span>
              <span className="text-sm text-slate-500"> • {pesanan.metode_bayar}</span>
            </p>
            {pesanan.status_pembayaran !== "lunas" ? (
              <>
                <p className="mt-4 rounded-xl bg-krem p-4 text-left text-sm leading-relaxed text-tanah">
                  {INSTRUKSI[pesanan.metode_bayar] ?? "Selesaikan pembayaran sesuai metode yang dipilih."}
                </p>
                <button
                  onClick={konfirmasiBayar}
                  disabled={memuatBayar}
                  className="mt-4 w-full rounded-2xl bg-zamrud-700 py-4 font-extrabold text-white transition hover:bg-zamrud-600 disabled:opacity-60"
                >
                  {memuatBayar ? "Memproses…" : "Saya Sudah Bayar — Konfirmasi Sekarang"}
                </button>
              </>
            ) : (
              <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                ✓ Pembayaran diterima. Pesanan Anda akan segera diproses.
              </p>
            )}
          </>
        ) : (
          <KotakSkeleton className="mx-auto mt-4 h-16 w-2/3" />
        )}
      </div>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={linkWA(`Assalamu'alaikum Admin, saya ingin konfirmasi pesanan ${nomor}.`)}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 font-extrabold text-white transition hover:bg-emerald-500"
        >
          <MessageCircle className="h-5 w-5" /> Chat WhatsApp Admin
        </a>
        <Link href="/pesanan" className="flex items-center justify-center gap-2 rounded-full border-2 border-zamrud-700 px-7 py-3.5 font-extrabold text-zamrud-800 transition hover:bg-krem">
          <Package className="h-5 w-5" /> Lihat Pesanan Saya
        </Link>
      </div>
    </div>
  );
}

export default function HalamanSukses() {
  return (
    <Suspense>
      <SuksesIsi />
    </Suspense>
  );
}
