import type { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({
  children,
  variant = "default"
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default:
      "bg-[var(--surface-alt)] text-[var(--text-muted)]",

    success:
      "bg-[var(--secondary-dim)] text-[var(--secondary)]",

    warning:
      "bg-[var(--warning-dim)] text-[var(--warning)]",

    danger:
      "bg-[var(--danger-dim)] text-[var(--danger)]"
  };

  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-full",
        "px-2.5 py-1",
        "text-xs font-semibold",
        variants[variant]
      ].join(" ")}
    >
      {children}
    </span>
  );
}