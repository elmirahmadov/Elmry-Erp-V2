"use client";

import { useEffect, useState } from "react";

export type PurchaseDetailFilters = {
  serialNo: string;
  supplierName: string;
  branch: string;
  warehouse: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};

export const emptyPurchaseFilters = (): PurchaseDetailFilters => ({
  serialNo: "",
  supplierName: "",
  branch: "",
  warehouse: "",
  status: "",
  dateFrom: "",
  dateTo: "",
});

export function countActivePurchaseFilters(filters: PurchaseDetailFilters) {
  return Object.values(filters).filter((value) => String(value).trim() !== "")
    .length;
}

interface PurchaseFilterDrawerProps {
  isOpen: boolean;
  filters: PurchaseDetailFilters;
  branchOptions: string[];
  warehouseOptions: string[];
  statusOptions: string[];
  onChange: <K extends keyof PurchaseDetailFilters>(
    key: K,
    value: PurchaseDetailFilters[K],
  ) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const inputClass =
  "w-full rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary";

export default function PurchaseFilterDrawer({
  isOpen,
  filters,
  branchOptions,
  warehouseOptions,
  statusOptions,
  onChange,
  onClose,
  onApply,
  onClear,
}: PurchaseFilterDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let raf2: number;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 300);
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
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: visible ? 0.45 : 0 }}
        onClick={onClose}
      />

      <div
        className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-all duration-300 ease-in-out"
        style={{
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          transform: visible ? "translateX(0)" : "translateX(100%)",
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
              Sened No
            </label>
            <input
              type="text"
              placeholder="Sened numarası"
              value={filters.serialNo}
              onChange={(e) => onChange("serialNo", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tedarikçi
            </label>
            <input
              type="text"
              placeholder="Tedarikçi adı"
              value={filters.supplierName}
              onChange={(e) => onChange("supplierName", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Filial
            </label>
            <select
              value={filters.branch}
              onChange={(e) => onChange("branch", e.target.value)}
              className={inputClass}
            >
              <option value="">Tümü</option>
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Anbar
            </label>
            <select
              value={filters.warehouse}
              onChange={(e) => onChange("warehouse", e.target.value)}
              className={inputClass}
            >
              <option value="">Tümü</option>
              {warehouseOptions.map((warehouse) => (
                <option key={warehouse} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Durum
            </label>
            <select
              value={filters.status}
              onChange={(e) => onChange("status", e.target.value)}
              className={inputClass}
            >
              <option value="">Tümü</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tarih (başlangıç)
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange("dateFrom", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tarih (bitiş)
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange("dateTo", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-secondary px-4 py-3">
          <button
            type="button"
            onClick={onClear}
            className="rounded border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Temizle
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
