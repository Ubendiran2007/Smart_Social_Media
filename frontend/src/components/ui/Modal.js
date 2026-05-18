import React, { useEffect } from "react";
import { cn } from "../../utils/cn";

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose?.()}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-full max-w-md rounded-2xl border border-white/10 bg-white shadow-xl",
            className
          )}
        >
          {title && (
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="text-lg font-semibold text-gray-900">{title}</div>
            </div>
          )}
          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

