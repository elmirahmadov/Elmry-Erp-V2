import { useMemo, useState } from "react";
import type { Product } from "../types/product.types";
import { VALID_STOCK_UNITS } from "../constants/product.constants";

export type ProductDetailFilters = {
  id: string;
  name: string;
  barcode: string;
  stockUnit: string;
  status: "all" | "active" | "inactive";
  parentCategoryId: string;
  minSalePrice: string;
  maxSalePrice: string;
  minStock: string;
  maxStock: string;
};

export const EMPTY_DETAIL_FILTERS: ProductDetailFilters = {
  id: "",
  name: "",
  barcode: "",
  stockUnit: "",
  status: "all",
  parentCategoryId: "",
  minSalePrice: "",
  maxSalePrice: "",
  minStock: "",
  maxStock: "",
};

const matchesSmartSearch = (product: Product, term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;

  return (
    String(product.id).includes(q) ||
    product.name.toLowerCase().includes(q) ||
    product.barcode.toLowerCase().includes(q)
  );
};

const matchesDetailFilters = (
  product: Product,
  filters: ProductDetailFilters,
) => {
  if (filters.id.trim()) {
    const id = Number(filters.id.trim());
    if (Number.isNaN(id) || product.id !== id) return false;
  }

  if (
    filters.name.trim() &&
    !product.name.toLowerCase().includes(filters.name.trim().toLowerCase())
  ) {
    return false;
  }

  if (
    filters.barcode.trim() &&
    !product.barcode
      .toLowerCase()
      .includes(filters.barcode.trim().toLowerCase())
  ) {
    return false;
  }

  if (filters.stockUnit && product.stockUnit !== filters.stockUnit) {
    return false;
  }

  if (filters.status === "active" && !product.isActive) return false;
  if (filters.status === "inactive" && product.isActive) return false;

  if (filters.parentCategoryId) {
    if (product.parentCategoryId !== Number(filters.parentCategoryId)) {
      return false;
    }
  }

  if (filters.minSalePrice.trim()) {
    const min = Number(filters.minSalePrice);
    if (!Number.isNaN(min) && product.salePrice < min) return false;
  }

  if (filters.maxSalePrice.trim()) {
    const max = Number(filters.maxSalePrice);
    if (!Number.isNaN(max) && product.salePrice > max) return false;
  }

  if (filters.minStock.trim()) {
    const min = Number(filters.minStock);
    if (!Number.isNaN(min) && (product.stockQuantity ?? 0) < min) return false;
  }

  if (filters.maxStock.trim()) {
    const max = Number(filters.maxStock);
    if (!Number.isNaN(max) && (product.stockQuantity ?? 0) > max) return false;
  }

  return true;
};

export const useProductsFilters = (products: Product[]) => {
  const [smartSearchTerm, setSmartSearchTerm] = useState("");
  const [draftFilters, setDraftFilters] =
    useState<ProductDetailFilters>(EMPTY_DETAIL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ProductDetailFilters>(EMPTY_DETAIL_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          matchesSmartSearch(product, smartSearchTerm) &&
          matchesDetailFilters(product, appliedFilters),
      ),
    [products, smartSearchTerm, appliedFilters],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    const f = appliedFilters;
    if (f.id.trim()) count += 1;
    if (f.name.trim()) count += 1;
    if (f.barcode.trim()) count += 1;
    if (f.stockUnit) count += 1;
    if (f.status !== "all") count += 1;
    if (f.parentCategoryId) count += 1;
    if (f.minSalePrice.trim() || f.maxSalePrice.trim()) count += 1;
    if (f.minStock.trim() || f.maxStock.trim()) count += 1;
    return count;
  }, [appliedFilters]);

  const openFilterDrawer = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const closeFilterDrawer = () => setIsFilterOpen(false);

  const applyDetailFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const clearDetailFilters = () => {
    setDraftFilters(EMPTY_DETAIL_FILTERS);
    setAppliedFilters(EMPTY_DETAIL_FILTERS);
  };

  const updateDraftFilter = <K extends keyof ProductDetailFilters>(
    key: K,
    value: ProductDetailFilters[K],
  ) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    smartSearchTerm,
    setSmartSearchTerm,
    draftFilters,
    updateDraftFilter,
    filteredProducts,
    activeFilterCount,
    isFilterOpen,
    openFilterDrawer,
    closeFilterDrawer,
    applyDetailFilters,
    clearDetailFilters,
    stockUnits: VALID_STOCK_UNITS,
  };
};
