import { useEffect, useState, type ReactNode } from "react";

const DURATION_MS = 280;

interface SideDrawerProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
  footer?: ReactNode;
}

export default function SideDrawer({
  isOpen,
  title,
  onClose,
  children,
  widthClassName = "max-w-lg",
  footer,
}: SideDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    if (isOpen) {
      setMounted(true);
      // Wait one paint so translateX(100%) is applied before animating in.
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
      className="fixed inset-0 z-[1100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: visible ? 0.45 : 0,
          transition: `opacity ${DURATION_MS}ms ease`,
        }}
        onClick={onClose}
      />

      <div
        className={`relative flex h-full w-full flex-col border-l border-border bg-card shadow-2xl ${widthClassName}`}
        style={{
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: `transform ${DURATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          willChange: "transform",
        }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-secondary px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-2 text-lg leading-none text-muted-foreground hover:text-foreground"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-border bg-secondary px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
