import { FormEvent, useEffect, useMemo, useState } from "react";
import { type Bank, type BankTransaction } from "../../../common/actions/banks.actions";
import { type Supplier } from "../../suppliers/types/supplier.types";
import { fetchSuppliers } from "../../../common/actions/suppliers.actions";
import { useAuth } from "../../../common/contexts/AuthContext";
import Select from "../../../common/components/select";
import { FiEye, FiEdit2, FiDollarSign } from "react-icons/fi";

type TransactionType =
  | "medaxil"
  | "mexaric"
  | "gider"
  | "transfer"
  | "alis_iade"
  | "satis_iade";
type CounterpartyType = "supplier" | "customer";
type TransferBankOption = Bank & { branchName?: string };

const OUTFLOW_TYPES: TransactionType[] = [
  "mexaric",
  "gider",
  "satis_iade",
  "transfer",
];

interface BankTransactionModalProps {
  isOpen: boolean;
  mode?: "create" | "edit" | "view";
  initialData?: BankTransaction | null;
  bankBalance: number;
  sourceBankId: number;
  sourceBankName?: string;
  availableBanks: TransferBankOption[];
  selectableSourceBank?: boolean;
  onSourceBankChange?: (bankId: number) => void;
  presetCounterparty?: {
    id: number;
    name: string;
    type: CounterpartyType;
  } | null;
  counterpartyDebt?: number;
  lockCounterparty?: boolean;
  defaultType?: TransactionType;
  defaultCategory?: string;
  titleOverride?: string;
  onClose: () => void;
  onSubmit: (payload: {
    type: TransactionType;
    amount: number;
    description?: string;
    counterpartyType?: CounterpartyType;
    counterpartyId?: number;
    counterpartyName?: string;
    targetBankId?: number;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
  }) => Promise<void>;
  onEditSubmit?: (payload: {
    description?: string;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
  }) => Promise<void>;
}

const mockCustomers = [
  "Müştəri #1",
  "Müştəri #2",
  "Rahim Məmmədov",
  "Aysel Həsənova",
  "Elçin Əliyev",
];

const fieldClass =
  "w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed";

