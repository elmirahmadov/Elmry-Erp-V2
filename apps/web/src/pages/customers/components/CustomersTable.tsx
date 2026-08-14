import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import type { Customer } from "../types/customer.types";

interface CustomersTableProps {
  customers: Customer[];
  onRowClick: (customer: Customer) => void;
  onAddPayment: (customer: Customer) => void;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const customerDebt = (c: Customer) =>
  Number(c.totalSales || 0) -
  Number(c.totalReturn || 0) -
  Number(c.totalPayment || 0);

export default function CustomersTable({
  customers,
  onRowClick,
  onAddPayment,
}: CustomersTableProps) {
  return (
    <table className="min-w-max w-full border-collapse">
      <thead className="bg-secondary sticky top-0 z-10">
        <tr>
          <th className="w-16 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            ID
          </th>
          <th className="w-52 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Müştəri adı
          </th>
          <th className="w-44 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Əlaqədar şəxs
          </th>
          <th className="w-36 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Telefon
          </th>
          <th className="w-56 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            E-poçt
          </th>
          <th className="w-64 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Ünvan
          </th>
          <th className="w-40 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Vergi No
          </th>
          <th className="w-20 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Status
          </th>
          <th className="w-28 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Yaradılma
          </th>
          <th className="w-28 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Yenilənmə
          </th>
          <th className="w-32 px-3 py-2 text-xs font-semibold text-primary text-center whitespace-nowrap border-b border-border bg-primary/10">
            Alış (₼)
          </th>
          <th className="w-32 px-3 py-2 text-xs font-semibold text-warning text-center whitespace-nowrap border-b border-border bg-warning/10">
            İadə (₼)
          </th>
          <th className="w-32 px-3 py-2 text-xs font-semibold text-success text-center whitespace-nowrap border-b border-border bg-success/10">
            Ödəniş (₼)
          </th>
          <th className="w-32 px-3 py-2 text-xs font-semibold text-destructive text-center whitespace-nowrap border-b border-border bg-destructive/10">
            Borc (₼)
          </th>
          <th className="w-32 px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border">
            Əməliyyat
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border bg-card">
        {customers.map((customer) => {
          const debt = customerDebt(customer);
          return (
            <tr
              key={customer.id}
              onClick={() => onRowClick(customer)}
              className="hover:bg-accent cursor-pointer transition-colors"
            >
              <td className="w-16 px-3 py-2 text-center text-sm text-foreground whitespace-nowrap">
                {customer.id}
              </td>
              <td className="w-52 px-3 py-2 text-sm text-card-foreground font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[208px]">
                {customer.name}
              </td>
              <td className="w-44 px-3 py-2 text-sm text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[176px]">
                {customer.contactPerson || "-"}
              </td>
              <td className="w-36 px-3 py-2 text-sm text-foreground text-center whitespace-nowrap">
                {customer.phone || "-"}
              </td>
              <td className="w-56 px-3 py-2 text-sm text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[224px]">
                {customer.email || "-"}
              </td>
              <td className="w-64 px-3 py-2 text-sm text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[256px]">
                {customer.address || "-"}
              </td>
              <td className="w-40 px-3 py-2 text-sm text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                {customer.taxNumber || "-"}
              </td>
              <td className="w-20 px-3 py-2 text-center whitespace-nowrap">
                {customer.status === "active" ? (
                  <FaCheckCircle
                    className="text-green-500 text-lg inline-block align-middle"
                    title="Aktiv"
                  />
                ) : (
                  <FaTimesCircle
                    className="text-red-400 text-lg inline-block align-middle"
                    title="Passiv"
                  />
                )}
              </td>
              <td className="w-28 px-3 py-2 text-sm text-foreground text-center whitespace-nowrap">
                {formatDate(customer.createdAt)}
              </td>
              <td className="w-28 px-3 py-2 text-sm text-foreground text-center whitespace-nowrap">
                {formatDate(customer.updatedAt)}
              </td>
              <td className="w-32 px-3 py-2 text-sm font-medium text-primary text-center whitespace-nowrap bg-primary/10">
                {formatCurrency(customer.totalSales ?? 0)}
              </td>
              <td className="w-32 px-3 py-2 text-sm font-medium text-warning text-center whitespace-nowrap bg-warning/10">
                {formatCurrency(customer.totalReturn ?? 0)}
              </td>
              <td className="w-32 px-3 py-2 text-sm font-medium text-success text-center whitespace-nowrap bg-success/10">
                {formatCurrency(customer.totalPayment ?? 0)}
              </td>
              <td className="w-32 px-3 py-2 text-sm font-semibold text-center whitespace-nowrap bg-destructive/10">
                <span className={debt > 0 ? "text-destructive" : "text-muted-foreground"}>
                  {formatCurrency(debt)}
                </span>
              </td>
              <td
                className="w-32 px-3 py-2 text-center whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onAddPayment(customer)}
                  title="Ödəniş əlavə et"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                >
                  Ödəniş +
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
