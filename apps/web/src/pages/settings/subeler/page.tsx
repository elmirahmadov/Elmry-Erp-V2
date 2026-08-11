import { useEffect, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import Loading from "../../../common/components/loading/Loading";
import {
  fetchBranchDetail,
  fetchBranches,
  fetchWarehousesByCompany,
  setBranchTills,
  setBranchUsers,
  setBranchWarehouses,
  type Branch,
  type BranchDetail,
  type Warehouse,
} from "../../../common/actions/branch.actions";
import { fetchTills, type Till } from "../../../common/actions/tills.actions";
import {
  fetchUsersByCompany,
  type CompanyUser,
} from "../../../common/actions/users.actions";

export default function SubelerPage() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [detail, setDetail] = useState<BranchDetail | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [tills, setTills] = useState<Till[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);

  const [warehouseIds, setWarehouseIds] = useState<number[]>([]);
  const [tillIds, setTillIds] = useState<number[]>([]);
  const [userIds, setUserIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBase = async (cid: number) => {
    setLoading(true);
    setError(null);
    try {
      const [branchList, warehouseList, tillList, userList] = await Promise.all(
        [
          fetchBranches(cid),
          fetchWarehousesByCompany(cid),
          fetchTills(cid),
          fetchUsersByCompany(cid),
        ],
      );
      setBranches(branchList);
      setWarehouses(warehouseList);
      setTills(tillList);
      setUsers(userList);
      setSelectedBranchId((prev) => prev ?? branchList[0]?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (branchId: number, cid: number) => {
    setLoading(true);
    setError(null);
    try {
      const branchDetail = await fetchBranchDetail(branchId, cid);
      setDetail(branchDetail);
      setWarehouseIds(branchDetail.warehouseIds || []);
      setTillIds(branchDetail.tillIds || []);
      setUserIds(branchDetail.userIds || []);
    } catch (e) {
      setError((e as Error).message);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    void loadBase(companyId);
  }, [companyId]);

  useEffect(() => {
    if (!companyId || !selectedBranchId) return;
    void loadDetail(selectedBranchId, companyId);
  }, [companyId, selectedBranchId]);

  const toggleId = (
    list: number[],
    setList: (next: number[]) => void,
    id: number,
  ) => {
    setList(
      list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
    );
  };

  const onSaveAssignments = async () => {
    if (!companyId || !selectedBranchId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setBranchWarehouses(selectedBranchId, companyId, warehouseIds);
      await setBranchTills(selectedBranchId, companyId, tillIds);
      const updated = await setBranchUsers(
        selectedBranchId,
        companyId,
        userIds,
      );
      setDetail(updated);
      setWarehouseIds(updated.warehouseIds || []);
      setTillIds(updated.tillIds || []);
      setUserIds(updated.userIds || []);
      setSuccess("Sube atamalari kaydedildi.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - var(--header-height))" }}
    >
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <h1 className="text-base font-semibold text-foreground">Subeler</h1>
        <p className="text-xs text-muted-foreground">
          Secilen subede hangi kasa, anbar ve kullanicilarin gorunecegini
          ayarlayin. Sirket / sube / anbar / kassa acmak icin Admin Panel
          kullanin.
        </p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-2 text-sm text-success">{success}</p>}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-4 lg:grid-cols-[260px_1fr]">
        <div className="space-y-3 border border-border bg-card p-3">
          <div className="space-y-1">
            {branches.length === 0 ? (
              <p className="px-1 py-2 text-sm text-muted-foreground">
                Henuz sube yok.
              </p>
            ) : (
              branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`w-full px-3 py-2 text-left text-sm ${
                    selectedBranchId === branch.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-accent"
                  }`}
                >
                  {branch.name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="border border-border bg-card p-4">
          {loading && !detail ? (
            <div className="flex h-52 items-center justify-center">
              <Loading />
            </div>
          ) : !selectedBranchId ? (
            <p className="text-sm text-muted-foreground">Sube secin.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-sm font-semibold">
                  {detail?.name || "Sube"} — Anbarlar
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {warehouses.map((warehouse) => (
                    <label
                      key={warehouse.id}
                      className="flex items-center gap-2 border border-border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={warehouseIds.includes(warehouse.id)}
                        onChange={() =>
                          toggleId(warehouseIds, setWarehouseIds, warehouse.id)
                        }
                      />
                      {warehouse.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold">Kasalar</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tills.map((till) => (
                    <label
                      key={till.id}
                      className="flex items-center gap-2 border border-border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={tillIds.includes(till.id)}
                        onChange={() => toggleId(tillIds, setTillIds, till.id)}
                      />
                      {till.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold">Kullanicilar</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {users.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 border border-border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={userIds.includes(item.id)}
                        onChange={() => toggleId(userIds, setUserIds, item.id)}
                      />
                      {item.name || item.email}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => void onSaveAssignments()}
                disabled={saving}
                className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Atamalari Kaydet"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
