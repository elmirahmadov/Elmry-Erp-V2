import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../common/contexts/AuthContext";
import Loading from "../../common/components/loading/Loading";
import { Pagination } from "../../common/components/pagination";
import {
  fetchTillOverview,
  fetchTills,
  createTillTransaction,
  transferBetweenTills,
  updateTillTransaction,
  deleteTillTransaction,
  type Till,
  type TillTransaction,
} from "../../common/actions/tills.actions";
import TillTransactionModal from "./components/TillTransactionModal";
import KassalarFilterDrawer, {
  type KassalarDetailFilters,
} from "./components/KassalarFilterDrawer";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

type TransferTillOption = Till & { branchName: string };

const ITEMS_PER_PAGE = 20;

const TH_CLASS =
  "px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border";
const TD_CLASS =
  "px-3 py-2 text-sm text-center whitespace-nowrap border-b border-border";

const getTodayDateValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr.split("T")[0];
  return d.toLocaleDateString("tr-TR");
};

export default function KassalarPage() {
  const { user, branches } = useAuth();
  const companyId = user?.companyId;
  const today = getTodayDateValue();

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [branchTills, setBranchTills] = useState<TransferTillOption[]>([]);
  const [transferTills, setTransferTills] = useState<TransferTillOption[]>([]);
  const [selectedTillId, setSelectedTillId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TillTransaction[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingTills, setLoadingTills] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<KassalarDetailFilters>({
    branchId: null,
    tillId: null,
    startDate: today,
    endDate: today,
  });
  const [draftTills, setDraftTills] = useState<TransferTillOption[]>([]);
  const [loadingDraftTills, setLoadingDraftTills] = useState(false);

  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TillTransaction | null>(null);

  const selectedTill = useMemo(
    () => branchTills.find((t) => t.id === selectedTillId) ?? null,
    [branchTills, selectedTillId],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (startDate !== today) count += 1;
    if (endDate !== today) count += 1;
    if (branches[0] && selectedBranchId && selectedBranchId !== branches[0].id) {
      count += 1;
    }
    return count;
  }, [startDate, endDate, selectedBranchId, branches, today]);

  const mapBranchTills = (items: Till[], branchId: number) => {
    const branchName = branches.find((b) => b.id === branchId)?.name ?? "";
    return items.map((till) => ({ ...till, branchName }));
  };

  const loadOverview = async (options?: {
    branchId?: number | null;
    tillId?: number | null;
    startDate?: string;
    endDate?: string;
  }) => {
    const branchId = options?.branchId ?? selectedBranchId;
    const tillId =
      options && "tillId" in options ? options.tillId : selectedTillId;
    const from = options?.startDate ?? startDate;
    const to = options?.endDate ?? endDate;

    if (!companyId || !branchId) {
      setBranchTills([]);
      setTransactions([]);
      setSelectedTillId(null);
      return null;
    }
    setLoadingTills(true);
    setLoadingTransactions(true);
    try {
      const overview = await fetchTillOverview({
        branchId,
        companyId,
        tillId: tillId ?? undefined,
        startDate: from,
        endDate: to,
      });
      const mapped = mapBranchTills(overview.tills, branchId);
      setBranchTills(mapped);
      setTransactions(overview.transactions);
      setSelectedTillId(overview.selectedTillId);
      setCurrentPage(1);
      return { ...overview, tills: mapped };
    } catch (e) {
      setError((e as Error).message);
      setBranchTills([]);
      setTransactions([]);
      setSelectedTillId(null);
      return null;
    } finally {
      setLoadingTills(false);
      setLoadingTransactions(false);
    }
  };

  const loadDraftTills = async (branchId: number | null) => {
    if (!companyId || !branchId) {
      setDraftTills([]);
      return [];
    }
    setLoadingDraftTills(true);
    try {
      const tills = mapBranchTills(await fetchTills(companyId, branchId), branchId);
      setDraftTills(tills);
      return tills;
    } catch (e) {
      setError((e as Error).message);
      setDraftTills([]);
      return [];
    } finally {
      setLoadingDraftTills(false);
    }
  };

  const loadTransferTills = async () => {
    if (!companyId || branches.length === 0) {
      setTransferTills([]);
      return [];
    }
    try {
      const all = await Promise.all(
        branches.map(async (b) =>
          mapBranchTills(await fetchTills(companyId, b.id), b.id),
        ),
      );
      const mapped = all.flat();
      setTransferTills(mapped);
      return mapped;
    } catch (e) {
      setError((e as Error).message);
      setTransferTills([]);
      return [];
    }
  };

  useEffect(() => {
    if (!branches.length) {
      setSelectedBranchId(null);
      return;
    }
    setSelectedBranchId((prev) => prev ?? branches[0].id);
  }, [branches]);

  useEffect(() => {
    if (!companyId || !selectedBranchId) {
      setBranchTills([]);
      setTransactions([]);
      setSelectedTillId(null);
      return;
    }
    void loadOverview({
      branchId: selectedBranchId,
      tillId: selectedTillId,
      startDate,
      endDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, selectedBranchId, selectedTillId, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((t) => {
      const haystack = [
        t.description,
        t.category,
        t.counterpartyName,
        t.paymentMethod,
        t.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [transactions, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE),
  );
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const openFilterDrawer = () => {
    setDraftFilters({
      branchId: selectedBranchId,
      tillId: selectedTillId,
      startDate,
      endDate,
    });
    setDraftTills(branchTills);
    setIsFilterOpen(true);
  };

  const updateDraftFilter = <K extends keyof KassalarDetailFilters>(
    key: K,
    value: KassalarDetailFilters[K],
  ) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDraftBranchChange = async (branchId: number | null) => {
    setDraftFilters((prev) => ({ ...prev, branchId, tillId: null }));
    const tills = await loadDraftTills(branchId);
    if (tills[0]) {
      setDraftFilters((prev) => ({ ...prev, tillId: tills[0].id }));
    }
  };

  const applyDetailFilters = () => {
    setSelectedBranchId(draftFilters.branchId);
    setSelectedTillId(draftFilters.tillId);
    setStartDate(draftFilters.startDate || today);
    setEndDate(draftFilters.endDate || today);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const clearDetailFilters = async () => {
    const defaultBranch = branches[0]?.id ?? null;
    const next = {
      branchId: defaultBranch,
      tillId: null as number | null,
      startDate: today,
      endDate: today,
    };
    setDraftFilters(next);
    const tills = await loadDraftTills(defaultBranch);
    const tillId = tills[0]?.id ?? null;
    setDraftFilters({ ...next, tillId });
  };

  const openCreateModal = async () => {
    if (!selectedTill) {
      setError("Lütfen önce Filtre ile bir kasa seçiniz.");
      return;
    }
    setError(null);
    await loadTransferTills();
    setSelectedTx(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openViewModal = (tx: TillTransaction) => {
    setSelectedTx(tx);
    setModalMode("view");
    setModalOpen(true);
  };

  const openEditModal = (tx: TillTransaction) => {
    setSelectedTx(tx);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTx(null);
  };

  const handleTransactionSubmit = async (payload: {
    type: "medaxil" | "mexaric" | "gider" | "transfer" | "alis_iade" | "satis_iade";
    amount: number;
    description?: string;
    paymentMethod?: string;
    category?: string;
    currency?: string;
    counterpartyType?: "supplier" | "customer";
    counterpartyId?: number;
    counterpartyName?: string;
    targetTillId?: number;
  }) => {
    if (!selectedTill || !companyId) return;

    if (payload.type === "transfer") {
      if (!payload.targetTillId) {
        throw new Error("Hedef kasa seçiniz.");
      }
      await transferBetweenTills(selectedTill.id, {
        companyId,
        targetTillId: payload.targetTillId,
        amount: payload.amount,
        description: payload.description,
      });
    } else {
      await createTillTransaction(selectedTill.id, {
        companyId,
        type: payload.type,
        amount: payload.amount,
        description: payload.description,
        paymentMethod: payload.paymentMethod,
        category: payload.category,
        currency: payload.currency,
        counterpartyType: payload.counterpartyType,
        counterpartyId: payload.counterpartyId,
        counterpartyName: payload.counterpartyName,
      });
    }

    await loadOverview({ tillId: selectedTill.id });
    closeModal();
  };

  const handleEditSubmit = async (payload: {
    description?: string;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
  }) => {
    if (!selectedTx || !selectedTillId) return;
    const updated = await updateTillTransaction(
      selectedTillId,
      selectedTx.id,
      payload,
    );
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
    closeModal();
  };

  const handleDeleteTransaction = async (tx: TillTransaction) => {
    if (!selectedTillId) return;
    try {
      setLoadingTransactions(true);
      await deleteTillTransaction(selectedTillId, tx.id);
      await loadOverview({ tillId: selectedTillId });
    } catch (err) {
      setError("Silme hatası: " + (err as Error).message);
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - var(--header-height))" }}
    >
      <div className="shrink-0">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Açıklama, taraf, kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary sm:w-80"
              />
              <button
                type="button"
                onClick={openFilterDrawer}
                className="relative rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Filtre
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-card px-1.5 text-[11px] font-bold text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={openCreateModal}
                disabled={!selectedTill || loadingTills}
                className="rounded bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90 disabled:opacity-50"
              >
                + İşlem
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="border-b border-border px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        {loadingTransactions && !transactions.length ? (
          <div className="flex h-full items-center justify-center">
            <Loading />
          </div>
        ) : (
          <table className="min-w-max w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-secondary">
              <tr>
                {[
                  "ID",
                  "Tip",
                  "Metod",
                  "Məbləğ",
                  "Kateqoriya",
                  "Açıqlama",
                  "Kassa",
                  "Hesab",
                  "Tarix",
                  "Əməliyyat",
                ].map((h) => (
                  <th key={h} className={TH_CLASS}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((t) => {
                const tipLabel =
                  t.type === "medaxil"
                    ? "Mədaxil"
                    : t.type === "alis_iade"
                      ? "Alış iadə"
                      : t.type === "satis_iade"
                        ? "Satış iadə"
                        : t.counterpartyType === "till"
                          ? "Transfer"
                          : t.type === "gider"
                            ? "Gider"
                            : "Məxaric";
                const tipClass =
                  t.type === "medaxil" || t.type === "alis_iade"
                    ? "text-success"
                    : t.counterpartyType === "till"
                      ? "text-primary"
                      : t.type === "satis_iade"
                        ? "text-amber-500"
                        : "text-destructive";

                return (
                  <tr
                    key={t.id}
                    className="border-b border-border hover:bg-accent/40"
                  >
                    <td className={TD_CLASS}>#{t.id}</td>
                    <td className={`${TD_CLASS} font-semibold ${tipClass}`}>
                      {tipLabel}
                    </td>
                    <td className={TD_CLASS}>{t.paymentMethod || "—"}</td>
                    <td className={`${TD_CLASS} font-semibold text-primary`}>
                      {formatCurrency(t.amount)} {t.currency || "AZN"}
                    </td>
                    <td className={TD_CLASS}>{t.category || "—"}</td>
                    <td className={`${TD_CLASS} max-w-[220px] truncate`} title={t.description || ""}>
                      {t.description || "—"}
                    </td>
                    <td className={TD_CLASS}>{selectedTill?.name || "—"}</td>
                    <td className={TD_CLASS}>
                      {t.counterpartyName || "—"}
                    </td>
                    <td className={TD_CLASS}>{formatDate(t.createdAt)}</td>
                    <td className={TD_CLASS}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Görüntüle"
                          onClick={() => openViewModal(t)}
                          className="rounded border border-border bg-card p-1.5 text-success hover:bg-accent"
                        >
                          <FiEye size={14} />
                        </button>
                        {t.counterpartyType !== "till" && (
                          <button
                            type="button"
                            title="Düzenle"
                            onClick={() => openEditModal(t)}
                            className="rounded border border-border bg-card p-1.5 text-primary hover:bg-accent"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Sil"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bu işlemi silmek istediğinize emin misiniz?",
                              )
                            ) {
                              void handleDeleteTransaction(t);
                            }
                          }}
                          className="rounded border border-border bg-card p-1.5 text-destructive hover:bg-accent"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="shrink-0">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={filteredTransactions.length}
          onPageChange={setCurrentPage}
          totalExtra={
            selectedTill
              ? ` · Bakiye: ${formatCurrency(selectedTill.balance)} ₼`
              : undefined
          }
        />
      </div>

      <KassalarFilterDrawer
        isOpen={isFilterOpen}
        filters={draftFilters}
        branches={branches}
        tills={draftTills}
        loadingTills={loadingDraftTills}
        onChange={updateDraftFilter}
        onBranchChange={(branchId) => {
          void handleDraftBranchChange(branchId);
        }}
        onClose={() => setIsFilterOpen(false)}
        onApply={applyDetailFilters}
        onClear={() => {
          void clearDetailFilters();
        }}
        formatCurrency={formatCurrency}
      />

      <TillTransactionModal
        isOpen={modalOpen}
        mode={modalMode}
        initialData={selectedTx}
        tillBalance={selectedTill?.balance ?? 0}
        sourceTillId={selectedTill?.id ?? 0}
        sourceTillName={selectedTill?.name}
        availableTills={transferTills}
        onClose={closeModal}
        onSubmit={handleTransactionSubmit}
        onEditSubmit={handleEditSubmit}
      />
    </div>
  );
}
