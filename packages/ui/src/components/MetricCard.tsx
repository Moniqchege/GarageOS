import type { ReactNode } from "react";

import { Card } from "./Card";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  description
}: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--text)]">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-[var(--text-faint)]">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div className="rounded-lg bg-[var(--primary-dim)] p-2 text-[var(--primary)]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}