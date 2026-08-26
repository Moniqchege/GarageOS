import { AlertTriangle, Boxes, DollarSign, LayoutGrid, TrendingUp, Users, Wrench } from "lucide-react";

import { analytics, useApi } from "@garage/api-client";
import { MetricCard } from "@garage/ui";

const currency = (n: number) => "KSh " + Math.round(n).toLocaleString("en-KE");

export function AnalyticsPage() {
    const { data: summary,   loading: sl } = useApi(() => analytics.summary(),   []);
    const { data: inv,       loading: il } = useApi(() => analytics.inventory(), []);
    const { data: jobStats,  loading: jl } = useApi(() => analytics.jobs(),      []);
    const { data: staffList, loading: stl } = useApi(() => analytics.staff(),     []);

    const loading = sl || il || jl || stl;

    const topHeld  = inv?.topHeld  ?? [];
    const maxUnits = Math.max(...topHeld.map((p) => p.qty), 1);

    const stageOrder = ["diagnostics", "active", "parts", "done"] as const;
    const totalJobs  = summary?.totalJobs ?? 1;

    return (
        <div className="p-6">
            {/* ── KPI row ── */}
            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Job card revenue (open)"
                    value={loading ? "…" : currency(summary?.totalRevenue ?? 0)}
                    icon={<DollarSign size={18} />}
                />
                <MetricCard
                    label="Inventory value at cost"
                    value={loading ? "…" : currency(inv?.stockValue ?? 0)}
                    icon={<Boxes size={18} />}
                />
                <MetricCard
                    label="Low-stock SKUs"
                    value={loading ? "…" : String(inv?.lowStockCount ?? 0)}
                    icon={<AlertTriangle size={18} />}
                />
                <MetricCard
                    label="Active job cards"
                    value={loading ? "…" : String(summary?.openJobs ?? 0)}
                    icon={<Wrench size={18} />}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Inventory pressure */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
                        <TrendingUp size={14} className="text-[var(--primary)]" />
                        Inventory pressure — units held
                    </h2>
                    {il ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} className="h-6 animate-pulse rounded bg-[var(--surface-alt)]" />
                            ))}
                        </div>
                    ) : (
                        topHeld.map((p) => (
                            <div key={p.sku} className="mb-2.5">
                                <div className="mb-1 flex justify-between text-[11px]">
                                    <span>{p.name}</span>
                                    <span className="text-[var(--text-muted)]">{p.qty} units</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                                    <div
                                        className={`h-full ${p.qty <= p.low ? "bg-[var(--warning)]" : "bg-[var(--secondary)]"}`}
                                        style={{ width: `${(p.qty / maxUnits) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Bay distribution */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
                        <LayoutGrid size={14} className="text-[var(--primary)]" />
                        Workshop bay distribution
                    </h2>
                    {jl ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="h-6 animate-pulse rounded bg-[var(--surface-alt)]" />
                            ))}
                        </div>
                    ) : (
                        stageOrder.map((stage) => {
                            const count = jobStats ? jobStats[stage] : 0;
                            return (
                                <div key={stage} className="mb-2.5 flex items-center gap-2.5">
                                    <span className="w-28 text-[11px] capitalize text-[var(--text-muted)]">
                                        {stage}
                                    </span>
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                                        <div
                                            className="h-full bg-[var(--primary)]"
                                            style={{ width: `${(count / totalJobs) * 100}%` }}
                                        />
                                    </div>
                                    <span className="w-4 text-right text-[11px]">{count}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Staff performance */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
                        <Users size={14} className="text-[var(--primary)]" />
                        Staff performance
                    </h2>
                    {stl ? (
                        <div className="h-16 animate-pulse rounded bg-[var(--surface-alt)]" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                                        <th className="py-2 text-left font-semibold">Name</th>
                                        <th className="py-2 text-left font-semibold">Role</th>
                                        <th className="py-2 text-right font-semibold">Assigned</th>
                                        <th className="py-2 text-right font-semibold">Completed</th>
                                        <th className="py-2 text-right font-semibold">Avg turnaround</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(staffList ?? []).map((s) => (
                                        <tr key={s.employeeId} className="border-b border-[var(--border)] last:border-0">
                                            <td className="py-2">{s.name}</td>
                                            <td className="py-2 text-[var(--text-muted)]">{s.role}</td>
                                            <td className="py-2 text-right font-mono">{s.jobsAssigned}</td>
                                            <td className="py-2 text-right font-mono">{s.jobsCompleted}</td>
                                            <td className="py-2 text-right font-mono">{s.avgTurnaroundHours}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
