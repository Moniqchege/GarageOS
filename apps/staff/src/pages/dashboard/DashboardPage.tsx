import { useEffect, useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { jobs, useApi } from "@garage/api-client";
import { Badge, Card } from "@garage/ui";
import type { JobCard, JobStage } from "@garage/types";

const stages: { key: JobStage; label: string }[] = [
    { key: "diagnostics", label: "Awaiting diagnostics" },
    { key: "active",      label: "Active repairs"       },
    { key: "parts",       label: "Pending parts"        },
    { key: "done",        label: "Ready for pickup"     },
];

const elapsed = (t: number) => {
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? `${h}h ${m}m` : `${m}:${String(sec).padStart(2, "0")}`;
};

export function DashboardPage() {
    const { data, loading, error, refetch } = useApi(() => jobs.list(), []);
    // Tick every second to update elapsed timers
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick((n) => n + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const jobList: JobCard[] = data ?? [];

    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Bay board</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Live workshop status — drag cards to advance stages.
                    </p>
                </div>
                <Link
                    to="/intake"
                    className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white"
                >
                    + New intake
                </Link>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error} —{" "}
                    <button className="font-bold underline" onClick={refetch}>
                        retry
                    </button>
                </div>
            )}

            <div className="grid gap-4 xl:grid-cols-4">
                {stages.map((s) => {
                    const col = jobList.filter((j) => j.stage === s.key);
                    return (
                        <Card key={s.key} className="min-h-[420px] p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                    {s.label}
                                </h2>
                                <Badge>{loading ? "…" : col.length}</Badge>
                            </div>

                            {loading && (
                                <div className="space-y-3">
                                    {[1, 2].map((n) => (
                                        <div
                                            key={n}
                                            className="h-28 animate-pulse rounded-xl bg-[var(--surface-alt)]"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3">
                                {col.map((job) => (
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        key={job.id}
                                        className="block w-full rounded-xl border border-[var(--border)] p-4 text-left hover:border-[var(--primary)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm font-bold text-[var(--primary)]">
                                                {job.registration}
                                            </span>
                                            <ChevronRight
                                                size={15}
                                                className="text-[var(--text-faint)]"
                                            />
                                        </div>
                                        <p className="mt-1 text-sm font-semibold">{job.customer}</p>
                                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                            {job.mechanic}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-xs text-[var(--text-muted)]">
                                            {job.faults}
                                        </p>
                                        <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                            <Clock size={12} />
                                            {elapsed(job.startedAt)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
