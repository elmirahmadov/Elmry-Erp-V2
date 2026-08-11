import type { AuthBranch } from "../../../common/actions/auth.actions";
import { DATE_PRESETS, INPUT_CLASS } from "../utils/financeReportUtils";

interface FinanceReportToolbarProps {
  branches: AuthBranch[];
  selectedBranchId: number | undefined;
  onBranchChange: (branchId: number | undefined) => void;
  preset: string;
  onPresetChange: (preset: string) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  onFilter: () => void;
  onExport?: () => void;
  exportLabel?: string;
}

export default function FinanceReportToolbar({
  branches,
  selectedBranchId,
  onBranchChange,
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onFilter,
  onExport,
  exportLabel = "Excel",
}: FinanceReportToolbarProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBranchId ?? ""}
            onChange={(e) =>
              onBranchChange(
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
            className={INPUT_CLASS}
          >
            <option value="">Tüm şubeler</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={preset}
            onChange={(e) => onPresetChange(e.target.value)}
            className={INPUT_CLASS}
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          {preset === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => onCustomStartChange(e.target.value)}
                className={INPUT_CLASS}
              />
              <span className="text-sm text-muted-foreground">—</span>
              <input
                type="date"
                value={customEnd}
                min={customStart}
                onChange={(e) => onCustomEndChange(e.target.value)}
                className={INPUT_CLASS}
              />
            </>
          )}

          <button
            type="button"
            onClick={onFilter}
            className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Filtre
          </button>
        </div>

        {onExport && (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onExport}
              className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {exportLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
