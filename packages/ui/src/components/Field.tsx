import type { ReactNode } from "react";

export interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className = "" }: FieldProps) {
  return (
    <label className={["block", className].join(" ")}>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </div>
      {children}
    </label>
  );
}
