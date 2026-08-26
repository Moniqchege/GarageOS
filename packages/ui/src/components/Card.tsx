import type {
  HTMLAttributes,
  ReactNode
} from "react";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-xl",
        "border border-[var(--border)]",
        "bg-[var(--surface)]",
        "text-[var(--text)]",
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}