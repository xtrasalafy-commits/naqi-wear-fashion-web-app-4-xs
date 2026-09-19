"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

export default function HalamanMasuk() {
  const router = useRouter();
  const { setUser } = useAuth();
  const tampil = useToast((s) => s.tampil);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [proses, setProses] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setProses(true);
    const res = await fetch("/api/auth/masuk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setProses(false);
    if (!res.ok) {
      tampil("error", data.error ?? "Gagal masuk. Coba lagi.");
      return;
    }
    setUser(data.user);
    tampil("sukses", `Selamat datang kembali, ${data.user.nama}!`);
    router.push(data.user.role === "admin" ? "/admin" : "/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-3xl border border-krem-tua bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Masuk</h1>
        <p className="mt-1 text-sm text-slate-500">Selamat datang kembali di NAQI WEAR.</p>
        <form onSubmit={kirim} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-zamrud-800">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 outline-none focus:border-zamrud-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-zamrud-800">Kata Sandi</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border-2 border-krem-tua bg-krem px-4 py-3 outline-none focus:border-zamrud-500"
            />
          </div>
          <button
            disabled={proses}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zamrud-700 py-3.5 text-base font-extrabold text-white transition hover:bg-zamrud-600 disabled:opacity-60"
          >
            <LogIn className="h-5 w-5" /> {proses ? "Memproses…" : "Masuk"}
          </button>
        </form>
        <div className="mt-4 rounded-xl bg-emas-50 p-4 text-xs leading-relaxed text-tanah">
          <p className="font-bold">Akun demo:</p>
          <p>Pelanggan: demo@naqiwear.id / demo123</p>
          <p>Admin: admin@naqiwear.id / admin123</p>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-bold text-zamrud-700 hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
