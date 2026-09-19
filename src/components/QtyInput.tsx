import { Minus, Plus } from "lucide-react";

export function QtyInput({
  nilai,
  ubah,
  max = 99,
}: {
  nilai: number;
  ubah: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border-2 border-zamrud-700/20 bg-white">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        onClick={() => ubah(Math.max(1, nilai - 1))}
        className="grid h-11 w-11 place-items-center rounded-l-xl text-zamrud-700 transition hover:bg-krem"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-12 text-center text-lg font-bold text-zamrud-800">{nilai}</span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        onClick={() => ubah(Math.min(max, nilai + 1))}
        className="grid h-11 w-11 place-items-center rounded-r-xl text-zamrud-700 transition hover:bg-krem"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
