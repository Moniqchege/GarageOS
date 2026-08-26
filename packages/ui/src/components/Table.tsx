import type { ReactNode } from "react";

export interface TableProps {
  head: ReactNode[];
  rows: ReactNode[][];
  emptyLabel?: string;
}

export function Table({ head, rows, emptyLabel = "No records yet" }: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-[var(--surface-alt)]">
            {head.map((h, i) => (
              <th
                key={i}
                className="border-b border-[var(--border)] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i ? "border-t border-[var(--border)]" : ""}>
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2.5 align-middle">
                  {c}
                </td>
              ))}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={head.length}
                className="px-3 py-6 text-center text-[var(--text-faint)]"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
