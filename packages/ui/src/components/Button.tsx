import type {
  ButtonHTMLAttributes,
  ReactNode
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--primary)] text-white hover:opacity-90",

    secondary:
      "bg-[var(--surface-alt)] text-[var(--text)] border border-[var(--border)]",

    ghost:
      "bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-alt)]",

    danger:
      "bg-[var(--danger)] text-white hover:opacity-90"
  };

  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-lg px-4 py-2",
        "text-sm font-semibold",
        "transition-opacity",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        variants[variant],
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}