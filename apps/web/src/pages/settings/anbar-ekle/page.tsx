import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import Loading from "../../../common/components/loading/Loading";
import {
  createWarehouse,
  fetchWarehousesByCompany,
  type Warehouse,
} from "../../../common/actions/branch.actions";
import AnbarCreateModal from "./components/AnbarCreateModal";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
};

export default function AnbarEklePage() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [warehouseName, setWarehouseName] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => !!companyId && warehouseName.trim().length > 0,
    [companyId, warehouseName],
  );

  const loadWarehouses = async (cid: number) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchWarehousesByCompany(cid);
      setWarehouses(list);
    } catch (e) {
      setError((e as Error).message);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) {
      setWarehouses([]);
      return;
    }
    void loadWarehouses(companyId);
  }, [companyId]);

  const openCreateModal = () => {
    setWarehouseName("");
    setCreateError(null);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (submitting) return;
    setCreateModalOpen(false);
    setWarehouseName("");
    setCreateError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !companyId) return;

    setSubmitting(true);
    setCreateError(null);
    setError(null);
    setSuccess(null);

    try {
      const created = await createWarehouse(warehouseName.trim(), companyId);
      setWarehouseName("");
      setSuccess("Anbar basariyla eklendi. Sube atamasini Subeler ayarindan yapin.");
      setWarehouses((prev) => [created, ...prev]);
      setCreateModalOpen(false);
    } catch (e) {
      setCreateError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - var(--header-height))" }}
    >
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">Anbarlar</h1>
            <p className="text-xs text-muted-foreground">
              Anbarlar sirkete bagli olusturulur; hangi subelerde gorunecegi
              Subeler ayarindan secilir.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={!companyId}
            className="bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90 disabled:opacity-50"
          >
            + Anbar Ekle
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-2 text-sm text-success">{success}</p>}
        {!companyId && (
          <p className="mt-2 text-sm text-muted-foreground">
            Once Giris Yapmalisiniz.
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto bg-card">
        {loading ? (
          <div className="flex h-full min-h-52 items-center justify-center">
            <Loading />
          </div>
        ) : warehouses.length === 0 ? (
          <div className="flex h-full min-h-52 items-center justify-center text-sm text-muted-foreground">
            Henuz anbar eklenmemis.
          </div>
        ) : (
          <table className="w-full min-w-[720px] table-fixed border-collapse">
            <thead className="sticky top-0 z-10 bg-secondary">
              <tr>
                <th className="w-16 border-b border-border px-3 py-2 text-center text-xs font-semibold text-foreground">
                  ID
                </th>
                <th className="w-64 border-b border-border px-3 py-2 text-left text-xs font-semibold text-foreground">
                  Anbar Adi
                </th>
                <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold text-foreground">
                  Bagli Subeler
                </th>
                <th className="w-32 border-b border-border px-3 py-2 text-center text-xs font-semibold text-foreground">
                  Olusturma
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {warehouses.map((warehouse) => (
                <tr
                  key={warehouse.id}
                  className="transition-colors hover:bg-accent"
                >
                  <td className="w-16 px-3 py-2 text-center text-sm text-foreground">
                    {warehouse.id}
                  </td>
                  <td className="w-64 px-3 py-2 text-sm font-medium text-card-foreground">
                    {warehouse.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">
                    {warehouse.branches?.length
                      ? warehouse.branches
                          .map((link) => link.branch.name)
                          .join(", ")
                      : "Atanmamis"}
                  </td>
                  <td className="w-32 px-3 py-2 text-center text-sm text-foreground">
                    {formatDate(warehouse.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnbarCreateModal
        isOpen={createModalOpen}
        warehouseName={warehouseName}
        submitting={submitting}
        error={createError}
        onWarehouseNameChange={setWarehouseName}
        onClose={closeCreateModal}
        onSubmit={onSubmit}
      />
    </div>
  );
}
