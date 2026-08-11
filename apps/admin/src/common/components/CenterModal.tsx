import { useEffect, useState, type ReactNode } from "react";

const DURATION_MS = 280;

interface CenterModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}

export default function CenterModal({
  isOpen,
  title,
  onClose,
  children,
  widthClassName = "max-w-lg",
}: CenterModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    if (isOpen) {
      setMounted(true);
      openTimer = setTimeout(() => setVisible(true), 20);
      return () => {
        if (openTimer) clearTimeout(openTimer);
      };
    }

    setVisible(false);
    closeTimer = setTimeout(() => setMounted(false), DURATION_MS);
    return () => {
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: visible ? 0.5 : 0,
          transition: `opacity ${DURATION_MS}ms ease`,
        }}
        onClick={onClose}
      />

      <div
        className={`relative my-6 w-full border border-border bg-card p-6 shadow-2xl ${widthClassName}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(12px) scale(0.96)",
          transition: `opacity ${DURATION_MS}ms ease, transform ${DURATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          willChange: "opacity, transform",
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-2 text-lg leading-none text-muted-foreground hover:text-foreground"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
