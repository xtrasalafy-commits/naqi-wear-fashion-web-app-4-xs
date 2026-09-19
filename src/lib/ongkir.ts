export type Kurir = {
  nama: string;
  layanan: string;
  biaya: number;
  estimasi: string;
  catatan: string;
};

function zona(kodepos: string): { hari: [number, number]; pengali: number } {
  const digit = kodepos?.charAt(0) ?? "1";
  switch (digit) {
    case "1": return { hari: [1, 2], pengali: 1 };      // Jakarta
    case "4": return { hari: [1, 3], pengali: 1.05 };   // Banten & Jabar
    case "5": return { hari: [2, 4], pengali: 1.15 };   // Jateng/DIY
    case "6": return { hari: [2, 4], pengali: 1.15 };   // Jatim
    case "2":
    case "3": return { hari: [3, 6], pengali: 1.4 };    // Sumatera
    case "7": return { hari: [3, 6], pengali: 1.5 };    // Kalimantan
    case "8": return { hari: [3, 6], pengali: 1.5 };    // Bali & Nusa Tenggara
    case "9": return { hari: [4, 8], pengali: 1.7 };    // Sulawesi & Indonesia Timur
    default: return { hari: [2, 5], pengali: 1.2 };
  }
}

export function daftarKurir(kodepos: string, beratGram: number): Kurir[] {
  const kg = Math.max(1, Math.ceil(beratGram / 1000));
  const z = zona(kodepos);
  const kurir: Kurir[] = [
    {
      nama: "JNE",
      layanan: "REG",
      biaya: Math.round((10000 + 3500 * (kg - 1)) * z.pengali),
      estimasi: `${z.hari[0]}-${z.hari[1]} hari`,
      catatan: "Reguler ke seluruh Indonesia",
    },
    {
      nama: "SiCepat",
      layanan: "REG",
      biaya: Math.round((9500 + 3200 * (kg - 1)) * z.pengali),
      estimasi: `${z.hari[0]}-${Math.max(z.hari[1], z.hari[0] + 1)} hari`,
      catatan: "Reguler hemat",
    },
  ];
  if (kodepos && (kodepos.startsWith("1") || kodepos.startsWith("4"))) {
    kurir.push({
      nama: "GoSend",
      layanan: "Same Day",
      biaya: 20000 + Math.max(0, kg - 1) * 5000,
      estimasi: "Tiba hari ini",
      catatan: "Khusus Jabodetabek & Bandung",
    });
  }
  return kurir;
}
