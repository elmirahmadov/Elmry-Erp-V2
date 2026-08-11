import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import * as XLSX from "xlsx";
import {
  fetchTills,
  fetchTillTransactions,
  type Till,
  type TillTransaction,
} from "../../../common/actions/tills.actions";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import FinanceReportLayout from "../components/FinanceReportLayout";
import FinanceReportToolbar from "../components/FinanceReportToolbar";
import {
  fmt,
  getDateRange,
  toISO,
  TH_CLASS,
  TD_CLASS,
} from "../utils/financeReportUtils";

const BRANCH_STORAGE_KEY = "selectedBranchName";

function StatCell({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex min-w-[130px] flex-1 flex-col border border-border bg-card px-3 py-2">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <span className={`text-base font-bold ${valueClass ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

export default function MaliyyeHesabatPage() {
  const { user, branches } = useAuth();
  const companyId = user?.companyId;

  const [preset, setPreset] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filterKey, setFilterKey] = useState(0);
  const [tills, setTills] = useState<Till[]>([]);
  const [allTransactions, setAllTransactions] = useState<TillTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);

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
        const branchIds =
          selectedBranchId !== undefined
            ? [selectedBranchId]
            : branches.map((b) => b.id);
        if (!branchIds.length) {
          setTills([]);
          setAllTransactions([]);
          return;
        }
        const tillArrays = await Promise.all(
          branchIds.map((id) => fetchTills(companyId, id)),
        );
        const tillList = tillArrays.flat();
        setTills(tillList);
        const txArrays = await Promise.all(
          tillList.map((t: Till) =>
            fetchTillTransactions(t.id, { startDate, endDate }),
          ),
        );
        setAllTransactions(txArrays.flat());
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [companyId, selectedBranchId, startDate, endDate, branches, filterKey]);

  const summary = useMemo(() => {
    const medaxil = allTransactions
      .filter((t) => t.type === "medaxil" && t.counterpartyType !== "till")
      .reduce((s, t) => s + t.amount, 0);
    const mexaric = allTransactions
      .filter((t) => t.type === "mexaric" && t.counterpartyType !== "till")
      .reduce((s, t) => s + t.amount, 0);
    const gider = allTransactions
      .filter((t) => t.type === "gider")
      .reduce((s, t) => s + t.amount, 0);
    return {
      medaxil,
      mexaric,
      gider,
      net: medaxil - mexaric - gider,
      txCount: allTransactions.length,
    };
  }, [allTransactions]);

  const dailyData = useMemo(() => {
    const map: Record<
      string,
      { date: string; Medaxil: number; Mexaric: number; Gider: number }
    > = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = toISO(new Date(d));
      map[key] = { date: key.slice(5), Medaxil: 0, Mexaric: 0, Gider: 0 };
    }
    allTransactions.forEach((t) => {
      const key = t.createdAt.slice(0, 10);
      if (!map[key]) return;
      if (t.type === "medaxil" && t.counterpartyType !== "till")
        map[key].Medaxil += t.amount;
      if (t.type === "mexaric" && t.counterpartyType !== "till")
        map[key].Mexaric += t.amount;
      if (t.type === "gider") map[key].Gider += t.amount;
    });
    return Object.values(map);
  }, [allTransactions, startDate, endDate]);

  const tillBreakdown = useMemo(() => {
    return tills.map((till) => {
      const txs = allTransactions.filter((t) => t.tillId === till.id);
      const medaxil = txs
        .filter((t) => t.type === "medaxil" && t.counterpartyType !== "till")
        .reduce((s, t) => s + t.amount, 0);
      const mexaric = txs
        .filter((t) => t.type === "mexaric" && t.counterpartyType !== "till")
        .reduce((s, t) => s + t.amount, 0);
      const gider = txs
        .filter((t) => t.type === "gider")
        .reduce((s, t) => s + t.amount, 0);
      return {
        name: till.name,
        balance: till.balance,
        medaxil,
        mexaric,
        gider,
        net: medaxil - mexaric - gider,
        count: txs.length,
      };
    });
  }, [tills, allTransactions]);

  const topCounterparties = useMemo(() => {
    const map: Record<
      string,
      { name: string; type: string; total: number; count: number }
    > = {};
    allTransactions.forEach((t) => {
      if (!t.counterpartyName || t.counterpartyType === "till") return;
      const key = t.counterpartyName;
      if (!map[key])
        map[key] = {
          name: t.counterpartyName,
          type: t.counterpartyType ?? "other",
          total: 0,
          count: 0,
        };
      map[key].total += t.amount;
      map[key].count++;
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [allTransactions]);

  const recentTx = useMemo(
    () =>
      [...allTransactions]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10),
    [allTransactions],
  );

  const handleExportExcel = () => {
    if (allTransactions.length === 0) {
      alert("İxrac ediləcək heç bir əməliyyat yoxdur.");
      return;
    }
    const data = allTransactions.map((t) => ({
      ID: t.id,
      Tip:
        t.type === "medaxil"
          ? "Mədaxil"
          : t.counterpartyType === "till"
            ? "Transfer"
            : "Xərc",
      Metod: t.paymentMethod || "Bank",
      Kateqoriya: t.category || "",
      "Ad / Açıqlama": t.description || "",
      Məbləğ: t.amount,
      Valyuta: t.currency || "AZN",
      Tərəfdaş: t.counterpartyName || "",
      Daşıyıcı: t.carrierName || "",
      "Sifariş ID": t.orderNumber || "",
      Tarix: t.createdAt.split("T")[0],
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hesabat");
    XLSX.writeFile(workbook, `Maliyye_Hesabati_${startDate}_${endDate}.xlsx`);
  };

  const getTypeBadge = (type: string) => {
    if (type === "medaxil")
      return "bg-success/15 text-success";
    if (type === "mexaric")
      return "bg-destructive/15 text-destructive";
    return "bg-primary/15 text-primary";
  };

  const getTypeLabel = (type: string) => {
    if (type === "medaxil") return "Mədaxil";
    if (type === "mexaric") return "Məxaric";
    return "Gider";
  };

  return (
    <FinanceReportLayout
      totalRows={allTransactions.length}
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
          onExport={handleExportExcel}
          exportLabel="Excel"
        />
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap gap-2">
          <StatCell label="Mədaxil" value={`+${fmt(summary.medaxil)} ₼`} valueClass="text-success" />
          <StatCell label="Məxaric" value={`-${fmt(summary.mexaric)} ₼`} valueClass="text-destructive" />
          <StatCell label="Gider" value={`-${fmt(summary.gider)} ₼`} valueClass="text-primary" />
          <StatCell
            label="Net Mənfəət"
            value={`${summary.net >= 0 ? "+" : ""}${fmt(summary.net)} ₼`}
            valueClass={summary.net >= 0 ? "text-success" : "text-destructive"}
          />
          <StatCell label="Əməliyyat Sayı" value={String(summary.txCount)} />
        </div>

        <div className="border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Gündəlik Axış</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gMedaxil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMexaric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGider" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v} ₼`} />
              <Tooltip formatter={(val) => [`${fmt(Number(val))} ₼`]} contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Medaxil" stroke="#22c55e" fill="url(#gMedaxil)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Mexaric" stroke="#ef4444" fill="url(#gMexaric)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Gider" stroke="#f59e0b" fill="url(#gGider)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Kassa üzrə müqayisə</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tillBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip formatter={(val) => [`${fmt(Number(val))} ₼`]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="medaxil" name="Medaxil" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mexaric" name="Mexaric" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Ən çox işlənən tərəflər</h3>
            <table className="min-w-max w-full border-collapse">
              <thead className="bg-secondary sticky top-0">
                <tr>
                  <th className={TH_CLASS}>#</th>
                  <th className={TH_CLASS}>Tərəf</th>
                  <th className={TH_CLASS}>Əməliyyat</th>
                  <th className={TH_CLASS}>Məbləğ</th>
                </tr>
              </thead>
              <tbody>
                {topCounterparties.map((cp, i) => (
                  <tr key={cp.name}>
                    <td className={TD_CLASS}>{i + 1}</td>
                    <td className={`${TD_CLASS} font-medium text-foreground`}>{cp.name}</td>
                    <td className={`${TD_CLASS} text-muted-foreground`}>{cp.count}</td>
                    <td className={`${TD_CLASS} font-semibold`}>{fmt(cp.total)} ₼</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-2 border-b border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground">
            Kassa üzrə Hesabat
          </h3>
          <table className="min-w-max w-full border-collapse">
            <thead className="bg-secondary sticky top-0">
              <tr>
                {["Kassa", "Balans", "Mədaxil", "Məxaric", "Gider", "Net", "Əməliyyat"].map((h) => (
                  <th key={h} className={TH_CLASS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tillBreakdown.map((row) => (
                <tr key={row.name}>
                  <td className={`${TD_CLASS} font-medium text-foreground`}>{row.name}</td>
                  <td className={`${TD_CLASS} font-semibold text-primary`}>{fmt(row.balance)} ₼</td>
                  <td className={`${TD_CLASS} text-success`}>+{fmt(row.medaxil)} ₼</td>
                  <td className={`${TD_CLASS} text-destructive`}>-{fmt(row.mexaric)} ₼</td>
                  <td className={`${TD_CLASS} text-primary`}>-{fmt(row.gider)} ₼</td>
                  <td className={`${TD_CLASS} font-semibold ${row.net >= 0 ? "text-success" : "text-destructive"}`}>
                    {row.net >= 0 ? "+" : ""}{fmt(row.net)} ₼
                  </td>
                  <td className={`${TD_CLASS} text-muted-foreground`}>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="mb-2 border-b border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground">
            Son 10 Əməliyyat
          </h3>
          <table className="min-w-max w-full border-collapse">
            <thead className="bg-secondary sticky top-0">
              <tr>
                {["#", "Növ", "Məbləğ", "Tərəf", "Açıqlama", "Tarix"].map((h) => (
                  <th key={h} className={TH_CLASS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTx.map((t, i) => (
                <tr key={t.id}>
                  <td className={`${TD_CLASS} text-muted-foreground`}>{i + 1}</td>
                  <td className={TD_CLASS}>
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${getTypeBadge(t.type)}`}>
                      {getTypeLabel(t.type)}
                    </span>
                  </td>
                  <td className={`${TD_CLASS} font-semibold ${t.type === "medaxil" ? "text-success" : "text-destructive"}`}>
                    {t.type === "medaxil" ? "+" : "-"}{fmt(t.amount)} {t.currency || "AZN"}
                  </td>
                  <td className={TD_CLASS}>{t.counterpartyName || "—"}</td>
                  <td className={`${TD_CLASS} max-w-[200px] truncate text-muted-foreground`}>
                    {t.description || "—"}
                  </td>
                  <td className={`${TD_CLASS} text-xs text-muted-foreground`}>
                    {new Date(t.createdAt).toLocaleString("az-AZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FinanceReportLayout>
  );
}