export default function BankTransactionModal({
  isOpen,
  mode = "create",
  initialData,
  bankBalance,
  sourceBankId,
  sourceBankName,
  availableBanks,
  selectableSourceBank = false,
  onSourceBankChange,
  presetCounterparty = null,
  counterpartyDebt,
  lockCounterparty = false,
  defaultType = "medaxil",
  defaultCategory = "",
  titleOverride,
  onClose,
  onSubmit,
  onEditSubmit,
}: BankTransactionModalProps) {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [transactionType, setTransactionType] = useState<TransactionType>("medaxil");
  const [paymentMethod, setPaymentMethod] = useState("Bank");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AZN");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [targetBankId, setTargetBankId] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferTargets = availableBanks.filter((t) => t.id !== sourceBankId);

  const typeOptions = useMemo(
    () => [
      { value: "medaxil", label: "Mədaxil (Gəlir)" },
      { value: "mexaric", label: "Xərc (Ödəniş edilib)" },
      { value: "alis_iade", label: "Məhsul alış iadə" },
      { value: "satis_iade", label: "Məhsul satış iadə" },
      { value: "transfer", label: "Bank Transferi" },
    ],
    [],
  );

  const counterpartyLabel =
    lockCounterparty && presetCounterparty?.type === "customer"
      ? "Müştəri hesabı"
      : transactionType === "alis_iade"
        ? "Tədarükçü hesabı"
        : transactionType === "satis_iade"
          ? "Müştəri hesabı"
          : "Hesab (müştəri / tədarükçü)";

  const paymentOptions = useMemo(
    () => [
      { value: "Bank", label: "Bank" },
      { value: "Nağd", label: "Nağd" },
      { value: "Kart", label: "Kart" },
      { value: "Digər", label: "Digər" },
    ],
    [],
  );

  const currencyOptions = useMemo(
    () => [
      { value: "AZN", label: "AZN" },
      { value: "USD", label: "USD" },
      { value: "EUR", label: "EUR" },
    ],
    [],
  );

  const targetBankOptions = useMemo(
    () =>
      transferTargets.map((t) => ({
        value: String(t.id),
        label: `${t.branchName ? `${t.branchName} / ` : ""}${t.name} (${t.balance.toFixed(2)} AZN)`,
      })),
    [transferTargets],
  );

  const counterpartyOptions = useMemo(
    () => [
      { value: "", label: "-- Seçilməyib --" },
      ...mockCustomers.map((c) => ({ value: c, label: c })),
      ...suppliers.map((s) => ({ value: s.name, label: `${s.name} (Tədarikçi)` })),
    ],
    [suppliers],
  );

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let raf2: number;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTransactionType(defaultType);
      setPaymentMethod("Bank");
      setCategory(defaultCategory);
      setDescription("");
      setAmount("");
      setCurrency("AZN");
      setCounterpartyName("");
      setTargetBankId("");
      setError(null);
      return;
    }
    if ((isEdit || isView) && initialData) {
      setTransactionType(initialData.type as TransactionType);
      setPaymentMethod(initialData.paymentMethod ?? "Bank");
      setCategory(initialData.category ?? "");
      setDescription(initialData.description ?? "");
      setAmount(String(initialData.amount));
      setCurrency(initialData.currency ?? "AZN");
      setCounterpartyName(initialData.counterpartyName ?? "");
      return;
    }
    if (isCreate) {
      setTransactionType(defaultType);
      setCategory(defaultCategory);
      setPaymentMethod("Nağd");
      if (presetCounterparty) {
        setCounterpartyName(presetCounterparty.name);
      }
    }
  }, [
    isOpen,
    isEdit,
    isView,
    isCreate,
    initialData,
    presetCounterparty,
    defaultType,
    defaultCategory,
  ]);

  useEffect(() => {
    if (!isOpen || !companyId || !isCreate) return;
    setLoadingSuppliers(true);
    fetchSuppliers(companyId)
      .then(setSuppliers)
      .catch(() => setSuppliers([]))
      .finally(() => setLoadingSuppliers(false));
  }, [isOpen, companyId, isCreate]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const title = titleOverride
    ? titleOverride
    : isView
      ? "Əməliyyat Təfərrüatları"
      : isEdit
        ? "Əməliyyatı Düzənlə"
        : "Yeni Maliyyə Əməliyyatı";

  const sourceBankOptions = useMemo(
    () =>
      availableBanks.map((t) => ({
        value: String(t.id),
        label: `${t.branchName ? `${t.branchName} / ` : ""}${t.name} (${t.balance.toFixed(2)} AZN)`,
      })),
    [availableBanks],
  );

  const lockedCounterpartyOptions = useMemo(() => {
    if (!presetCounterparty) return counterpartyOptions;
    return [
      {
        value: presetCounterparty.name,
        label: presetCounterparty.name,
      },
    ];
  }, [presetCounterparty, counterpartyOptions]);

  const parsedPayAmount = useMemo(() => {
    const n = parseFloat(String(amount).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const showDebtSummary =
    lockCounterparty &&
    presetCounterparty?.type === "customer" &&
    typeof counterpartyDebt === "number";

  const remainingDebt = showDebtSummary
    ? Math.max(0, Number(counterpartyDebt) - parsedPayAmount)
    : 0;

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  if (!mounted) return null;

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Zəhmət olmasa düzgün məbləğ daxil edin.");
      return;
    }

    if (transactionType === "transfer" && !targetBankId) {
      setError("Hədəf banknı seçin.");
      return;
    }

    if (
      OUTFLOW_TYPES.includes(transactionType) &&
      parsedAmount > bankBalance &&
      currency === "AZN"
    ) {
      setError(`Bank balansı yetərsizdir. Mövcud: ${bankBalance.toFixed(2)} AZN`);
      return;
    }

    setSubmitting(true);
    try {
      if (isCreate) {
        let cType: CounterpartyType | undefined;
        let cId: number | undefined;

        if (counterpartyName) {
          if (presetCounterparty && counterpartyName === presetCounterparty.name) {
            cType = presetCounterparty.type;
            cId = presetCounterparty.id;
          } else {
            const matchedSupplier = suppliers.find((s) => s.name === counterpartyName);
            if (matchedSupplier) {
              cType = "supplier";
              cId = matchedSupplier.id;
            } else {
              cType = "customer";
            }
          }
        }

        if (transactionType === "alis_iade") {
          cType = "supplier";
        } else if (transactionType === "satis_iade") {
          cType = "customer";
        }

        const resolvedType: TransactionType =
          transactionType === "transfer"
            ? "transfer"
            : transactionType === "medaxil"
              ? "medaxil"
              : transactionType === "alis_iade"
                ? "alis_iade"
                : transactionType === "satis_iade"
                  ? "satis_iade"
                  : "mexaric";

        await onSubmit({
          type: resolvedType,
          amount: parsedAmount,
          description: description.trim() || undefined,
          paymentMethod,
          category: category.trim() || undefined,
          currency,
          counterpartyType: cType,
          counterpartyId: cId,
          counterpartyName: counterpartyName || undefined,
          targetBankId: transactionType === "transfer" ? Number(targetBankId) : undefined,
        });
      } else if (isEdit && onEditSubmit) {
        await onEditSubmit({
          description: description.trim() || undefined,
          paymentMethod,
          category: category.trim() || undefined,
          currency,
          counterpartyName: counterpartyName || undefined,
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex justify-end" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: visible ? 0.45 : 0 }}
        onClick={handleClose}
      />

      <div
        className="relative h-full w-full max-w-lg bg-card shadow-2xl flex flex-col transition-all duration-300 ease-in-out border-l border-border"
        style={{
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          transform: visible ? "translateX(0)" : "translateX(100%)",
          opacity: visible ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: isView
                  ? "rgba(39,194,55,0.15)"
                  : "rgba(231,188,15,0.15)",
                color: isView ? "#16a34a" : "#b8960c",
              }}
            >
              {isView ? <FiEye size={17} /> : isEdit ? <FiEdit2 size={17} /> : <FiDollarSign size={17} />}
            </div>
            <h2 className="text-base font-semibold text-foreground truncate m-0">{title}</h2>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-2xl leading-none transition-colors"
            onClick={handleClose}
            aria-label="Bağla"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-4">
            {error && (
              <div className="rounded-lg px-3.5 py-2.5 text-sm border border-[rgba(246,78,52,0.35)] bg-[rgba(246,78,52,0.12)] text-[var(--semantic-error)]">
                {error}
              </div>
            )}

            <label className="flex flex-col gap-1.5 min-w-0">
              <span className="text-sm font-medium text-muted-foreground">Satış / bank hesabı</span>
              {selectableSourceBank && isCreate ? (
                <Select
                  value={String(sourceBankId || "")}
                  options={sourceBankOptions}
                  onChange={(v) => onSourceBankChange?.(Number(v))}
                  placeholder="Bank seçin"
                  className={fieldClass}
                />
              ) : (
                <input
                  type="text"
                  disabled
                  value={sourceBankName || `Bank #${sourceBankId}`}
                  className={fieldClass}
                />
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 min-w-0">
                <span className="text-sm font-medium text-muted-foreground">Tip</span>
                <Select
                  value={transactionType}
                  options={typeOptions}
                  onChange={(v) => setTransactionType(v as TransactionType)}
                  disabled={isView || isEdit || lockCounterparty}
                  placeholder="Tip seçin"
                  className={fieldClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 min-w-0">
                <span className="text-sm font-medium text-muted-foreground">Ödəniş metodu</span>
                <Select
                  value={paymentMethod}
                  options={paymentOptions}
                  onChange={setPaymentMethod}
                  disabled={isView}
                  placeholder="Metod seçin"
                  className={fieldClass}
                />
              </label>
            </div>

            {transactionType === "transfer" && isCreate && (
              <label className="flex flex-col gap-1.5 min-w-0">
                <span className="text-sm font-medium text-muted-foreground">Hədəf Bank</span>
                <Select
                  value={targetBankId}
                  options={targetBankOptions}
                  onChange={setTargetBankId}
                  placeholder="-- Hədəf bank seçin --"
                  className={fieldClass}
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5 min-w-0">
              <span className="text-sm font-medium text-muted-foreground">Kateqoriya</span>
              <input
                type="text"
                disabled={isView}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Nəqliyyat, İcarə, s.m."
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 min-w-0">
              <span className="text-sm font-medium text-muted-foreground">Ad / Açıqlama</span>
              <input
                type="text"
                disabled={isView}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Əməliyyatın təsviri"
                className={fieldClass}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 min-w-0">
                <span className="text-sm font-medium text-muted-foreground">Məbləğ</span>
                <input
                  type="text"
                  disabled={isView}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={fieldClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 min-w-0">
                <span className="text-sm font-medium text-muted-foreground">Valyuta</span>
                <Select
                  value={currency}
                  options={currencyOptions}
                  onChange={setCurrency}
                  disabled={isView}
                  placeholder="Valyuta"
                  className={fieldClass}
                />
              </label>
            </div>

            {showDebtSummary ? (
              <div className="rounded-lg border border-border bg-secondary/50 px-3.5 py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Cari borc</span>
                  <span className="font-semibold text-destructive">
                    {formatMoney(Number(counterpartyDebt))} {currency}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Ödəniləcək</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(parsedPayAmount)} {currency}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Ödənişdən sonra qalan</span>
                  <span
                    className={`font-bold ${
                      remainingDebt > 0 ? "text-amber-500" : "text-success"
                    }`}
                  >
                    {formatMoney(remainingDebt)} {currency}
                  </span>
                </div>
                {parsedPayAmount > Number(counterpartyDebt) + 0.001 ? (
                  <p className="text-xs text-amber-500 m-0">
                    Ödəniş cari borcdan çoxdur (artıq {formatMoney(parsedPayAmount - Number(counterpartyDebt))} {currency}).
                  </p>
                ) : null}
              </div>
            ) : null}

            {transactionType !== "transfer" && (
              <label className="flex flex-col gap-1.5 min-w-0">
                <span className="text-sm font-medium text-muted-foreground">
                  {counterpartyLabel}
                  {loadingSuppliers ? "…" : ""}
                </span>
                <Select
                  value={counterpartyName}
                  options={
                    lockCounterparty
                      ? lockedCounterpartyOptions
                      : transactionType === "alis_iade"
                      ? [
                          { value: "", label: "-- Seçilməyib --" },
                          ...suppliers.map((s) => ({
                            value: s.name,
                            label: s.name,
                          })),
                        ]
                      : transactionType === "satis_iade"
                        ? [
                            { value: "", label: "-- Seçilməyib --" },
                            ...mockCustomers.map((c) => ({ value: c, label: c })),
                          ]
                        : counterpartyOptions
                  }
                  onChange={setCounterpartyName}
                  disabled={isView || lockCounterparty}
                  placeholder="-- Seçilməyib --"
                  className={fieldClass}
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0 bg-secondary/40">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors disabled:opacity-60"
            >
              {isView ? "Bağla" : "İmtina"}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg border-none bg-[#e7bc0f] text-white text-sm font-semibold hover:brightness-95 transition disabled:opacity-70"
              >
                {submitting ? "Saxlanılır..." : "Saxla"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
