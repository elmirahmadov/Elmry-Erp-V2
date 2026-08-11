import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import * as XLSX from "xlsx";
import {
  fetchExpenseAnalysis,
  type ExpenseAnalysisResponse,
} from "../../../common/actions/finance.actions";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import FinanceReportLayout from "../components/FinanceReportLayout";
import FinanceReportToolbar from "../components/FinanceReportToolbar";
import { fmt, getDateRange, TH_CLASS, TD_CLASS } from "../utils/financeReportUtils";

const BRANCH_STORAGE_KEY = "selectedBranchName";
const PIE_COLORS = ["hsl(var(--primary))", "#275bc2", "#16a34a", "#dc2626", "#d97706", "#8a7009", "#b8960c"];

export default function GiderAnaliziPage() {
  const { user, branches } = useAuth();
  const companyId = user?.companyId;

  const [data, setData] = useState<ExpenseAnalysisResponse | null>(null);
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
        const result = await fetchExpenseAnalysis(
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

  const sortedCategories = useMemo(
    () => [...(data?.byCategory ?? [])].sort((a, b) => b.total - a.total),
    [data],
  );

  const handleExport = () => {
    if (!data?.byCategory.length) {
      alert("Məlumat yoxdur.");
      return;
    }
    const total = data.totalExpense;
    const rows = data.byCategory.map((c, i) => ({
      "#": i + 1,
      Kateqoriya: c.category,
      "Əməliyyat sayı": c.count,
      "Məbləğ (₼)": c.total,
      "Faiz (%)": total > 0 ? ((c.total / total) * 100).toFixed(1) : "0.0",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "XercAnalizi");
    XLSX.writeFile(wb, `Xerc_Analizi_${startDate}_${endDate}.xlsx`);
  };

  return (
    <FinanceReportLayout
      totalRows={sortedCategories.length}
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
          <div className="flex min-w-[160px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Ümumi Xərc</span>
            <span className="text-base font-bold text-destructive">{fmt(data?.totalExpense ?? 0)} ₼</span>
          </div>
          <div className="flex min-w-[160px] flex-1 flex-col border border-border bg-card px-3 py-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Kateqoriya Sayı</span>
            <span className="text-base font-bold text-foreground">{data?.byCategory.length ?? 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Kateqoriya üzrə Xərclər</h3>
            {(data?.byCategory.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data!.byCategory}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(((percent ?? 0) * 100).toFixed(0))}%`
                    }
                    labelLine={false}
                  >
                    {data!.byCategory.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${fmt(Number(val))} ₼`]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart />
              </ResponsiveContainer>
            )}
          </div>

          <div className="border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Aylıq Xərc Trendi</h3>
            {(data?.byMonth.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data!.byMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v} ₼`} />
                  <Tooltip formatter={(val) => [`${fmt(Number(val))} ₼`]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="mexaric" name="Məxaric" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gider" name="Gider" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart />
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-2 border-b border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground">
            Top Kateqoriyalar
          </h3>
          <table className="min-w-max w-full border-collapse">
            <thead className="bg-secondary sticky top-0">
              <tr>
                {["#", "Kateqoriya", "Əməliyyat Sayı", "Məbləğ", "Faiz Payı"].map((h) => (
                  <th key={h} className={TH_CLASS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((cat, i) => {
                const pct =
                  (data?.totalExpense ?? 0) > 0
                    ? (cat.total / data!.totalExpense) * 100
                    : 0;
                return (
                  <tr key={cat.category}>
                    <td className={TD_CLASS}>{i + 1}</td>
                    <td className={`${TD_CLASS} font-medium text-foreground`}>{cat.category}</td>
                    <td className={`${TD_CLASS} text-muted-foreground`}>{cat.count}</td>
                    <td className={`${TD_CLASS} font-semibold text-destructive`}>{fmt(cat.total)} ₼</td>
                    <td className={TD_CLASS}>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded bg-secondary">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${pct}%`,
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                        </div>
                        <span className="min-w-[36px] text-xs font-semibold">{pct.toFixed(1)}%</span>
                      </div>
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
