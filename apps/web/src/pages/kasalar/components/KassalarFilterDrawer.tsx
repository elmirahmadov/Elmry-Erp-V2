"use client";

import { useEffect, useState } from "react";

export type KassalarDetailFilters = {
  branchId: number | null;
  tillId: number | null;
  startDate: string;
  endDate: string;
};

type BranchOption = { id: number; name: string };
type TillOption = { id: number; name: string; balance: number };

interface KassalarFilterDrawerProps {
  isOpen: boolean;
  filters: KassalarDetailFilters;
  branches: BranchOption[];
  tills: TillOption[];
  loadingTills?: boolean;
  onChange: <K extends keyof KassalarDetailFilters>(
    key: K,
    value: KassalarDetailFilters[K],
  ) => void;
  onBranchChange: (branchId: number | null) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  formatCurrency: (value: number) => string;
}

const inputClass =
  "w-full rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary";

export default function KassalarFilterDrawer({
  isOpen,
  filters,
  branches,
  tills,
  loadingTills,
  onChange,
  onBranchChange,
  onClose,
  onApply,
  onClear,
  formatCurrency,
}: KassalarFilterDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const timer = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(timer);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: visible ? 0.45 : 0,
          transition: "opacity 280ms ease",
        }}
        onClick={onClose}
      />

      <div
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        style={{
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-foreground">
            Detaylı Filtreler
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Kapat
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Şube
            </label>
            <select
              value={filters.branchId ?? ""}
              onChange={(e) =>
                onBranchChange(e.target.value ? Number(e.target.value) : null)
              }
              className={inputClass}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Kassa
            </label>
            <select
              value={filters.tillId ?? ""}
              onChange={(e) =>
                onChange(
                  "tillId",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              disabled={loadingTills || tills.length === 0}
              className={inputClass}
            >
              {tills.length === 0 && (
                <option value="">Kasa bulunamadı</option>
              )}
              {tills.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({formatCurrency(t.balance)} ₼)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate}
              onChange={(e) => onChange("endDate", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-border bg-secondary px-4 py-3">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent"
          >
            Temizle
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
