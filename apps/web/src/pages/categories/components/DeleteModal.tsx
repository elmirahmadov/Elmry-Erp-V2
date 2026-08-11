import React from "react";
import { useAppDispatch, useAppSelector } from "../../../common/store/hooks";
import { hideDeleteModal } from "../../../common/store/modalSlice";
import { deleteCategoryThunk } from "../../../common/store/modalThunks";

interface DeleteModalProps {
  companyId: number;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ companyId }) => {
  const dispatch = useAppDispatch();
  const { open, categoryName, isLoading, error, categoryId } = useAppSelector(
    (state) => state.modal.delete,
  );
  const handleConfirm = () => {
    if (!companyId || !categoryId) return;
    dispatch(deleteCategoryThunk({ companyId }));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-60"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold">Kategori sil</h2>
          <button
            className="text-muted-foreground hover:text-foreground text-2xl"
            onClick={() => dispatch(hideDeleteModal())}
            aria-label="Kapat"
            type="button"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-foreground text-base">
            {categoryName
              ? `"${categoryName}" kategorisini silmek istiyor musun?`
              : "Kategoriyi silmek istiyor musun?"}
          </p>
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          <button
            className="bg-muted hover:bg-muted text-foreground rounded px-4 py-2"
            onClick={() => dispatch(hideDeleteModal())}
            type="button"
            disabled={isLoading}
          >
            İptal
          </button>
          <button
            className="bg-destructive hover:bg-destructive text-destructive-foreground rounded px-4 py-2"
            onClick={handleConfirm}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
