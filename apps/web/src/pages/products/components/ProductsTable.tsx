import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import type { AuthBranch } from "../../../common/actions/auth.actions";
import type { Product } from "../types/product.types";

interface ProductsTableProps {
  products: Product[];
  branches: AuthBranch[];
  onRowClick: (product: Product) => void;
  getProductCategoryLevels: (product: Product) => string[];
  formatPrice: (value?: number | null) => string;
  formatStock: (value?: number | null) => string;
  formatStockUnit: (value?: string | null) => string;
}

const cellBase = "px-3 py-2 text-sm text-center whitespace-nowrap";
const thBase =
  "px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border";

export default function ProductsTable({
  products,
  branches,
  onRowClick,
  getProductCategoryLevels,
  formatPrice,
  formatStock,
  formatStockUnit,
}: ProductsTableProps) {
  const getBranchStock = (product: Product, branchId: number) => {
    const fromStocks = product.branchStocks?.find(
      (item) => item.branchId === branchId,
    )?.quantity;
    if (fromStocks !== undefined) return fromStocks;

    // Fallback when warehouse stocks are empty but denormalized field exists
    if (
      branches.length === 1 &&
      branches[0]?.id === branchId &&
      (product.branchStockQuantity != null || product.stockQuantity != null)
    ) {
      return product.branchStockQuantity ?? product.stockQuantity ?? 0;
    }

    return 0;
  };

  return (
    <table className="min-w-max w-full border-collapse">
      <thead className="bg-secondary sticky top-0 z-10">
        <tr>
          <th className={`${thBase} w-16`}>ID</th>
          <th className={`${thBase} w-24`}>Ürün Resmi</th>
          <th className={`${thBase} w-52`}>Ürün Adı</th>
          <th className={`${thBase} w-32`}>Alış</th>
          <th className={`${thBase} w-32`}>Satış</th>
          <th className={`${thBase} w-36`}>Barkod</th>
          {branches.map((branch) => (
            <th key={branch.id} className={`${thBase} w-36`} title={branch.name}>
              {branch.name}
            </th>
          ))}
          <th className={`${thBase} w-32`}>Şirket Stoku</th>
          <th className={`${thBase} w-28`}>Stok Türü</th>
          <th className={`${thBase} w-40`}>Ana Kategori</th>
          <th className={`${thBase} w-40`}>Alt Kategori 1</th>
          <th className={`${thBase} w-40`}>Alt Kategori 2</th>
          <th className={`${thBase} w-40`}>Alt Kategori 3</th>
          <th className={`${thBase} w-20`}>Durum</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border bg-card">
        {products.map((product) => {
          const levels = getProductCategoryLevels(product);
          const purchase = product.purchasePrice ?? 0;
          const sale = product.salePrice ?? 0;
          const isLoss = sale < purchase;
          const tone = isLoss ? "text-destructive" : "text-foreground";

          return (
            <tr
              key={product.id}
              onClick={() => onRowClick(product)}
              className={`cursor-pointer transition-colors ${
                isLoss
                  ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                  : "hover:bg-accent"
              }`}
            >
              <td className={`${cellBase} w-16 ${tone}`}>{product.id}</td>
              <td className={`${cellBase} w-24`}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="inline-block h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td
                className={`${cellBase} w-52 max-w-[208px] overflow-hidden text-ellipsis text-left font-medium ${
                  isLoss ? "text-destructive" : "text-card-foreground"
                }`}
              >
                {product.name}
              </td>
              <td
                className={`${cellBase} w-32 font-semibold ${
                  isLoss ? "text-destructive" : "text-green-700"
                }`}
              >
                {formatPrice(product.purchasePrice)}
              </td>
              <td
                className={`${cellBase} w-32 font-semibold ${
                  isLoss ? "text-destructive" : "text-primary"
                }`}
              >
                {formatPrice(product.salePrice)}
              </td>
              <td className={`${cellBase} w-36 ${tone}`}>{product.barcode}</td>
              {branches.map((branch) => (
                <td key={branch.id} className={`${cellBase} w-36 ${tone}`}>
                  {formatStock(getBranchStock(product, branch.id))}
                </td>
              ))}
              <td className={`${cellBase} w-32 ${tone}`}>
                {formatStock(
                  product.companyStockQuantity ?? product.stockQuantity,
                )}
              </td>
              <td className={`${cellBase} w-28 ${tone}`}>
                {formatStockUnit(product.stockUnit)}
              </td>
              <td
                className={`${cellBase} w-40 max-w-[160px] overflow-hidden text-ellipsis ${tone}`}
              >
                {levels[0]}
              </td>
              <td
                className={`${cellBase} w-40 max-w-[160px] overflow-hidden text-ellipsis ${tone}`}
              >
                {levels[1]}
              </td>
              <td
                className={`${cellBase} w-40 max-w-[160px] overflow-hidden text-ellipsis ${tone}`}
              >
                {levels[2]}
              </td>
              <td
                className={`${cellBase} w-40 max-w-[160px] overflow-hidden text-ellipsis ${tone}`}
              >
                {levels[3]}
              </td>
              <td className={`${cellBase} w-20`}>
                {product.isActive ? (
                  <FaCheckCircle
                    className={`inline-block align-middle text-lg ${
                      isLoss ? "text-destructive" : "text-green-500"
                    }`}
                    title="Aktif"
                    aria-label="Aktif"
                  />
                ) : (
                  <FaTimesCircle
                    className="inline-block align-middle text-lg text-red-400"
                    title="Pasif"
                    aria-label="Pasif"
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
