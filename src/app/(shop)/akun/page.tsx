"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, MapPin, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

export default function HalamanAkun() {
  const router = useRouter();
  const { user, dimuat, muat, keluar } = useAuth();
  const tampil = useToast((s) => s.tampil);
  const [profil, setProfil] = useState({ nama: "", nomor_wa: "", gender: "", tanggal_lahir: "" });
  const [alamat, setAlamat] = useState({ penerima: "", wa: "", alamat: "", provinsi: "", kota: "", kecamatan: "", kodepos: "" });
  const [sandi, setSandi] = useState({ lama: "", baru: "" });
  const [simpan, setSimpan] = useState(false);

  useEffect(() => {
    if (!dimuat) muat();
  }, [dimuat, muat]);

  useEffect(() => {
    if (user) {
      setProfil({ nama: user.nama, nomor_wa: user.nomor_wa, gender: user.gender, tanggal_lahir: user.tanggal_lahir });
      const a = user.alamat_json;
      if (a) setAlamat({
        penerima: a.penerima ?? user.nama, wa: a.wa ?? user.nomor_wa, alamat: a.alamat ?? "",
        provinsi: a.provinsi ?? "", kota: a.kota ?? "", kecamatan: a.kecamatan ?? "", kodepos: a.kodepos ?? "",
      });
    }
  }, [user]);

  if (!dimuat) return <div className="p-16" />;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Akun Saya</h1>
        <p className="mt-2 text-slate-500">Silakan masuk untuk mengelola akun Anda.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/masuk" className="rounded-full bg-zamrud-700 px-8 py-3 font-extrabold text-white">Masuk</Link>
          <Link href="/daftar" className="rounded-full border-2 border-zamrud-700 px-8 py-3 font-extrabold text-zamrud-800">Daftar</Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 text-sm outline-none focus:border-zamrud-500";

  async function simpanProfil() {
    setSimpan(true);
    const res = await fetch("/api/akun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipe: "profil", ...profil, alamat_json: alamat }),
    });
    const d = await res.json();
    setSimpan(false);
    if (res.ok) {
      tampil("sukses", d.pesan);
      muat();
    } else tampil("error", d.error ?? "Gagal menyimpan.");
  }

  async function gantiSandi(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/akun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipe: "password", lama: sandi.lama, baru: sandi.baru }),
    });
    const d = await res.json();
    if (res.ok) {
      tampil("sukses", d.pesan);
      setSandi({ lama: "", baru: "" });
    } else tampil("error", d.error ?? "Gagal mengubah kata sandi.");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-zamrud-700 text-2xl font-extrabold text-emas-300">
          {user.nama.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold text-zamrud-800">{user.nama}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/pesanan" className="rounded-full bg-zamrud-50 px-5 py-2.5 text-sm font-bold text-zamrud-800 hover:bg-zamrud-100">Pesanan Saya</Link>
        <Link href="/wishlist" className="rounded-full bg-zamrud-50 px-5 py-2.5 text-sm font-bold text-zamrud-800 hover:bg-zamrud-100">Wishlist</Link>
        <Link href="/promo" className="rounded-full bg-emas-50 px-5 py-2.5 text-sm font-bold text-tanah hover:bg-emas-100">Voucher Promo</Link>
        {user.role === "admin" && (
          <Link href="/admin" className="rounded-full bg-tanah px-5 py-2.5 text-sm font-bold text-white">Dashboard Admin</Link>
        )}
      </div>

      {/* PROFIL */}
      <section className="mt-8 rounded-2xl border border-krem-tua bg-white p-6">
        <p className="flex items-center gap-2 font-display text-xl font-bold text-zamrud-800"><User className="h-5 w-5 text-emas-500" /> Data Diri</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Nama Lengkap</label>
            <input className={inputCls} value={profil.nama} onChange={(e) => setProfil({ ...profil, nama: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Nomor WhatsApp</label>
            <input className={inputCls} value={profil.nomor_wa} onChange={(e) => setProfil({ ...profil, nomor_wa: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Jenis Kelamin</label>
            <select className={inputCls} value={profil.gender} onChange={(e) => setProfil({ ...profil, gender: e.target.value })}>
              <option value="">Pilih…</option><option value="wanita">Wanita</option><option value="pria">Pria</option>
            </select></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Tanggal Lahir</label>
            <input type="date" className={inputCls} value={profil.tanggal_lahir} onChange={(e) => setProfil({ ...profil, tanggal_lahir: e.target.value })} /></div>
        </div>
      </section>

      {/* ALAMAT */}
      <section className="mt-5 rounded-2xl border border-krem-tua bg-white p-6">
        <p className="flex items-center gap-2 font-display text-xl font-bold text-zamrud-800"><MapPin className="h-5 w-5 text-emas-500" /> Alamat Utama</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Nama Penerima</label>
            <input className={inputCls} value={alamat.penerima} onChange={(e) => setAlamat({ ...alamat, penerima: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Nomor WhatsApp</label>
            <input className={inputCls} value={alamat.wa} onChange={(e) => setAlamat({ ...alamat, wa: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold text-zamrud-800">Alamat Lengkap</label>
            <textarea rows={2} className={inputCls} value={alamat.alamat} onChange={(e) => setAlamat({ ...alamat, alamat: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Provinsi</label>
            <input className={inputCls} value={alamat.provinsi} onChange={(e) => setAlamat({ ...alamat, provinsi: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kota</label>
            <input className={inputCls} value={alamat.kota} onChange={(e) => setAlamat({ ...alamat, kota: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kecamatan</label>
            <input className={inputCls} value={alamat.kecamatan} onChange={(e) => setAlamat({ ...alamat, kecamatan: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kode Pos</label>
            <input className={inputCls} value={alamat.kodepos} onChange={(e) => setAlamat({ ...alamat, kodepos: e.target.value })} /></div>
        </div>
        <button onClick={simpanProfil} disabled={simpan}
          className="mt-5 rounded-2xl bg-zamrud-700 px-8 py-3.5 font-extrabold text-white transition hover:bg-zamrud-600 disabled:opacity-60">
          {simpan ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </section>

      {/* PASSWORD */}
      <section className="mt-5 rounded-2xl border border-krem-tua bg-white p-6">
        <p className="flex items-center gap-2 font-display text-xl font-bold text-zamrud-800"><ShieldCheck className="h-5 w-5 text-emas-500" /> Ubah Kata Sandi</p>
        <form onSubmit={gantiSandi} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kata Sandi Lama</label>
            <input type="password" className={inputCls} value={sandi.lama} onChange={(e) => setSandi({ ...sandi, lama: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-bold text-zamrud-800">Kata Sandi Baru</label>
            <input type="password" minLength={6} className={inputCls} value={sandi.baru} onChange={(e) => setSandi({ ...sandi, baru: e.target.value })} /></div>
          <button className="rounded-2xl border-2 border-zamrud-700 px-6 py-3 font-extrabold text-zamrud-800 transition hover:bg-zamrud-50 sm:col-span-2">
            Perbarui Kata Sandi
          </button>
        </form>
      </section>

      <button
        onClick={async () => { await keluar(); tampil("info", "Anda telah keluar. Sampai jumpa lagi!"); router.push("/"); }}
        className="mt-6 flex items-center gap-2 rounded-2xl border-2 border-red-200 px-6 py-3 font-extrabold text-red-600 transition hover:bg-red-50"
      >
        <LogOut className="h-5 w-5" /> Keluar dari Akun
      </button>
    </div>
  );
}
