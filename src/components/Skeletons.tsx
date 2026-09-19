export function KotakSkeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function KartuProdukSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-krem-tua bg-white">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-2/3 rounded" />
      </div>
    </div>
  );
}

export function GridProdukSkeleton({ jumlah = 8 }: { jumlah?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: jumlah }).map((_, i) => (
        <KartuProdukSkeleton key={i} />
      ))}
    </div>
  );
}

export function BarisSkeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 rounded ${className}`} />;
}
