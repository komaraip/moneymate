import type { ReactNode } from "react";

type FormFieldProps = {
  children: ReactNode;
  label: string;
};

export function FormField({ children, label }: FormFieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
