import { FormEvent } from "react";

interface AnbarCreateModalProps {
  isOpen: boolean;
  warehouseName: string;
  submitting: boolean;
  error: string | null;
  onWarehouseNameChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AnbarCreateModal({
  isOpen,
  warehouseName,
  submitting,
  error,
  onWarehouseNameChange,
  onClose,
  onSubmit,
}: AnbarCreateModalProps) {
  if (!isOpen) return null;

  const canSubmit = warehouseName.trim().length > 0 && !submitting;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-md border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Anbar Ekle</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Anbar sirkete bagli olusturulur. Sube atamasi sonra yapilir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xl font-bold text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Anbar Adi
            </label>
            <input
              type="text"
              value={warehouseName}
              onChange={(e) => onWarehouseNameChange(e.target.value)}
              placeholder="Anbar adi giriniz"
              className="w-full border border-border bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 bg-success py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:opacity-50"
            >
              {submitting ? "Ekleniyor..." : "Olustur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
