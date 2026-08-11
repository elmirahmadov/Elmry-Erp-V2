import { FormEvent, useEffect, useState } from "react";
import { type Till, type TillTransaction } from "../../../common/actions/tills.actions";
import { type Supplier } from "../../suppliers/types/supplier.types";
import { fetchSuppliers } from "../../../common/actions/suppliers.actions";
import { useAuth } from "../../../common/contexts/AuthContext";
import { FiEye, FiEdit2, FiDollarSign } from "react-icons/fi";

type TransactionType = "medaxil" | "mexaric" | "gider" | "transfer";
type CounterpartyType = "supplier" | "customer";
type TransferTillOption = Till & { branchName?: string };

interface TillTransactionModalProps {
  isOpen: boolean;
  mode?: "create" | "edit" | "view";
  initialData?: TillTransaction | null;
  tillBalance: number;
  sourceTillId: number;
  availableTills: TransferTillOption[];
  onClose: () => void;
  onSubmit: (payload: {
    type: TransactionType;
    amount: number;
    description?: string;
    counterpartyType?: CounterpartyType;
    counterpartyId?: number;
    counterpartyName?: string;
    targetTillId?: number;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
    carrierName?: string;
    orderNumber?: string;
  }) => Promise<void>;
  onEditSubmit?: (payload: {
    description?: string;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
    carrierName?: string;
    orderNumber?: string;
  }) => Promise<void>;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1.5px solid hsl(var(--border))",
  fontSize: "14px",
  color: "hsl(var(--foreground))",
  background: "hsl(var(--input))",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  color: "hsl(var(--muted-foreground))",
  marginBottom: "6px",
};

const mockCarriers = [
  "14",
  "20",
  "Logistra Logistics",
  "Baku Cargo Express",
  "Silk Way Carrier",
];

const mockCustomers = [
  "Müştəri #1",
  "Müştəri #2",
  "Rahim Məmmədov",
  "Aysel Həsənova",
  "Elçin Əliyev",
];

