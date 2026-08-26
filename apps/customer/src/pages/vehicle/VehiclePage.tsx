import { useState } from "react";
import { AlertTriangle, Check, Download, ShieldCheck, X } from "lucide-react";

import { customers, useApi, useMutation } from "@garage/api-client";
import { Badge, Card } from "@garage/ui";
import type { DiagnosticFinding } from "@garage/types";

const currency = (n: number) => "KSh " + Math.round(n).toLocaleString("en-KE");

const CUSTOMER_REG = "KDK 420X";

const severityColor: Record<DiagnosticFinding["severity"], string> = {
    ok:      "text-[var(--secondary)] bg-[var(--secondary-dim)]",
    warning: "text-[var(--warning)] bg-[var(--warning-dim)]",
    danger:  "text-[var(--danger)] bg-[var(--danger-dim)]",
};

const tabs = ["diagnostics", "estimate", "history"] as const;
type Tab = (typeof tabs)[number];

export function VehiclePage() {
    const [tab, setTab] = useState<Tab>("diagnostics");

    const { data: vehicles, loading, error, refetch } = useApi(
        () => customers.vehicles(CUSTOMER_REG),
        [],
    );

    // Optimistic local estimate state (synced from server on load)
    const [localEstimate, setLocalEstimate] = useState<
        Array<{ name: string; price: number; approved: boolean | null }> | null
    >(null);

    const { mutate: _approveEstimate } = useMutation(
        (_payload: { jobId: string; lineIdx: number; approved: boolean }) =>
            // Placeholder — wire to real endpoint when estimate approval is added to API
            Promise.resolve(null),
    );

    const vehicle = vehicles?.[0];
    const job     = vehicle?.activeJob ?? null;
    const estimate = localEstimate ?? job?.estimate ?? [];

    const respond = (idx: number, approved: boolean) => {
        setLocalEstimate(
            estimate.map((l, i) => (i === idx ? { ...l, approved } : l)),
        );
    };

    if (loading) {
        return (
            <div className="px-5 py-6">
                <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-alt)]" />
                <div className="mt-4 h-64 animate-pulse rounded-xl bg-[var(--surface-alt)]" />
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="px-5 py-6">
                <p className="text-sm text-[var(--danger)]">{error ?? "Vehicle not found"}</p>
                <button onClick={refetch} className="mt-2 text-sm font-bold text-[var(--primary)]">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="px-5 py-6">
            <div className="mb-1">
                <h1 className="text-xl font-bold">{vehicle.model}</h1>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {vehicle.registration} · {vehicle.mileage.toLocaleString()} km
                </p>
            </div>

            {/* Tab bar */}
            <div className="mt-4 flex gap-1.5 rounded-xl bg-[var(--surface-alt)] p-1">
                {tabs.map((t) => (
                    <button
                        key={t}
                        disabled={t === "estimate" && !job}
                        onClick={() => setTab(t)}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition-colors ${
                            tab === t
                                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                                : "text-[var(--text-muted)]"
                        } ${t === "estimate" && !job ? "opacity-40" : ""}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Diagnostics ── */}
            {tab === "diagnostics" && (
                <div className="mt-4 space-y-3">
                    {job && (
                        <Card className="border-none bg-[var(--primary-dim)] p-4">
                            <div className="text-[11px] font-bold text-[var(--primary)]">
                                REPORTED FAULT
                            </div>
                            <div className="mt-1 text-sm">{job.faults}</div>
                        </Card>
                    )}
                    {vehicle.diagnostics.map((d, i) => (
                        <Card key={i} className="flex items-start gap-3 p-4">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${severityColor[d.severity]}`}>
                                {d.severity === "ok"
                                    ? <ShieldCheck size={14} />
                                    : <AlertTriangle size={14} />}
                            </div>
                            <div>
                                <div className="text-sm font-bold">{d.label}</div>
                                <div className="mt-0.5 text-xs text-[var(--text-muted)]">{d.note}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── Estimate ── */}
            {tab === "estimate" && job && (
                <div className="mt-4">
                    <p className="mb-3 text-xs text-[var(--text-muted)]">
                        Approve or decline each line before we proceed with the work.
                        Declined items won't be charged or actioned.
                    </p>
                    <div className="space-y-3">
                        {estimate.map((l, i) => (
                            <Card key={i} className="p-4">
                                <div className="mb-2.5 flex justify-between gap-3">
                                    <span className="text-sm font-semibold">{l.name}</span>
                                    <span className="font-mono text-sm font-bold">{currency(l.price)}</span>
                                </div>
                                {l.approved === null ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => respond(i, true)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--secondary)] py-2 text-xs font-bold text-white"
                                        >
                                            <Check size={13} /> Approve
                                        </button>
                                        <button
                                            onClick={() => respond(i, false)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--danger)] py-2 text-xs font-bold text-[var(--danger)]"
                                        >
                                            <X size={13} /> Decline
                                        </button>
                                    </div>
                                ) : (
                                    <Badge variant={l.approved ? "success" : "danger"}>
                                        {l.approved ? "Approved" : "Declined"}
                                    </Badge>
                                )}
                            </Card>
                        ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-[var(--border)] p-1 pt-3">
                        <span className="text-sm font-semibold">Estimate total</span>
                        <span className="font-mono text-base font-bold text-[var(--primary)]">
                            {currency(
                                estimate
                                    .filter((l) => l.approved !== false)
                                    .reduce((s, l) => s + l.price, 0),
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* ── History ── */}
            {tab === "history" && (
                <div className="mt-4 space-y-3">
                    {vehicle.history.map((h, i) => (
                        <Card key={i} className="flex items-center justify-between p-4">
                            <div>
                                <div className="text-sm font-semibold">{h.desc}</div>
                                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                                    {h.date} · {h.invoice}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-sm font-bold">{currency(h.cost)}</div>
                                <button className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-[var(--primary)]">
                                    <Download size={10} /> Receipt
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
