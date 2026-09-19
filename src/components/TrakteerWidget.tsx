"use client";
import { useEffect, useRef, useState } from "react";
import { Heart, X } from "lucide-react";
import QRCode from "qrcode";

const TRAKTEER_URL = "https://trakteer.id/perpus_opera";
const NOMINALS = [6000, 12000, 18000, 24000, 30000, 50000];

function rupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

export function TrakteerWidget() {
  const [buka, setBuka] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!buka) return;
    let cancelled = false;
    QRCode.toDataURL(TRAKTEER_URL, {
      width: 220,
      margin: 2,
      color: { dark: "#1b4332", light: "#fdf6e3" },
    })
      .then((url: string) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [buka]);

  useEffect(() => {
    if (!qrDataUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = qrDataUrl;
  }, [qrDataUrl]);

  return (
    <>
      <button
        onClick={() => setBuka(true)}
        aria-label="Dukung web app ini dengan traktiran"
        className="fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-zamrud-700 to-zamrud-500 px-4 py-3 text-white shadow-2xl transition hover:scale-105 hover:from-zamrud-600 hover:to-zamrud-400 md:bottom-6"
      >
        <Heart className="h-5 w-5" />
        <span className="text-sm font-bold">Dukung Proyek</span>
      </button>

      {buka && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-zamrud-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              onClick={() => setBuka(false)}
              aria-label="Tutup"
              className="absolute right-3 top-3 rounded-full p-2 hover:bg-krem"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-gradient-to-r from-zamrud-700 to-zamrud-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">Dukung Pengembangan</p>
                  <p className="text-xs text-zamrud-50">
                    Web app ini gratis & bebas iklan. Kopi kecil, server tetap jalan.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div className="flex flex-col items-center">
                <canvas ref={canvasRef} width={220} height={220} className="rounded-xl border border-krem-tua" />
                <p className="mt-2 text-center text-xs text-slate-500">
                  Scan QR di atas ke Trakteer.id/perpus_opera
                </p>
                <a
                  href={TRAKTEER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs font-bold text-zamrud-700 hover:underline"
                >
                  Buka di browser →
                </a>
              </div>

              <div className="flex flex-col">
                <p className="mb-2 text-sm font-bold text-zamrud-800">Pilih Nominal Traktiran</p>
                <div className="grid grid-cols-2 gap-2">
                  {NOMINALS.map((n) => (
                    <a
                      key={n}
                      href={`${TRAKTEER_URL}?amount=${n}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-krem-tua bg-krem px-3 py-2 text-center text-sm font-bold text-zamrud-800 transition hover:border-emas-400 hover:bg-white"
                    >
                      {rupiah(n)}
                    </a>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  Traktiran akan membuka halaman Trakteer di tab baru. Setelah donasi, aplikasi tetap berjalan tanpa iklan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}