import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ children, onClose, size = "md", title }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <section className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-subtle bg-surface p-5 shadow-2xl ${sizeClass[size]}`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-main">{title}</h3>
          <button
            aria-label="Tutup"
            className="rounded-lg border border-subtle p-2 text-muted hover:bg-surface-hover"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}
