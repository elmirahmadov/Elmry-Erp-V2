import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiAlertTriangle,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBox,
  FiCreditCard,
  FiDollarSign,
  FiFolder,
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
  FiTruck,
  FiUsers,
} from "react-icons/fi";

import { useAuth } from "../../common/contexts/AuthContext";
import Loading from "../../common/components/loading/Loading";
import { fetchProducts, type ProductRecord } from "../../common/actions/products.actions";
import { fetchAllCategories } from "../../common/actions/categories.actions";
import { fetchSuppliers } from "../../common/actions/suppliers.actions";
import { fetchPurchaseVouchers } from "../../common/actions/purchases.actions";
import {
  fetchCashFlow,
  fetchExpenseAnalysis,
  fetchPayables,
  fetchProfitLoss,
  type CashFlowResponse,
  type ExpenseAnalysisResponse,
  type PayablesResponse,
  type ProfitLossResponse,
} from "../../common/actions/finance.actions";
import { fetchTills, type Till } from "../../common/actions/tills.actions";
import styles from "./dashboard.module.css";

const fmtMoney = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const fmtInt = (value: number) =>
  new Intl.NumberFormat("tr-TR").format(value);

const toISO = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const getDateRange = (preset: string) => {
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
  return { startDate: today, endDate: today };
};

const PRESETS = [
  { key: "today", label: "Bugün" },
  { key: "week", label: "7 Gün" },
  { key: "month", label: "Bu Ay" },
  { key: "30d", label: "30 Gün" },
];

const chartTooltipStyle = {
  background: "hsl(220 15% 15%)",
  border: "1px solid hsl(220 15% 25%)",
  borderRadius: 10,
  fontSize: 12,
  color: "#f7f9fc",
};

type TillWithBranch = Till & { branchName?: string };

type BranchStat = {
  id: number;
  name: string;
  tillCount: number;
  balance: number;
  cashIn: number;
  cashOut: number;
  netFlow: number;
  payable: number;
  netProfit: number;
};

type DashboardData = {
  products: ProductRecord[];
  categoriesCount: number;
  suppliersCount: number;
  purchaseCount: number;
  tills: TillWithBranch[];
  branchStats: BranchStat[];
  cashFlow: CashFlowResponse | null;
  expenses: ExpenseAnalysisResponse | null;
  profitLoss: ProfitLossResponse | null;
  payables: PayablesResponse | null;
};

