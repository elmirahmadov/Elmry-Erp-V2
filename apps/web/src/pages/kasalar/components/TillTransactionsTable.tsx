import { useMemo } from "react";
import { type TillTransaction } from "../../../common/actions/tills.actions";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

interface TillTransactionsTableProps {
  transactions: TillTransaction[];
  tillName?: string;
  onView?: (tx: TillTransaction) => void;
  onEdit?: (tx: TillTransaction) => void;
  onDelete?: (tx: TillTransaction) => void;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.split("T")[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function getTipMeta(t: TillTransaction) {
  if (t.type === "medaxil") {
    return { tipText: "Mədaxil", tipColor: "#22c55e", tipBg: "rgba(39,194,55,0.15)" };
  }
  if (t.type === "alis_iade") {
    return { tipText: "Alış iadə", tipColor: "#22c55e", tipBg: "rgba(39,194,55,0.15)" };
  }
  if (t.type === "satis_iade") {
    return { tipText: "Satış iadə", tipColor: "#f59e0b", tipBg: "rgba(245,158,11,0.15)" };
  }
  if (t.counterpartyType === "till") {
    return { tipText: "Transfer", tipColor: "#e7bc0f", tipBg: "rgba(231,188,15,0.15)" };
  }
  return { tipText: "Xərc", tipColor: "#ef4444", tipBg: "rgba(246,78,52,0.15)" };
}

export default function TillTransactionsTable({
  transactions,
  tillName,
  onView,
  onEdit,
  onDelete,
}: TillTransactionsTableProps) {
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        const val = t.amount;
        if (t.type === "medaxil" || t.type === "alis_iade") acc.medaxil += val;
        else if (
          t.type === "mexaric" ||
          t.type === "gider" ||
          t.type === "satis_iade"
        ) {
          acc.mexaric += val;
        }
        return acc;
      },
      { medaxil: 0, mexaric: 0 },
    );
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
        Hələ heç bir maliyyə əməliyyatı qeydə alınmayıb.
      </div>
    );
  }

  const headers = [
    "ID",
    "TİP",
    "METOD",
    "MƏBLƏĞ",
    "KATEQORİYA",
    "AÇIQLAMA",
    "KASSA",
    "HESAB",
    "TARİX",
    "ƏMƏLİYYATLAR",
  ];

  return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderBottom: "1.5px solid hsl(var(--border))", background: "hsl(var(--background))", padding: "12px 16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Mədaxil</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#16a34a", marginTop: 2 }}>+{totals.medaxil.toFixed(2)} AZN</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Xərc / Məxaric</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--semantic-error)", marginTop: 2 }}>-{totals.mexaric.toFixed(2)} AZN</div>
        </div>
      </div>

      <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
        <table style={{ minWidth: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "inherit" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "hsl(var(--background))", borderBottom: "2px solid hsl(var(--border))" }}>
            <tr>
              {headers.map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const { tipText, tipColor, tipBg } = getTipMeta(t);
              const displayAmount = `${t.amount.toFixed(2)} ${t.currency || "AZN"}`;

              return (
                <tr
                  key={t.id}
                  style={{ borderBottom: "1px solid hsl(var(--border))", cursor: "pointer", transition: "background 0.15s" }}
                  onClick={() => onView && onView(t)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--accent))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "12px 16px", color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>#{t.id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", background: tipBg, color: tipColor }}>
                      {tipText}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "hsl(var(--muted-foreground))" }}>{t.paymentMethod || "—"}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "700", color: "hsl(var(--foreground))" }}>{displayAmount}</td>
                  <td style={{ padding: "12px 16px", color: "hsl(var(--foreground))" }}>{t.category || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "hsl(var(--foreground))", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={t.description || ""}>
                    {t.description || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "hsl(var(--foreground))", fontWeight: 600 }}>{tillName || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "hsl(var(--foreground))" }}>{t.counterpartyName || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "hsl(var(--muted-foreground))" }}>{formatDate(t.createdAt)}</td>
                  <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {onView && (
                        <button
                          onClick={() => onView(t)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "30px", height: "30px", borderRadius: "6px", border: "none",
                            background: "#f0fdf4", color: "#16a34a", cursor: "pointer",
                          }}
                          title="Bax"
                        >
                          <FiEye size={14} />
                        </button>
                      )}
                      {onEdit && t.counterpartyType !== "till" && (
                        <button
                          onClick={() => onEdit(t)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "32px", height: "32px", borderRadius: "6px", border: "none",
                            background: "#eff6ff", color: "#e7bc0f", cursor: "pointer",
                          }}
                          title="Düzənlə"
                        >
                          <FiEdit2 size={15} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm("Bu əməliyyatı silmək istədiyinizdən əminsiniz? Bu kassa balansını da geri qaytaracaq.")) {
                              onDelete(t);
                            }
                          }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "32px", height: "32px", borderRadius: "6px", border: "none",
                            background: "rgba(246,78,52,0.12)", color: "#ef4444", cursor: "pointer",
                          }}
                          title="Sil"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
