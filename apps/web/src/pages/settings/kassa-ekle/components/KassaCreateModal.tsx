import { FormEvent } from "react";

interface KassaCreateModalProps {
  isOpen: boolean;
  tillName: string;
  submitting: boolean;
  error: string | null;
  onTillNameChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function KassaCreateModal({
  isOpen,
  tillName,
  submitting,
  error,
  onTillNameChange,
  onClose,
  onSubmit,
}: KassaCreateModalProps) {
  if (!isOpen) return null;

  const canSubmit = tillName.trim().length > 0 && !submitting;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Kassa Ekle</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kassa sirkete bagli olusturulur. Sube atamasi sonra yapilir.
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
              Kassa Adi
            </label>
            <input
              type="text"
              value={tillName}
              onChange={(e) => onTillNameChange(e.target.value)}
              placeholder="Kassa adi giriniz"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 rounded-lg bg-success py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:opacity-50"
            >
              {submitting ? "Ekleniyor..." : "Olustur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