export default function DashboardPage() {
  const { user, branches } = useAuth();
  const companyId = user?.companyId;

  const [preset, setPreset] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  const { startDate, endDate } = useMemo(() => getDateRange(preset), [preset]);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          products,
          categories,
          suppliers,
          purchases,
          branchResults,
          cashFlow,
          expenses,
          profitLoss,
          payables,
        ] = await Promise.all([
          fetchProducts(companyId),
          fetchAllCategories(companyId),
          fetchSuppliers(companyId),
          fetchPurchaseVouchers(companyId, 1, 1),
          branches.length
            ? Promise.all(
                branches.map(async (branch) => {
                  const [tills, branchCash, branchPayables, branchProfit] =
                    await Promise.all([
                      fetchTills(companyId, branch.id),
                      fetchCashFlow(companyId, branch.id, startDate, endDate),
                      fetchPayables(companyId, branch.id),
                      fetchProfitLoss(companyId, branch.id, startDate, endDate),
                    ]);
                  const balance = tills.reduce(
                    (sum, till) => sum + (till.balance ?? 0),
                    0,
                  );
                  return {
                    tills: tills.map((till) => ({
                      ...till,
                      branchName: branch.name,
                    })),
                    stat: {
                      id: branch.id,
                      name: branch.name,
                      tillCount: tills.length,
                      balance,
                      cashIn: branchCash.totalCashIn ?? 0,
                      cashOut: branchCash.totalCashOut ?? 0,
                      netFlow:
                        branchCash.netFlow ??
                        (branchCash.totalCashIn ?? 0) -
                          (branchCash.totalCashOut ?? 0),
                      payable: branchPayables.totalPayable ?? 0,
                      netProfit: branchProfit.summary?.netProfit ?? 0,
                    } satisfies BranchStat,
                  };
                }),
              )
            : Promise.resolve(
                [] as {
                  tills: TillWithBranch[];
                  stat: BranchStat;
                }[],
              ),
          fetchCashFlow(companyId, undefined, startDate, endDate),
          fetchExpenseAnalysis(companyId, undefined, startDate, endDate),
          fetchProfitLoss(companyId, undefined, startDate, endDate),
          fetchPayables(companyId),
        ]);

        if (cancelled) return;

        setData({
          products,
          categoriesCount: categories.length,
          suppliersCount: suppliers.length,
          purchaseCount: purchases.total,
          tills: branchResults.flatMap((item) => item.tills),
          branchStats: branchResults.map((item) => item.stat),
          cashFlow,
          expenses,
          profitLoss,
          payables,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Dashboard yüklenemedi",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [companyId, branches, startDate, endDate]);

  const lowStock = useMemo(() => {
    if (!data) return [];
    return [...data.products]
      .filter((p) => p.isActive)
      .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0))
      .slice(0, 6);
  }, [data]);

  const activeProducts = data?.products.filter((p) => p.isActive).length ?? 0;
  const totalBalance =
    data?.tills.reduce((sum, till) => sum + (till.balance ?? 0), 0) ?? 0;
  const cashIn = data?.cashFlow?.totalCashIn ?? 0;
  const cashOut = data?.cashFlow?.totalCashOut ?? 0;
  const netFlow = data?.cashFlow?.netFlow ?? cashIn - cashOut;
  const netProfit = data?.profitLoss?.summary.netProfit ?? 0;
  const totalPayable = data?.payables?.totalPayable ?? 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  }, []);

  if (!companyId) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>Önce giriş yapmalısınız.</div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} wv-animate-fade-in`}>
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.eyebrow}>Elmry ERP · Operasyon Paneli</div>
          <h1 className={styles.heroTitle}>
            {greeting}, {user?.name?.trim() || "Kullanıcı"}
          </h1>
        </div>

        <div className={styles.presets}>
          {PRESETS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.presetBtn} ${
                preset === item.key ? styles.presetActive : ""
              }`}
              onClick={() => setPreset(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading && !data ? (
        <div className={styles.loadingWrap}>
          <Loading />
        </div>
      ) : (
        <>
          <section className={styles.kpiGrid}>
            <KpiCard
              label="Aktif Ürün"
              value={fmtInt(activeProducts)}
              hint={`Toplam ${fmtInt(data?.products.length ?? 0)} kayıt`}
              icon={<FiPackage />}
              tone="gold"
              trend={`${data?.categoriesCount ?? 0} kategori`}
              trendTone="neutral"
            />
            <KpiCard
              label="Tedarikçi"
              value={fmtInt(data?.suppliersCount ?? 0)}
              hint="Aktif iş ortakları"
              icon={<FiTruck />}
              tone="blue"
              trend={`${fmtInt(data?.purchaseCount ?? 0)} alış senedi`}
              trendTone="neutral"
            />
            <KpiCard
              label="Kasa Bakiyesi"
              value={`${fmtMoney(totalBalance)} ₼`}
              hint={`${data?.tills.length ?? 0} kasa`}
              icon={<FiDollarSign />}
              tone="gold"
              trend={totalBalance >= 0 ? "Stabil" : "Dikkat"}
              trendTone={totalBalance >= 0 ? "up" : "down"}
            />
            <KpiCard
              label="Giriş"
              value={`+${fmtMoney(cashIn)} ₼`}
              hint="Seçilen dönem"
              icon={<FiArrowUpRight />}
              tone="green"
              trend="Gelir"
              trendTone="up"
            />
            <KpiCard
              label="Çıkış"
              value={`-${fmtMoney(cashOut)} ₼`}
              hint="Seçilen dönem"
              icon={<FiArrowDownRight />}
              tone="red"
              trend="Gider"
              trendTone="down"
            />
            <KpiCard
              label="Net / Borç"
              value={`${netFlow >= 0 ? "+" : ""}${fmtMoney(netFlow)} ₼`}
              hint={`Ödenecek: ${fmtMoney(totalPayable)} ₼`}
              icon={<FiTrendingUp />}
              tone={netFlow >= 0 ? "green" : "red"}
              trend={netProfit >= 0 ? "Kâr+" : "Zarar"}
              trendTone={netProfit >= 0 ? "up" : "down"}
            />
          </section>

          <section className={styles.branchSection}>
            <article className={`${styles.panel} ${styles.branchPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Şube analizi</h2>
                  <p className={styles.panelSub}>
                    Tüm şubelerin dönemsel karşılaştırılması ·{" "}
                    {fmtInt(data?.branchStats.length ?? 0)} şube
                  </p>
                </div>
              </div>
              <div className={styles.panelBody}>
                {(data?.branchStats.length ?? 0) === 0 ? (
                  <div className={styles.empty}>Şube bulunamadı.</div>
                ) : (
                  <div className={styles.branchLayout}>
                    <div className={styles.branchCards}>
                      {(data?.branchStats ?? []).map((branch) => (
                        <div key={branch.id} className={styles.branchCard}>
                          <div className={styles.branchCardTop}>
                            <h3 className={styles.branchName}>{branch.name}</h3>
                            <span className={styles.badgeOk}>
                              {fmtInt(branch.tillCount)} kasa
                            </span>
                          </div>
                          <div className={styles.branchMetrics}>
                            <div>
                              <span className={styles.branchMetricLabel}>
                                Bakiye
                              </span>
                              <strong className={styles.amountMuted}>
                                {fmtMoney(branch.balance)} ₼
                              </strong>
                            </div>
                            <div>
                              <span className={styles.branchMetricLabel}>
                                Giriş
                              </span>
                              <strong className={styles.amountPos}>
                                +{fmtMoney(branch.cashIn)} ₼
                              </strong>
                            </div>
                            <div>
                              <span className={styles.branchMetricLabel}>
                                Çıkış
                              </span>
                              <strong className={styles.amountNeg}>
                                -{fmtMoney(branch.cashOut)} ₼
                              </strong>
                            </div>
                            <div>
                              <span className={styles.branchMetricLabel}>
                                Net
                              </span>
                              <strong
                                className={
                                  branch.netFlow >= 0
                                    ? styles.amountPos
                                    : styles.amountNeg
                                }
                              >
                                {branch.netFlow >= 0 ? "+" : ""}
                                {fmtMoney(branch.netFlow)} ₼
                              </strong>
                            </div>
                            <div>
                              <span className={styles.branchMetricLabel}>
                                Borç
                              </span>
                              <strong className={styles.amountNeg}>
                                {fmtMoney(branch.payable)} ₼
                              </strong>
                            </div>
                            <div>
                              <span className={styles.branchMetricLabel}>
                                Kâr / Zarar
                              </span>
                              <strong
                                className={
                                  branch.netProfit >= 0
                                    ? styles.amountPos
                                    : styles.amountNeg
                                }
                              >
                                {branch.netProfit >= 0 ? "+" : ""}
                                {fmtMoney(branch.netProfit)} ₼
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.branchChartWrap}>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={data?.branchStats ?? []}
                          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid
                            stroke="hsl(220 15% 22%)"
                            strokeDasharray="3 3"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#bbb", fontSize: 11 }}
                          />
                          <YAxis tick={{ fill: "#888", fontSize: 11 }} width={48} />
                          <Tooltip
                            contentStyle={chartTooltipStyle}
                            formatter={(value: number, name: string) => [
                              `${fmtMoney(Number(value))} ₼`,
                              name === "cashIn"
                                ? "Giriş"
                                : name === "cashOut"
                                  ? "Çıkış"
                                  : name === "balance"
                                    ? "Bakiye"
                                    : "Net",
                            ]}
                          />
                          <Bar
                            dataKey="cashIn"
                            name="cashIn"
                            fill="#27c237"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="cashOut"
                            name="cashOut"
                            fill="#f64e34"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="balance"
                            name="balance"
                            fill="#e7bc0f"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </section>

          <section className={styles.mainGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Nakit akışı</h2>
                  <p className={styles.panelSub}>
                    Günlük giriş / çıkış trendi
                  </p>
                </div>
              </div>
              <div className={styles.panelBody}>
                {(data?.cashFlow?.daily?.length ?? 0) === 0 ? (
                  <div className={styles.empty}>Bu aralıkta akış verisi yok.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data?.cashFlow?.daily ?? []}>
                      <defs>
                        <linearGradient id="inFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#27c237" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#27c237" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="outFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f64e34" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#f64e34" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="hsl(220 15% 22%)" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#888", fontSize: 11 }}
                        tickFormatter={(v) => String(v).slice(5)}
                      />
                      <YAxis tick={{ fill: "#888", fontSize: 11 }} width={48} />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value: number) => [`${fmtMoney(Number(value))} ₼`]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cashIn"
                        name="Giriş"
                        stroke="#27c237"
                        fill="url(#inFill)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="cashOut"
                        name="Çıkış"
                        stroke="#f64e34"
                        fill="url(#outFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Gider kategorileri</h2>
                  <p className={styles.panelSub}>
                    Toplam gider: {fmtMoney(data?.expenses?.totalExpense ?? 0)} ₼
                  </p>
                </div>
                <Link to="/maliyye/gider-analizi" className="wv-text-primary text-xs font-semibold">
                  Analiz →
                </Link>
              </div>
              <div className={styles.panelBody}>
                {(data?.expenses?.byCategory?.length ?? 0) === 0 ? (
                  <div className={styles.empty}>Kategori gideri yok.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={(data?.expenses?.byCategory ?? []).slice(0, 6)}
                      layout="vertical"
                      margin={{ left: 8, right: 8 }}
                    >
                      <CartesianGrid stroke="hsl(220 15% 22%)" strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fill: "#888", fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="category"
                        width={88}
                        tick={{ fill: "#bbb", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value: number) => [`${fmtMoney(Number(value))} ₼`, "Tutar"]}
                      />
                      <Bar dataKey="total" fill="#e7bc0f" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </article>
          </section>

          <section className={styles.bottomGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Düşük stok</h2>
                  <p className={styles.panelSub}>En az kalan ürünler</p>
                </div>
                <Link to="/products" className="wv-text-primary text-xs font-semibold">
                  Ürünler →
                </Link>
              </div>
              <div className={styles.panelBody}>
                {lowStock.length === 0 ? (
                  <div className={styles.empty}>Ürün bulunamadı.</div>
                ) : (
                  <div className={styles.list}>
                    {lowStock.map((product) => {
                      const qty = product.stockQuantity ?? 0;
                      const danger = qty <= 5;
                      return (
                        <div key={product.id} className={styles.listItem}>
                          <div className={styles.listItemMain}>
                            <p className={styles.listItemTitle}>{product.name}</p>
                            <p className={styles.listItemMeta}>
                              {product.barcode} · {product.stockUnit || "adet"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={styles.stockBar}>
                              <div
                                className={styles.stockFill}
                                style={{
                                  width: `${Math.min(100, Math.max(8, qty * 4))}%`,
                                  background: danger
                                    ? "var(--semantic-error)"
                                    : "var(--semantic-warning)",
                                }}
                              />
                            </div>
                            <span
                              className={`${styles.badge} ${
                                danger ? styles.badgeDanger : styles.badgeWarn
                              }`}
                            >
                              {fmtInt(qty)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Borçlar</h2>
                  <p className={styles.panelSub}>
                    Toplam: {fmtMoney(totalPayable)} ₼
                  </p>
                </div>
              </div>
              <div className={styles.panelBody}>
                {(data?.payables?.items?.length ?? 0) === 0 ? (
                  <div className={styles.empty}>Açık borç yok.</div>
                ) : (
                  <div className={styles.list}>
                    {(data?.payables?.items ?? []).slice(0, 6).map((item) => (
                      <div key={item.id} className={styles.listItem}>
                        <div className={styles.listItemMain}>
                          <p className={styles.listItemTitle}>{item.supplierName}</p>
                          <p className={styles.listItemMeta}>
                            {item.serialNo || "—"} · {item.agingBucket}
                            {item.overdueDays > 0
                              ? ` · ${item.overdueDays} gün gecikme`
                              : ""}
                          </p>
                        </div>
                        <span className={styles.amountNeg}>
                          {fmtMoney(item.remainingAmount)} ₼
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Kasalar ve hızlı geçiş</h2>
                  <p className={styles.panelSub}>
                    Tüm şubelerin kasaları ve kısayollar
                  </p>
                </div>
              </div>
              <div className={styles.panelBody}>
                {(data?.tills?.length ?? 0) > 0 && (
                  <div className="mb-3">
                    {data?.tills.slice(0, 6).map((till) => (
                      <div key={till.id} className={styles.tillRow}>
                        <div>
                          <p className={styles.listItemTitle}>{till.name}</p>
                          <p className={styles.listItemMeta}>
                            {till.branchName ? `${till.branchName} · ` : ""}
                            {till.status === "active" ? "Aktif" : "Pasif"}
                          </p>
                        </div>
                        <span className={styles.amountMuted}>
                          {fmtMoney(till.balance)} ₼
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.quickGrid}>
                  <Link to="/products" className={styles.quickLink}>
                    <span className={styles.quickIcon}>
                      <FiBox />
                    </span>
                    <span className={styles.quickLabel}>Ürünler</span>
                    <span className={styles.quickHint}>Stok ve fiyat</span>
                  </Link>
                  <Link to="/purchase" className={styles.quickLink}>
                    <span className={styles.quickIcon}>
                      <FiShoppingCart />
                    </span>
                    <span className={styles.quickLabel}>Alış</span>
                    <span className={styles.quickHint}>Senet oluştur</span>
                  </Link>
                  <Link to="/kasalar" className={styles.quickLink}>
                    <span className={styles.quickIcon}>
                      <FiCreditCard />
                    </span>
                    <span className={styles.quickLabel}>Kasalar</span>
                    <span className={styles.quickHint}>İşlemler</span>
                  </Link>
                  <Link to="/maliyye/hesabat" className={styles.quickLink}>
                    <span className={styles.quickIcon}>
                      <FiFolder />
                    </span>
                    <span className={styles.quickLabel}>Rapor</span>
                    <span className={styles.quickHint}>Mali özet</span>
                  </Link>
                  <Link to="/suppliers" className={styles.quickLink}>
                    <span className={styles.quickIcon}>
                      <FiUsers />
                    </span>
                    <span className={styles.quickLabel}>Tedarikçiler</span>
                    <span className={styles.quickHint}>Ödeme / borç</span>
                  </Link>
                  <Link to="/maliyye/menfeet-zererler" className={styles.quickLink}>
                    <span className={styles.quickIcon}>
                      <FiAlertTriangle />
                    </span>
                    <span className={styles.quickLabel}>Kâr</span>
                    <span className={styles.quickHint}>
                      {fmtMoney(netProfit)} ₼
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
  trend,
  trendTone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "gold" | "green" | "red" | "blue";
  trend: string;
  trendTone: "up" | "down" | "neutral";
}) {
  const tones = {
    gold: {
      bg: "rgba(231,188,15,0.15)",
      color: "#e7bc0f",
    },
    green: {
      bg: "rgba(39,194,55,0.15)",
      color: "#27c237",
    },
    red: {
      bg: "rgba(246,78,52,0.15)",
      color: "#f64e34",
    },
    blue: {
      bg: "rgba(39,91,194,0.18)",
      color: "#7aa2ff",
    },
  }[tone];

  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiTop}>
        <div
          className={styles.kpiIcon}
          style={{ background: tones.bg, color: tones.color }}
        >
          {icon}
        </div>
        <span
          className={`${styles.kpiTrend} ${
            trendTone === "up"
              ? styles.trendUp
              : trendTone === "down"
                ? styles.trendDown
                : styles.trendNeutral
          }`}
        >
          {trend}
        </span>
      </div>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      <p className={styles.kpiHint}>{hint}</p>
    </div>
  );
}
