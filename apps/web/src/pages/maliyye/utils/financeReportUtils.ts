export const fmt = (v: number) =>
  new Intl.NumberFormat("az-AZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

export const toISO = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const getDateRange = (preset: string) => {
  const now = new Date();
  const today = toISO(now);
  if (preset === "today") return { startDate: today, endDate: today };
  if (preset === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { startDate: toISO(start), endDate: today };
  }
  if (preset === "month") {
    return {
      startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
      endDate: today,
    };
  }
  if (preset === "30d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    return { startDate: toISO(start), endDate: today };
  }
  if (preset === "90d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 89);
    return { startDate: toISO(start), endDate: today };
  }
  return { startDate: today, endDate: today };
};

export const DATE_PRESETS = [
  { key: "today", label: "Bu gün" },
  { key: "week", label: "Bu həftə" },
  { key: "month", label: "Bu ay" },
  { key: "30d", label: "Son 30 gün" },
  { key: "90d", label: "Son 90 gün" },
  { key: "custom", label: "Xüsusi" },
] as const;

export const INPUT_CLASS =
  "rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary";

export const TH_CLASS =
  "px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border";

export const TD_CLASS =
  "px-3 py-2 text-sm text-center whitespace-nowrap border-b border-border";
