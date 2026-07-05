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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <section className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl surface-elevated card-shadow p-6 ${sizeClass[size]}`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-main font-display tracking-tight">{title}</h3>
          <button
            aria-label="Close"
            className="rounded-xl p-2 text-muted hover:bg-fin-surface-hover hover:text-main transition-colors"
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
