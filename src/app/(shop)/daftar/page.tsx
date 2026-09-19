"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

export default function HalamanDaftar() {
  const router = useRouter();
  const { setUser } = useAuth();
  const tampil = useToast((s) => s.tampil);
  const [form, setForm] = useState({ nama: "", email: "", nomor_wa: "", password: "" });
  const [proses, setProses] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setProses(true);
    const res = await fetch("/api/auth/daftar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setProses(false);
    if (!res.ok) {
      tampil("error", data.error ?? "Pendaftaran gagal. Coba lagi.");
      return;
    }
    setUser(data.user);
    tampil("sukses", `Ahlan wa sahlan, ${data.user.nama}! Akun Anda siap digunakan.`);
    router.push("/");
  }

  const ubah = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-3xl border border-krem-tua bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Daftar Akun</h1>
        <p className="mt-1 text-sm text-slate-500">Gratis dan hanya butuh 1 menit.</p>
        <form onSubmit={kirim} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-zamrud-800">Nama Lengkap</label>
            <input required value={form.nama} onChange={ubah("nama")} placeholder="Contoh: Siti Aminah"
              className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 outline-none focus:border-zamrud-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-zamrud-800">Email</label>
            <input type="email" required value={form.email} onChange={ubah("email")} placeholder="nama@email.com"
              className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 outline-none focus:border-zamrud-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-zamrud-800">Nomor WhatsApp</label>
            <input required value={form.nomor_wa} onChange={ubah("nomor_wa")} placeholder="08xxxxxxxxxx"
              className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 outline-none focus:border-zamrud-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-zamrud-800">Kata Sandi (min. 6 karakter)</label>
            <input type="password" required minLength={6} value={form.password} onChange={ubah("password")} placeholder="••••••••"
              className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 outline-none focus:border-zamrud-500" />
          </div>
          <button
            disabled={proses}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zamrud-700 py-3.5 text-base font-extrabold text-white transition hover:bg-zamrud-600 disabled:opacity-60"
          >
            <UserPlus className="h-5 w-5" /> {proses ? "Memproses…" : "Daftar Sekarang"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-bold text-zamrud-700 hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
