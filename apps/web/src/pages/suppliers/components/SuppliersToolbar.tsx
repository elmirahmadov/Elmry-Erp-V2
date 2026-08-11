interface SuppliersToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onFilter: () => void;
  onCreate: () => void;
  onResetPage: () => void;
}

export default function SuppliersToolbar({
  searchTerm,
  setSearchTerm,
  onFilter,
  onCreate,
  onResetPage,
}: SuppliersToolbarProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tedarikçi adı, telefon veya email ile ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onResetPage();
            }}
            className="w-full border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary sm:w-80"
          />
          <button
            onClick={onFilter}
            className="bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Filtre
          </button>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={onCreate}
            className="bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}
