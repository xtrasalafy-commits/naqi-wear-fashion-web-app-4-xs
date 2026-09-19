"use client";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { rupiah } from "@/lib/format";
import { Modal } from "@/components/Modal";
import { KotakSkeleton } from "@/components/Skeletons";
import { useToast } from "@/store/toast";

type ProdukAdmin = {
  id: number; nama: string; slug: string; harga_dasar: number; harga_diskon: number | null;
  status: string; unggulan: boolean; terlaris: boolean; stok_total: number; kategori: string | null;
};
type KategoriOpsi = { id: number; nama: string; anak?: KategoriOpsi[] };
type VarianForm = { warna: string; ukuran: string; harga: number; stok: number };

const FORM_KOSONG = {
  id: 0, nama: "", category_id: 0, harga_dasar: "", harga_diskon: "", bahan: "", deskripsi: "",
  gender: "wanita", motif: "Polos", berat_gram: "300", gambar_url: "", unggulan: false, terlaris: false,
};

export default function AdminProduk() {
  const tampil = useToast((s) => s.tampil);
  const [daftar, setDaftar] = useState<ProdukAdmin[] | null>(null);
  const [kategori, setKategori] = useState<KategoriOpsi[]>([]);
  const [cari, setCari] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...FORM_KOSONG });
  const [varian, setVarian] = useState<VarianForm[]>([{ warna: "", ukuran: "All Size", harga: 0, stok: 10 }]);
  const [simpan, setSimpan] = useState(false);

  function muat() {
    fetch("/api/admin/produk").then((r) => r.json()).then((d) => setDaftar(d.produk ?? [])).catch(() => setDaftar([]));
  }
  useEffect(() => {
    muat();
    fetch("/api/kategori").then((r) => r.json()).then((d) => setKategori(d.kategori ?? [])).catch(() => undefined);
  }, []);

  function bukaTambah() {
    setForm({ ...FORM_KOSONG });
    setVarian([{ warna: "", ukuran: "All Size", harga: 0, stok: 10 }]);
    setModal(true);
  }

  async function bukaEdit(p: ProdukAdmin) {
    const res = await fetch(`/api/admin/produk/${p.id}`);
    const d = await res.json();
    if (!res.ok) return tampil("error", "Gagal memuat produk.");
    const prod = d.produk;
    setForm({
      id: prod.id, nama: prod.nama, category_id: prod.category_id, harga_dasar: String(prod.harga_dasar),
      harga_diskon: prod.harga_diskon ? String(prod.harga_diskon) : "", bahan: prod.bahan, deskripsi: prod.deskripsi,
      gender: prod.gender, motif: prod.motif, berat_gram: String(prod.berat_gram),
      gambar_url: d.gambar[0]?.gambar_url ?? "", unggulan: prod.unggulan, terlaris: prod.terlaris,
    });
    setVarian(d.varian.map((v: { warna: string; ukuran: string; harga: number; stok: number }) => ({ warna: v.warna, ukuran: v.ukuran, harga: v.harga, stok: v.stok })));
    setModal(true);
  }

  async function simpanProduk() {
    if (!form.nama) return tampil("error", "Nama produk wajib diisi.");
    setSimpan(true);
    const payload = {
      nama: form.nama, category_id: form.category_id, harga_dasar: Number(form.harga_dasar || 0),
      harga_diskon: form.harga_diskon ? Number(form.harga_diskon) : null, bahan: form.bahan, deskripsi: form.deskripsi,
      gender: form.gender, motif: form.motif, berat_gram: Number(form.berat_gram || 300),
      gambar_url: form.gambar_url, unggulan: form.unggulan, terlaris: form.terlaris,
      varian: varian.filter((v) => v.warna),
    };
    const url = form.id ? `/api/admin/produk/${form.id}` : "/api/admin/produk";
    const res = await fetch(url, {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSimpan(false);
    if (res.ok) {
      tampil("sukses", form.id ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan.");
      setModal(false);
      muat();
    } else {
      const d = await res.json().catch(() => null);
      tampil("error", d?.error ?? "Gagal menyimpan produk.");
    }
  }

  async function toggleStatus(p: ProdukAdmin) {
    await fetch(`/api/admin/produk/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: p.status === "aktif" ? "nonaktif" : "aktif" }),
    });
    muat();
  }

  const inputCls = "w-full rounded-xl border-2 border-krem-tua bg-krem px-3.5 py-2.5 text-sm outline-none focus:border-zamrud-500";
  const tampilkan = (daftar ?? []).filter((p) => !cari || p.nama.toLowerCase().includes(cari.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-zamrud-800">Manajemen Produk</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari produk…"
              className="rounded-xl border-2 border-krem-tua bg-white py-2.5 pr-4 pl-9 text-sm outline-none focus:border-zamrud-500" />
          </div>
          <button onClick={bukaTambah} className="flex items-center gap-1.5 rounded-xl bg-zamrud-700 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-zamrud-600">
            <Plus className="h-4 w-4" /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-krem-tua bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-krem text-left text-xs font-extrabold tracking-wide text-tanah uppercase">
              <th className="px-4 py-3">Produk</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Stok</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {!daftar ? (
              <tr><td colSpan={6} className="p-6"><KotakSkeleton className="h-32" /></td></tr>
            ) : (
              tampilkan.map((p) => (
                <tr key={p.id} className="border-t border-krem-tua hover:bg-krem/50">
                  <td className="px-4 py-3">
                    <p className="font-extrabold text-zamrud-800">{p.nama}</p>
                    <p className="text-[11px] text-slate-400">
                      {p.unggulan && "⭐ Unggulan "}{p.terlaris && "🔥 Terlaris"}
                    </p>
                  </td>
                  <td className="px-4 py-3">{p.kategori ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-extrabold">{rupiah(p.harga_diskon ?? p.harga_dasar)}</p>
                    {p.harga_diskon && <p className="text-[11px] text-slate-400 line-through">{rupiah(p.harga_dasar)}</p>}
                  </td>
                  <td className={`px-4 py-3 font-extrabold ${p.stok_total <= 5 ? "text-red-600" : "text-zamrud-800"}`}>{p.stok_total}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(p)} className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${p.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                      {p.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => bukaEdit(p)} className="rounded-full border-2 border-zamrud-700/30 px-4 py-1.5 text-xs font-extrabold text-zamrud-800 hover:bg-zamrud-50">
                      Ubah
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal buka={modal} tutup={() => setModal(false)} judul={form.id ? "Ubah Produk" : "Tambah Produk Baru"} lebar="max-w-3xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Nama Produk</label>
            <input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Gamis Aisyah Premium" /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Kategori</label>
            <select className={inputCls} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
              <option value={0}>Pilih kategori…</option>
              {kategori.map((k) => (
                <optgroup key={k.id} label={k.nama}>
                  {(k.anak ?? []).map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
                </optgroup>
              ))}
            </select></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Gender</label>
            <select className={inputCls} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="wanita">Wanita</option><option value="pria">Pria</option><option value="anak">Anak</option><option value="keluarga">Keluarga</option>
            </select></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Harga Normal (Rp)</label>
            <input type="number" className={inputCls} value={form.harga_dasar} onChange={(e) => setForm({ ...form, harga_dasar: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Harga Diskon (Rp, opsional)</label>
            <input type="number" className={inputCls} value={form.harga_diskon} onChange={(e) => setForm({ ...form, harga_diskon: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Bahan</label>
            <input className={inputCls} value={form.bahan} onChange={(e) => setForm({ ...form, bahan: e.target.value })} placeholder="Contoh: Wolfis Premium" /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Motif</label>
            <input className={inputCls} value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} placeholder="Polos / Motif Turki / Kotak" /></div>
          <div><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Berat (gram)</label>
            <input type="number" className={inputCls} value={form.berat_gram} onChange={(e) => setForm({ ...form, berat_gram: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-extrabold text-zamrud-800">URL Foto Utama (Google Drive / Pexels)</label>
            <input className={inputCls} value={form.gambar_url} onChange={(e) => setForm({ ...form, gambar_url: e.target.value })} placeholder="https://… (file Drive otomatis via format uc?export=view)" /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-extrabold text-zamrud-800">Deskripsi</label>
            <textarea rows={3} className={inputCls} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm font-bold text-zamrud-800">
            <input type="checkbox" checked={form.unggulan} onChange={(e) => setForm({ ...form, unggulan: e.target.checked })} className="h-4 w-4 accent-zamrud-700" /> Produk Unggulan
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-zamrud-800">
            <input type="checkbox" checked={form.terlaris} onChange={(e) => setForm({ ...form, terlaris: e.target.checked })} className="h-4 w-4 accent-zamrud-700" /> Tandai Best Seller
          </label>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-zamrud-800">Varian (Warna, Ukuran, Harga, Stok)</p>
            <button onClick={() => setVarian([...varian, { warna: "", ukuran: "All Size", harga: 0, stok: 10 }])} className="rounded-full bg-zamrud-50 px-3 py-1.5 text-xs font-extrabold text-zamrud-800 hover:bg-zamrud-100">
              + Tambah Varian
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {varian.map((v, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-xl bg-krem p-2.5 sm:grid-cols-5">
                <input placeholder="Warna" value={v.warna} onChange={(e) => setVarian(varian.map((x, j) => (j === i ? { ...x, warna: e.target.value } : x)))} className="rounded-lg border border-krem-tua bg-white px-2.5 py-2 text-xs outline-none" />
                <input placeholder="Ukuran" value={v.ukuran} onChange={(e) => setVarian(varian.map((x, j) => (j === i ? { ...x, ukuran: e.target.value } : x)))} className="rounded-lg border border-krem-tua bg-white px-2.5 py-2 text-xs outline-none" />
                <input type="number" placeholder="Harga" value={v.harga || ""} onChange={(e) => setVarian(varian.map((x, j) => (j === i ? { ...x, harga: Number(e.target.value) } : x)))} className="rounded-lg border border-krem-tua bg-white px-2.5 py-2 text-xs outline-none" />
                <input type="number" placeholder="Stok" value={v.stok || ""} onChange={(e) => setVarian(varian.map((x, j) => (j === i ? { ...x, stok: Number(e.target.value) } : x)))} className="rounded-lg border border-krem-tua bg-white px-2.5 py-2 text-xs outline-none" />
                <button onClick={() => setVarian(varian.filter((_, j) => j !== i))} className="rounded-lg bg-red-50 px-2 py-2 text-xs font-extrabold text-red-500 hover:bg-red-100">Hapus</button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={simpanProduk} disabled={simpan}
          className="mt-5 w-full rounded-2xl bg-zamrud-700 py-3.5 font-extrabold text-white transition hover:bg-zamrud-600 disabled:opacity-60">
          {simpan ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Produk"}
        </button>
      </Modal>
    </div>
  );
}
