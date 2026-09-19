import { Star } from "lucide-react";

export function Stars({ nilai, ukuran = "h-4 w-4" }: { nilai: number; ukuran?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${ukuran} ${
            i <= Math.round(nilai) ? "fill-emas-400 text-emas-400" : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </span>
  );
}
