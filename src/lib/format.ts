export function rupiah(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

export function persenHemat(dasar: number, diskon: number): number {
  if (!diskon || diskon >= dasar) return 0;
  return Math.round(((dasar - diskon) / dasar) * 100);
}

export function tanggalID(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function tanggalJamID(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const WARNA_HEX: Record<string, string> = {
  "Hijau Zamrud": "#1B4332",
  "Hijau Sage": "#9CAF88",
  Krem: "#EFE6D5",
  "Krem Krem": "#EFE6D5",
  Hitam: "#1c1c1c",
  Putih: "#fafafa",
  "Putih Gading": "#f5efe0",
  Mocca: "#8a6f5c",
  "Coklat Susu": "#b08d71",
  "Dusty Pink": "#d8a7a7",
  "Pink Muda": "#eec7cf",
  Salem: "#f2c4b3",
  Maroon: "#6e2b34",
  Navy: "#22304a",
  "Abu Misty": "#9aa0a6",
  "Biru Turquoise": "#3a8f8b",
  "Merah Bata": "#9c4a34",
  "Hijau Sage ": "#9CAF88",
};

export function warnaHex(nama: string): string {
  return WARNA_HEX[nama] ?? "#c9bda9";
}

export const ADMIN_WA = "6281234567890";

export function linkWA(pesan: string): string {
  return `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(pesan)}`;
}

export const LABEL_STATUS_PESANAN: Record<string, string> = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  dibayar: "Dibayar",
  diproses: "Diproses",
  dikemas: "Dikemas",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  retur_diajukan: "Retur Diajukan",
};

export function warnaStatusPesanan(s: string): string {
  switch (s) {
    case "menunggu_pembayaran": return "bg-amber-100 text-amber-800";
    case "dibayar": return "bg-sky-100 text-sky-800";
    case "diproses":
    case "dikemas": return "bg-blue-100 text-blue-800";
    case "dikirim": return "bg-violet-100 text-violet-800";
    case "selesai": return "bg-emerald-100 text-emerald-800";
    case "dibatalkan": return "bg-slate-200 text-slate-600";
    case "retur_diajukan": return "bg-red-100 text-red-700";
    default: return "bg-slate-100 text-slate-600";
  }
}
