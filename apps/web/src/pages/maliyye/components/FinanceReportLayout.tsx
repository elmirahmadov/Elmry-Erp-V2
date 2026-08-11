import Loading from "../../../common/components/loading/Loading";
import { FiAlertCircle } from "react-icons/fi";

interface FinanceReportLayoutProps {
  toolbar: React.ReactNode;
  totalRows?: number;
  error?: string | null;
  loading?: boolean;
  children: React.ReactNode;
  /** Pass `null` to hide the footer entirely. */
  footer?: React.ReactNode | null;
}

export default function FinanceReportLayout({
  toolbar,
  totalRows,
  error,
  loading,
  children,
  footer,
}: FinanceReportLayoutProps) {
  const resolvedFooter =
    footer === null
      ? null
      : footer !== undefined
        ? footer
        : totalRows !== undefined
          ? (
              <div className="flex items-center justify-between border-t bg-secondary px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Toplam Satır: {totalRows}
                </span>
              </div>
            )
          : null;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - var(--header-height))" }}
    >
      <div className="shrink-0">
        {toolbar}
        {error && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-sm text-destructive">
            <FiAlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loading />
          </div>
        ) : (
          children
        )}
      </div>

      {resolvedFooter != null && (
        <div className="shrink-0 border-t bg-card">{resolvedFooter}</div>
      )}
    </div>
  );
}
