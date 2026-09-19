import { useState } from "react";

type Props = {
  src?: string;
  driveFileId?: string;
  alt: string;
  className?: string;
  eager?: boolean;
};

/**
 * Komponen gambar NAQI WEAR.
 * Mendukung dua sumber gambar:
 * - `src` langsung (URL gambar apa pun)
 * - `driveFileId` untuk file di folder Google Drive NAQI_WEAR_ASSETS
 *   (dirender sebagai https://drive.google.com/uc?export=view&id=FILE_ID)
 */
export function ImageLoader({ src, driveFileId, alt, className = "", eager = false }: Props) {
  const [gagal, setGagal] = useState(false);
  const finalSrc = driveFileId
    ? `https://drive.google.com/uc?export=view&id=${driveFileId}`
    : src ?? "";
  if (gagal || !finalSrc) {
    return (
      <div className={`flex items-center justify-center bg-krem-tua text-tanah/50 ${className}`}>
        <span className="text-xs font-semibold">NAQI WEAR</span>
      </div>
    );
  }
  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setGagal(true)}
      className={className}
    />
  );
}
