import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import Loading from "../../../common/components/loading/Loading";
import {
  createTill,
  fetchTills,
  updateTill,
  deleteTill,
  type Till,
} from "../../../common/actions/tills.actions";
import { FaEdit, FaTrash } from "react-icons/fa";
import KassaCreateModal from "./components/KassaCreateModal";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("az-AZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
};

export default function KassaEklePage() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [tillName, setTillName] = useState("");
  const [tills, setTills] = useState<Till[]>([]);

  const [loadingTills, setLoadingTills] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTillForEdit, setSelectedTillForEdit] = useState<Till | null>(
    null,
  );
  const [editTillName, setEditTillName] = useState("");
  const [editTillStatus, setEditTillStatus] = useState<"active" | "inactive">(
    "active",
  );
  const [updatingTill, setUpdatingTill] = useState(false);

  const [deleteConfirmTillId, setDeleteConfirmTillId] = useState<number | null>(
    null,
  );
  const [deletingTillId, setDeletingTillId] = useState<number | null>(null);

  const canSubmit = useMemo(() => {
    return !!companyId && tillName.trim().length > 0;
  }, [companyId, tillName]);

  const loadTills = async (cid: number) => {
    setLoadingTills(true);
    setError(null);
    try {
      const list = await fetchTills(cid);
      setTills(list);
    } catch (e) {
      setError((e as Error).message);
      setTills([]);
    } finally {
      setLoadingTills(false);
    }
  };

  useEffect(() => {
    if (!companyId) {
      setTills([]);
      return;
    }
    void loadTills(companyId);
  }, [companyId]);

  const openCreateModal = () => {
    setTillName("");
    setCreateError(null);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (submitting) return;
    setCreateModalOpen(false);
    setTillName("");
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
      const createdTill = await createTill(tillName.trim(), companyId);
      setTillName("");
      setSuccess(
        "Kassa basariyla eklendi. Sube atamasini Subeler ayarindan yapin.",
      );
      setTills((prev) => [createdTill, ...prev]);
      setCreateModalOpen(false);
    } catch (e) {
      setCreateError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTillForEdit || !companyId || !editTillName.trim()) return;
    setUpdatingTill(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateTill(selectedTillForEdit.id, companyId, {
        name: editTillName.trim(),
        status: editTillStatus,
      });
      setTills((prev) =>
        prev.map((till) => (till.id === updated.id ? updated : till)),
      );
      setSuccess("Kassa basariyla guncellendi.");
      setEditModalOpen(false);
      setSelectedTillForEdit(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdatingTill(false);
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    if (!companyId) return;
    setDeletingTillId(id);
    setError(null);
    setSuccess(null);
    try {
      await deleteTill(id, companyId);
      setTills((prev) => prev.filter((till) => till.id !== id));
      setSuccess("Kassa basariyla silindi.");
      setDeleteConfirmTillId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingTillId(null);
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
            <h1 className="text-base font-semibold text-foreground">Kasalar</h1>
            <p className="text-xs text-muted-foreground">
              Kasalar sirkete bagli olusturulur; hangi subelerde gorunecegi
              Subeler ayarindan secilir.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={!companyId}
            className="rounded bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90 disabled:opacity-50"
          >
            + Kassa Ekle
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
        {loadingTills ? (
          <div className="flex h-full min-h-52 items-center justify-center">
            <Loading />
          </div>
        ) : tills.length === 0 ? (
          <div className="flex h-full min-h-52 items-center justify-center text-sm text-muted-foreground">
            Henuz kassa eklenmemis.
          </div>
        ) : (
          <table className="w-full min-w-max border-collapse">
            <thead className="sticky top-0 z-10 bg-secondary">
              <tr>
                <th className="w-16 whitespace-nowrap border-b border-border px-3 py-2 text-center text-xs font-semibold text-foreground">
                  ID
                </th>
                <th className="w-64 whitespace-nowrap border-b border-border px-3 py-2 text-left text-xs font-semibold text-foreground">
                  Kassa Adi
                </th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left text-xs font-semibold text-foreground">
                  Bagli Subeler
                </th>
                <th className="w-32 whitespace-nowrap border-b border-border px-3 py-2 text-center text-xs font-semibold text-foreground">
                  Durum
                </th>
                <th className="w-40 whitespace-nowrap border-b border-border bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary">
                  Bakiye
                </th>
                <th className="w-32 whitespace-nowrap border-b border-border px-3 py-2 text-center text-xs font-semibold text-foreground">
                  Islemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {tills.map((till) => (
                <tr key={till.id} className="transition-colors hover:bg-accent">
                  <td className="w-16 whitespace-nowrap px-3 py-2 text-center text-sm text-foreground">
                    {till.id}
                  </td>
                  <td className="w-64 px-3 py-2 text-sm font-medium text-card-foreground">
                    {till.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">
                    {till.branches?.length
                      ? till.branches.map((link) => link.branch.name).join(", ")
                      : "Atanmamis"}
                  </td>
                  <td className="w-32 whitespace-nowrap px-3 py-2 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        till.status === "active"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {till.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="w-40 whitespace-nowrap bg-primary/10 px-3 py-2 text-center text-sm font-semibold text-primary">
                    {formatCurrency(till.balance)} AZN
                  </td>
                  <td className="w-32 whitespace-nowrap px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTillForEdit(till);
                          setEditTillName(till.name);
                          setEditTillStatus(till.status);
                          setEditModalOpen(true);
                        }}
                        className="p-1 text-primary transition-colors hover:text-primary"
                        title="Duzenle"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTillId(till.id)}
                        className="p-1 text-destructive transition-colors hover:text-destructive"
                        title="Sil"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <KassaCreateModal
        isOpen={createModalOpen}
        tillName={tillName}
        submitting={submitting}
        error={createError}
        onTillNameChange={setTillName}
        onClose={closeCreateModal}
        onSubmit={onSubmit}
      />

      {editModalOpen && selectedTillForEdit && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Kassa Duzenle
              </h2>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-xl font-bold text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Kassa Adi
                </label>
                <input
                  type="text"
                  value={editTillName}
                  onChange={(e) => setEditTillName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Durum
                </label>
                <select
                  value={editTillStatus}
                  onChange={(e) =>
                    setEditTillStatus(e.target.value as "active" | "inactive")
                  }
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-medium"
                >
                  Iptal
                </button>
                <button
                  type="submit"
                  disabled={updatingTill}
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {updatingTill ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmTillId !== null && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmTillId(null)}
          />
          <div className="relative mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-bold text-foreground">
              Kassayi Sil
            </h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Bu kassayi silmek istediginizden emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTillId(null)}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium"
              >
                Vazgec
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleteConfirmTillId)}
                disabled={deletingTillId !== null}
                className="flex-1 rounded-lg bg-destructive py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
              >
                {deletingTillId !== null ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
