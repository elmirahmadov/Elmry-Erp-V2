import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../common/store/hooks";
import { hideNotification } from "../../../common/store/modalSlice";

export const NotificationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { open, message, type, autoCloseDuration } = useAppSelector(
    (state) => state.modal.notification,
  );

  useEffect(() => {
    if (open && autoCloseDuration && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoCloseDuration, dispatch]);

  if (!open) return null;

  let color = "";
  if (type === "error") color = "border-red-500";
  else if (type === "success") color = "border-green-500";
  else color = "border-blue-500";

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-60">
      <div
        className={`bg-card rounded-lg shadow-lg w-full max-w-md border-l-4 ${color} animate-fadeIn`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold capitalize">
            {type === "error"
              ? "Hata"
              : type === "success"
                ? "Başarılı"
                : "Bilgi"}
          </h3>
          <button
            onClick={() => dispatch(hideNotification())}
            className="text-muted-foreground hover:text-foreground text-xl"
            aria-label="Kapat"
          >
            <FaTimes />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-foreground text-base">{message}</p>
        </div>
        <div className="flex justify-end px-4 pb-4">
          <button
            type="button"
            onClick={() => dispatch(hideNotification())}
            className="border bg-muted hover:bg-muted text-foreground rounded px-4 py-2 text-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
