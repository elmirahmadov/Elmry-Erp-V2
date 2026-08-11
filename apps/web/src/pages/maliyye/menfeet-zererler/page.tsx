import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import * as XLSX from "xlsx";
import {
  fetchProfitLoss,
  type ProfitLossResponse,
} from "../../../common/actions/finance.actions";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import FinanceReportLayout from "../components/FinanceReportLayout";
import FinanceReportToolbar from "../components/FinanceReportToolbar";
import { fmt, getDateRange, TH_CLASS, TD_CLASS } from "../utils/financeReportUtils";

const BRANCH_STORAGE_KEY = "selectedBranchName";

export default function MenfeetZererlerPage() {
  const { user, branches } = useAuth();
  const companyId = user?.companyId;

  const [data, setData] = useState<ProfitLossResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
  const [preset, setPreset] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filterKey, setFilterKey] = useState(0);

  const { startDate, endDate } = useMemo(() => {
    if (preset === "custom" && customStart && customEnd) {
      return { startDate: customStart, endDate: customEnd };
    }
    return getDateRange(preset);
  }, [preset, customStart, customEnd]);

  useEffect(() => {
    if (!branches.length) return;
    const saved = localStorage.getItem(BRANCH_STORAGE_KEY);
    const matched = branches.find((b) => b.name === saved);
    setSelectedBranchId(matched?.id);
  }, [branches]);

  useEffect(() => {
    if (!companyId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProfitLoss(
          companyId,
          selectedBranchId,
          startDate,
          endDate,
        );
        setData(result);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [companyId, selectedBranchId, startDate, endDate, filterKey]);

  const s = data?.summary;
  const netProfit = s?.netProfit ?? 0;

  const handleExport = () => {
    if (!data?.topProducts.length) {
      alert("Məlumat yoxdur.");
      return;
    }
    const rows = data.topProducts.map((p, i) => ({
      "#": i + 1,
      Məhsul: p.name,
      Miqdar: p.quantity,
      "Alış Xərci (₼)": p.cost,
      "Satış Qiyməti (₼)": p.salePrice,
      "Potensial Mənfəət (₼)": p.salePrice * p.quantity - p.cost,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TopMehsullar");
    XLSX.writeFile(wb, `Menfeet_Zerer_${startDate}_${endDate}.xlsx`);
  };

  return (
    <FinanceReportLayout
      totalRows={data?.topProducts.length ?? 0}
      error={error}
      loading={loading}
      toolbar={
        <FinanceReportToolbar
          branches={branches}
          selectedBranchId={selectedBranchId}
          onBranchChange={setSelectedBranchId}
          preset={preset}
          onPresetChange={setPreset}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          onFilter={() => setFilterKey((k) => k + 1)}
          onExport={handleExport}
          exportLabel="Excel"
        />
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex min-w-[130px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Gəlir</span>
            <span className="text-base font-bold text-success">{fmt(s?.revenue ?? 0)} ₼</span>
          </div>
          <div className="flex min-w-[130px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Alış Xərci (COGS)</span>
            <span className="text-base font-bold text-primary">{fmt(s?.cogs ?? 0)} ₼</span>
          </div>
          <div className="flex min-w-[130px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Brüt Mənfəət</span>
            <span className="text-base font-bold text-foreground">{fmt(s?.grossProfit ?? 0)} ₼</span>
          </div>
          <div className="flex min-w-[130px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Əməliyyat Xərcləri</span>
            <span className="text-base font-bold text-destructive">{fmt(s?.operatingExpenses ?? 0)} ₼</span>
          </div>
          <div className="flex min-w-[130px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Xalis Mənfəət</span>
            <span className={`text-base font-bold ${netProfit >= 0 ? "text-success" : "text-destructive"}`}>
              {netProfit >= 0 ? "+" : ""}{fmt(netProfit)} ₼
            </span>
          </div>
          <div className="flex min-w-[130px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Xalis Marja</span>
            <span className="text-base font-bold text-foreground">{(s?.netMargin ?? 0).toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border border-border bg-card px-4 py-2 text-sm">
          <span className="text-muted-foreground">Brüt Marja:</span>
          <span className="font-bold text-foreground">{(s?.grossMargin ?? 0).toFixed(1)}%</span>
          <span className="text-muted-foreground">Xalis Marja:</span>
          <span className={`font-bold ${netProfit >= 0 ? "text-success" : "text-destructive"}`}>
            {(s?.netMargin ?? 0).toFixed(1)}%
          </span>
        </div>

        <div className="border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Aylıq Mənfəət Trendi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.monthly ?? []} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v} ₼`} />
              <Tooltip formatter={(val) => [`${fmt(Number(val))} ₼`]} contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" name="Gəlir" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expenses" name="Xərc" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" name="Mənfəət" stroke="#275bc2" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="mb-2 border-b border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground">
            Top Məhsullar — Alış Xərci üzrə
          </h3>
          <table className="min-w-max w-full border-collapse">
            <thead className="bg-secondary sticky top-0">
              <tr>
                {["#", "Məhsul", "Miqdar", "Alış Xərci", "Satış Qiyməti", "Potensial Mənfəət"].map((h) => (
                  <th key={h} className={TH_CLASS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.topProducts ?? []).map((p, i) => {
                const potentialProfit = p.salePrice * p.quantity - p.cost;
                return (
                  <tr key={i}>
                    <td className={`${TD_CLASS} text-muted-foreground`}>{i + 1}</td>
                    <td className={`${TD_CLASS} font-medium text-foreground`}>{p.name}</td>
                    <td className={`${TD_CLASS} text-muted-foreground`}>{p.quantity}</td>
                    <td className={`${TD_CLASS} font-semibold text-primary`}>{fmt(p.cost)} ₼</td>
                    <td className={`${TD_CLASS} font-semibold text-foreground`}>{fmt(p.salePrice)} ₼</td>
                    <td className={`${TD_CLASS} font-bold ${potentialProfit >= 0 ? "text-success" : "text-destructive"}`}>
                      {potentialProfit >= 0 ? "+" : ""}{fmt(potentialProfit)} ₼
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </FinanceReportLayout>
  );
}
