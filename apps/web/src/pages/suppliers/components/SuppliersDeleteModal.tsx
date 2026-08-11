import React from "react";
import { useAppDispatch, useAppSelector } from "../../../common/store/hooks";
import { useAuth } from "../../../common/contexts/AuthContext";
import {
  hideDeleteModal,
  setDeleteModalLoading,
  setDeleteModalError,
  showNotification,
} from "../../../common/store/modalSlice";
import { deleteSupplier } from "../../../common/actions/suppliers.actions";

interface SuppliersDeleteModalProps {
  supplierId?: number;
  supplierName?: string;
  onDeleted?: () => void;
}

const SuppliersDeleteModal: React.FC<SuppliersDeleteModalProps> = ({
  supplierId,
  supplierName,
  onDeleted,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const companyId = user?.companyId;
  const { open, isLoading, error } = useAppSelector(
    (state) => state.modal.delete,
  );
  const modalState = useAppSelector((state) => state.modal.delete);
  const resolvedSupplierId = supplierId ?? modalState.categoryId ?? undefined;
  const resolvedSupplierName = supplierName || modalState.categoryName;

  const handleClose = () => {
    if (isLoading) return;
    dispatch(hideDeleteModal());
    dispatch(setDeleteModalError(null));
  };

  const handleConfirm = async () => {
    if (!resolvedSupplierId || !companyId) return;
    dispatch(setDeleteModalLoading(true));
    dispatch(setDeleteModalError(null));
    try {
      await deleteSupplier(resolvedSupplierId, companyId);
      dispatch(hideDeleteModal());
      dispatch(
        showNotification({
          message: `"${resolvedSupplierName || "Tedarikçi"}" başarıyla silindi!`,
          type: "success",
        }),
      );
      if (onDeleted) onDeleted();
    } catch (err: any) {
      dispatch(setDeleteModalError(err?.message || "Tedarikçi silinemedi"));
    } finally {
      dispatch(setDeleteModalLoading(false));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-60"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tedarikçiyi Sil</h2>
          <p className="mb-4">{`"${resolvedSupplierName || "Tedarikçi"}" tedarikçisini silmek istediğinize emin misiniz?`}</p>
          {error && <div className="text-destructive mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 rounded bg-muted hover:bg-muted text-foreground"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </button>
            <button
              className="px-4 py-2 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Siliniyor..." : "Sil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersDeleteModal;
