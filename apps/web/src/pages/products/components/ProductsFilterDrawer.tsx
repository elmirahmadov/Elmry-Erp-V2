"use client";

import { useEffect, useState } from "react";
import type { Category } from "../types/category.types";
import type { ProductDetailFilters } from "../hooks/useProductsFilters";
import { VALID_STOCK_UNITS } from "../constants/product.constants";

interface ProductsFilterDrawerProps {
  isOpen: boolean;
  filters: ProductDetailFilters;
  categories: Category[];
  onChange: <K extends keyof ProductDetailFilters>(
    key: K,
    value: ProductDetailFilters[K],
  ) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const inputClass =
  "w-full rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary";

export default function ProductsFilterDrawer({
  isOpen,
  filters,
  categories,
  onChange,
  onClose,
  onApply,
  onClear,
}: ProductsFilterDrawerProps) {
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
              Kod (ID)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ürün kodu"
              value={filters.id}
              onChange={(e) => onChange("id", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ürün Adı
            </label>
            <input
              type="text"
              placeholder="İsim ile filtrele"
              value={filters.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Barkod
            </label>
            <input
              type="text"
              placeholder="Barkod ile filtrele"
              value={filters.barcode}
              onChange={(e) => onChange("barcode", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ana Kategori
            </label>
            <select
              value={filters.parentCategoryId}
              onChange={(e) => onChange("parentCategoryId", e.target.value)}
              className={inputClass}
            >
              <option value="">Tümü</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stok Türü
            </label>
            <select
              value={filters.stockUnit}
              onChange={(e) => onChange("stockUnit", e.target.value)}
              className={inputClass}
            >
              <option value="">Tümü</option>
              {VALID_STOCK_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
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
              onChange={(e) =>
                onChange(
                  "status",
                  e.target.value as ProductDetailFilters["status"],
                )
              }
              className={inputClass}
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Min Satış
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={filters.minSalePrice}
                onChange={(e) => onChange("minSalePrice", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Max Satış
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="∞"
                value={filters.maxSalePrice}
                onChange={(e) => onChange("maxSalePrice", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Min Stok
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={filters.minStock}
                onChange={(e) => onChange("minStock", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Max Stok
              </label>
              <input
                type="number"
                min={0}
                placeholder="∞"
                value={filters.maxStock}
                onChange={(e) => onChange("maxStock", e.target.value)}
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
