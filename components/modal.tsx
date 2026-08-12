"use client";

import { X } from "lucide-react";
import { useEffect, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  children: React.ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  label: string;
  open: boolean;
  title?: string;
  onClose: () => void;
};

function subscribeToBrowser() {
  return () => undefined;
}

export function Modal({
  children,
  overlayClassName,
  panelClassName,
  label,
  open,
  title,
  onClose,
}: ModalProps) {
  const mounted = useSyncExternalStore(
    subscribeToBrowser,
    () => true,
    () => false,
  );
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className={`modalOverlay${overlayClassName ? ` ${overlayClassName}` : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={`modalPanel${panelClassName ? ` ${panelClassName}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : label}
        aria-labelledby={title ? titleId : undefined}
      >
        <button
          className="modalClose"
          type="button"
          aria-label="Close modal"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>

        {title ? <h2 id={titleId}>{title}</h2> : null}
        <div className="modalBody">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
