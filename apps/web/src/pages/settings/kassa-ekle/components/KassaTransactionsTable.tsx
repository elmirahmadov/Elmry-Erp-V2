import { useMemo } from "react";

interface Transaction {
  id: number;
  type: "giriş" | "çıkış" | "gider";
  amount: number;
  description: string;
  createdAt: string;
}

interface KassaTransactionsTableProps {
  transactions: Transaction[];
}

export default function KassaTransactionsTable({
  transactions,
}: KassaTransactionsTableProps) {
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "giriş") acc.entrance += t.amount;
        if (t.type === "çıkış") acc.exit += t.amount;
        if (t.type === "gider") acc.expense += t.amount;
        return acc;
      },
      { entrance: 0, exit: 0, expense: 0 },
    );
  }, [transactions]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "giriş":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            ➕ Giriş
          </span>
        );
      case "çıkış":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            ➖ Çıkış
          </span>
        );
      case "gider":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            📋 Gider
          </span>
        );
      default:
        return null;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "giriş":
        return "text-green-700 font-bold";
      case "çıkış":
        return "text-red-700 font-bold";
      case "gider":
        return "text-orange-700 font-bold";
      default:
        return "";
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-muted-foreground text-sm">
          Henüz işlem kaydı bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-4 p-5 bg-secondary border-b border-border">
        <div className="text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">Giriş</div>
          <div className="text-xl font-bold text-green-700">
            +{totals.entrance.toFixed(2)} ₺
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">Çıkış</div>
          <div className="text-xl font-bold text-red-700">
            -{totals.exit.toFixed(2)} ₺
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">Gider</div>
          <div className="text-xl font-bold text-orange-700">
            -{totals.expense.toFixed(2)} ₺
          </div>
        </div>
      </div>

      {/* Tablo */}
      <table className="min-w-full">
        <thead className="bg-secondary sticky top-0 z-10 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground whitespace-nowrap">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground whitespace-nowrap">
              Tür
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground whitespace-nowrap">
              Tutar
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">
              Açıklama
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground whitespace-nowrap">
              Tarih/Saat
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((transaction, index) => (
            <tr
              key={transaction.id}
              className="hover:bg-accent transition-colors"
            >
              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {index + 1}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getTypeBadge(transaction.type)}
              </td>
              <td
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${getAmountColor(transaction.type)}`}
              >
                {transaction.type === "giriş" ? "+" : "-"}
                {transaction.amount.toFixed(2)} ₺
              </td>
              <td className="px-4 py-3 text-sm text-foreground max-w-xs">
                <span className="block truncate">
                  {transaction.description}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {transaction.createdAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
