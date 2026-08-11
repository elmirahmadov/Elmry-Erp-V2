interface ProductsToolbarProps {
  smartSearchTerm: string;
  setSmartSearchTerm: (value: string) => void;
  onOpenFilters: () => void;
  onCreate: () => void;
  activeFilterCount: number;
}

export default function ProductsToolbar({
  smartSearchTerm,
  setSmartSearchTerm,
  onOpenFilters,
  onCreate,
  activeFilterCount,
}: ProductsToolbarProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Kod, isim veya barkod ile ara..."
            value={smartSearchTerm}
            onChange={(e) => setSmartSearchTerm(e.target.value)}
            className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary sm:w-80"
          />
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Filtre
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-card px-1.5 text-[11px] font-bold text-primary">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onCreate}
            className="rounded bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}
