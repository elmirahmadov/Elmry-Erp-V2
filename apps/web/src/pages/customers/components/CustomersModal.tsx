import { useEffect, useState } from "react";
import type { CustomerFormState } from "../types/customer.types";

interface CustomersModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  form: CustomerFormState;
  onChange: (field: keyof CustomerFormState, value: string | boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  isLoading: boolean;
  deleteLoading?: boolean;
  error: string | null;
}

export default function CustomersModal({
  isOpen,
  title,
  submitLabel,
  form,
  onChange,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
  deleteLoading = false,
  error,
}: CustomersModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let raf2: number;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    if (isLoading || deleteLoading) return;
    onClose();
  };

  if (!mounted) return null;

  const fieldClass =
    "border rounded px-3 py-2 text-base bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div
      className="fixed inset-0 z-[1100] flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: visible ? 0.45 : 0 }}
        onClick={handleClose}
      />
      <div
        className="relative h-full w-full max-w-lg bg-card shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
        style={{
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          transform: visible ? "translateX(0)" : "translateX(100%)",
          opacity: visible ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            onClick={handleClose}
            aria-label="Bağla"
            disabled={isLoading || deleteLoading}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Müştəri adı</span>
              <input
                className={fieldClass}
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Əlaqədar şəxs</span>
              <input
                className={fieldClass}
                value={form.contactPerson}
                onChange={(e) => onChange("contactPerson", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Telefon</span>
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">E-poçt</span>
              <input
                type="email"
                className={fieldClass}
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Ünvan</span>
              <input
                className={fieldClass}
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Vergi nömrəsi</span>
              <input
                className={fieldClass}
                value={form.taxNumber}
                onChange={(e) => onChange("taxNumber", e.target.value)}
              />
            </label>
            {error ? (
              <p className="text-destructive md:col-span-2 text-sm">{error}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-secondary shrink-0">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.status === "active"}
              onChange={(e) =>
                onChange("status", e.target.checked ? "active" : "inactive")
              }
            />
            <span className="text-sm">Aktiv</span>
          </label>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            {onDelete ? (
              <button
                type="button"
                className="px-4 py-2 rounded bg-destructive text-destructive-foreground disabled:opacity-60"
                onClick={onDelete}
                disabled={isLoading || deleteLoading}
              >
                {deleteLoading ? "Silinir..." : "Sil"}
              </button>
            ) : null}
            <button
              type="button"
              className="px-4 py-2 rounded bg-muted text-foreground disabled:opacity-60"
              onClick={handleClose}
              disabled={isLoading || deleteLoading}
            >
              İmtina
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-60"
              onClick={onSubmit}
              disabled={isLoading || deleteLoading}
            >
              {isLoading ? "Saxlanılır..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