export default function TillTransactionModal({
  isOpen,
  mode = "create",
  initialData,
  tillBalance,
  sourceTillId,
  availableTills,
  onClose,
  onSubmit,
  onEditSubmit,
}: TillTransactionModalProps) {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [transactionType, setTransactionType] = useState<TransactionType>("medaxil");
  const [paymentMethod, setPaymentMethod] = useState("Bank");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AZN");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [targetTillId, setTargetTillId] = useState<number | "">("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferTargets = availableTills.filter((t) => t.id !== sourceTillId);

  useEffect(() => {
    if (!isOpen) {
      setTransactionType("medaxil");
      setPaymentMethod("Bank");
      setCategory("");
      setDescription("");
      setAmount("");
      setCurrency("AZN");
      setCounterpartyName("");
      setCarrierName("");
      setOrderNumber("");
      setTargetTillId("");
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
      setCarrierName(initialData.carrierName ?? "");
      setOrderNumber(initialData.orderNumber ?? "");
    }
  }, [isOpen, isEdit, isView, initialData]);

  useEffect(() => {
    if (!isOpen || !companyId || !isCreate) return;
    setLoadingSuppliers(true);
    fetchSuppliers(companyId)
      .then(setSuppliers)
      .catch(() => setSuppliers([]))
      .finally(() => setLoadingSuppliers(false));
  }, [isOpen, companyId, isCreate]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Zəhmət olmasa düzgün məbləğ daxil edin.");
      return;
    }

    if (transactionType === "transfer" && !targetTillId) {
      setError("Hədəf kassanı seçin.");
      return;
    }

    if (
      (transactionType === "mexaric" || transactionType === "transfer" || transactionType === "gider") &&
      parsedAmount > tillBalance &&
      currency === "AZN" // simple check for base balance limits
    ) {
      setError(`Kassa balansı yetərsizdir. Mövcud: ${tillBalance.toFixed(2)} AZN`);
      return;
    }

    setSubmitting(true);
    try {
      if (isCreate) {
        // determine if counterpartyType is supplier or customer based on name matching mock or suppliers
        let cType: CounterpartyType | undefined = undefined;
        let cId: number | undefined = undefined;

        if (counterpartyName) {
          const matchedSupplier = suppliers.find(s => s.name === counterpartyName);
          if (matchedSupplier) {
            cType = "supplier";
            cId = matchedSupplier.id;
          } else {
            cType = "customer";
          }
        }

        await onSubmit({
          type: transactionType === "transfer" ? "transfer" : (transactionType === "medaxil" ? "medaxil" : "mexaric"),
          amount: parsedAmount,
          description: description.trim() || undefined,
          paymentMethod,
          category: category.trim() || undefined,
          currency,
          counterpartyType: cType,
          counterpartyId: cId,
          counterpartyName: counterpartyName || undefined,
          carrierName: carrierName || undefined,
          orderNumber: orderNumber.trim() || undefined,
          targetTillId: transactionType === "transfer" ? Number(targetTillId) : undefined,
        });
      } else if (isEdit && onEditSubmit) {
        await onEditSubmit({
          description: description.trim() || undefined,
          paymentMethod,
          category: category.trim() || undefined,
          currency,
          counterpartyName: counterpartyName || undefined,
          carrierName: carrierName || undefined,
          orderNumber: orderNumber.trim() || undefined,
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: "550px", margin: "0 16px", background: "hsl(var(--card))", borderRadius: "16px", boxShadow: "0 15px 45px rgba(0, 0, 0, 0.15)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: isView ? "rgba(39,194,55,0.15)" : isEdit ? "rgba(231,188,15,0.15)" : "rgba(231,188,15,0.1)", color: isView ? "#16a34a" : isEdit ? "#b8960c" : "#8a7009" }}>
              {isView ? <FiEye size={17} /> : isEdit ? <FiEdit2 size={17} /> : <FiDollarSign size={17} />}
            </div>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "hsl(var(--foreground))" }}>
              {isView ? "Əməliyyat Təfərrüatları" : isEdit ? "Əməliyyatı Düzənlə" : "Yeni Maliyyə Əməliyyatı"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "hsl(var(--muted-foreground))", fontSize: "24px", cursor: "pointer", lineHeight: 1, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", flex: 1 }}>
          
          {error && (
            <div style={{ background: "rgba(246,78,52,0.12)", border: "1px solid rgba(246,78,52,0.35)", borderRadius: "8px", padding: "10px 14px", color: "var(--semantic-error)", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {/* Row 1: Tip & Ödəniş Metodu */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Tip</label>
              <select disabled={isView} value={transactionType} onChange={(e) => setTransactionType(e.target.value as TransactionType)} style={inputStyle}>
                <option value="medaxil">Mədaxil (Gəlir)</option>
                <option value="mexaric">Xərc (Ödəniş edilib)</option>
                <option value="transfer">Kassa Transferi</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ödəniş metodu</label>
              <select disabled={isView} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
                <option value="Bank">Bank</option>
                <option value="Nağd">Nağd</option>
                <option value="Kart">Kart</option>
                <option value="Digər">Digər</option>
              </select>
            </div>
          </div>

          {/* Target Till for transfer */}
          {transactionType === "transfer" && isCreate && (
            <div>
              <label style={labelStyle}>Hədəf Kassa</label>
              <select value={targetTillId} onChange={(e) => setTargetTillId(e.target.value ? Number(e.target.value) : "")} style={inputStyle}>
                <option value="">-- Hədəf kassa seçin --</option>
                {transferTargets.map((t) => (
                  <option key={t.id} value={t.id}>{t.branchName ? `${t.branchName} / ` : ""}{t.name} ({t.balance.toFixed(2)} AZN)</option>
                ))}
              </select>
            </div>
          )}

          {/* Row 2: Kateqoriya */}
          <div>
            <label style={labelStyle}>Kateqoriya (Məs: Nəqliyyat, Əməkhaqqı, Avans)</label>
            <input type="text" disabled={isView} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Nəqliyyat, İcarə, s.m." style={inputStyle} />
          </div>

          {/* Row 3: Ad / Açıqlama */}
          <div>
            <label style={labelStyle}>Ad / Açıqlama</label>
            <input type="text" disabled={isView} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Əməliyyatın təsviri" style={inputStyle} />
          </div>

          {/* Row 4: Məbləğ & Valyuta */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Məbləğ</label>
              <input type="text" disabled={isView} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Valyuta</label>
              <select disabled={isView} value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
                <option value="AZN">AZN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Row 5: Müştəri ilə əlaqələndir */}
          {transactionType !== "transfer" && (
            <div>
              <label style={labelStyle}>Müştəri ilə əlaqələndir</label>
              <select disabled={isView} value={counterpartyName} onChange={(e) => setCounterpartyName(e.target.value)} style={inputStyle}>
                <option value="">-- Seçilməyib --</option>
                {mockCustomers.map(c => <option key={c} value={c}>{c}</option>)}
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} (Tədarikçi)</option>)}
              </select>
            </div>
          )}

          {/* Row 6: Daşıyıcı ilə əlaqələndir */}
          {transactionType !== "transfer" && (
            <div>
              <label style={labelStyle}>Daşıyıcı ilə əlaqələndir</label>
              <select disabled={isView} value={carrierName} onChange={(e) => setCarrierName(e.target.value)} style={inputStyle}>
                <option value="">-- Seçilməyib --</option>
                {mockCarriers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Row 7: Sifariş nömrəsi (İstəyə bağlı) */}
          <div>
            <label style={labelStyle}>Sifariş nömrəsi (İstəyə bağlı)</label>
            <input type="text" disabled={isView} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Sifariş ID və ya nömrəsi" style={inputStyle} />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 18px", borderRadius: "8px", border: "1.5px solid #dcdfe6", background: "hsl(var(--card))", color: "#60748b", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              {isView ? "Bağla" : "İmtina"}
            </button>
            {!isView && (
              <button type="submit" disabled={submitting} style={{ padding: "10px 22px", borderRadius: "8px", border: "none", background: "#e7bc0f", color: "#ffffff", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 10px rgba(59, 130, 246, 0.2)", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Saxlanılır..." : "Saxla"}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
