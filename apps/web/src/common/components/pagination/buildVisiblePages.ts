/** Build page numbers with ellipsis markers (-1). */
export function buildVisiblePages(
  currentPage: number,
  totalPages: number,
): number[] {
  const pages = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, currentPage), pages);

  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, -1, pages];
  }

  if (current >= pages - 3) {
    return [1, -1, pages - 4, pages - 3, pages - 2, pages - 1, pages];
  }

  return [1, -1, current - 1, current, current + 1, -1, pages];
}
