import type { ReactNode } from "react";
import { buildVisiblePages } from "./buildVisiblePages";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  /** Optional label prefix. Default: "Toplam Satır" */
  totalLabel?: string;
  /** Extra content after the total label (e.g. balance). */
  totalExtra?: ReactNode;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalRows,
  onPageChange,
  totalLabel = "Toplam Satır",
  totalExtra,
  className = "",
}: PaginationProps) {
  const pages = Math.max(1, totalPages);
  const page = Math.min(Math.max(1, currentPage), pages);
  const visiblePages = buildVisiblePages(page, pages);

  return (
    <div
      className={`flex items-center justify-between border-t border-border bg-secondary px-4 py-3 ${className}`}
    >
      <span className="text-sm text-muted-foreground">
        {totalLabel}: {totalRows}
        {totalExtra}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="border border-border bg-card px-3 py-1 text-sm text-foreground hover:bg-accent disabled:opacity-50"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
        >
          Önceki
        </button>

        {visiblePages.map((item, index) =>
          item === -1 ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-1 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`border border-border px-3 py-1 text-sm ${
                page === item
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              }`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className="border border-border bg-card px-3 py-1 text-sm text-foreground hover:bg-accent disabled:opacity-50"
          onClick={() => onPageChange(Math.min(page + 1, pages))}
          disabled={page >= pages}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
