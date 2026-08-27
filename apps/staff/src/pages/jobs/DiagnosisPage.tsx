import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { jobs, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Field, Select, Textarea } from "@garage/ui";
import type { JobDiagnosisFinding } from "@garage/types";

const severityStyle: Record<JobDiagnosisFinding["severity"], string> = {
    ok: "text-[var(--secondary)] bg-[var(--secondary-dim)]",
    warning: "text-[var(--warning)] bg-[var(--warning-dim)]",
    danger: "text-[var(--danger)] bg-[var(--danger-dim)]",
};

export function DiagnosisPage() {
    const { jobId = "" } = useParams();
    const navigate = useNavigate();

    const { data: job, loading, error } = useApi(() => jobs.get(jobId), [jobId]);
    const { mutate: save, loading: saving } = useMutation(
        (data: { notes?: string; findings?: JobDiagnosisFinding[] }) =>
            jobs.saveDiagnosis(jobId, data),
    );

    const [notes, setNotes] = useState("");
    const [findings, setFindings] = useState<JobDiagnosisFinding[]>([]);
    const [draft, setDraft] = useState({
        label: "",
        severity: "warning" as JobDiagnosisFinding["severity"],
        note: "",
    });

    useEffect(() => {
        if (job) {
            setNotes(job.diagnosisNotes ?? "");
            setFindings(job.diagnosisFindings ?? []);
        }
    }, [job]);

    const addFinding = () => {
        if (!draft.label || !draft.note) return;
        setFindings((prev) => [...prev, { id: crypto.randomUUID(), ...draft }]);
        setDraft({ label: "", severity: "warning", note: "" });
    };

    const removeFinding = (id: string) =>
        setFindings((prev) => prev.filter((f) => f.id !== id));

    const submit = async () => {
        await save({ notes, findings });
        navigate(`/jobs/${jobId}`);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl p-6">
                <div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-alt)]" />
                <div className="mt-4 h-64 animate-pulse rounded-xl bg-[var(--surface-alt)]" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="p-6">
                <p className="text-sm text-[var(--danger)]">{error ?? "Job not found"}</p>
                <Link to="/" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                    <ArrowLeft size={13} /> Back to bay board
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl p-6">
            <Link
                to={`/jobs/${jobId}`}
                className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)]"
            >
                <ArrowLeft size={13} /> Back to job card
            </Link>

            <h1 className="mb-1 text-2xl font-bold">Full diagnosis — {job.registration}</h1>
            <p className="mb-5 text-sm text-[var(--text-muted)]">
                Reported fault: {job.faults || "—"}
            </p>

            <h2 className="mb-3 text-sm font-bold">Mechanic notes</h2>
            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you find on inspection, beyond what the customer reported?"
                className="mb-6"
            />

            <h2 className="mb-3 text-sm font-bold">Findings</h2>

            <div className="mb-4 space-y-2.5">
                {findings.map((f) => (
                    <div
                        key={f.id}
                        className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5"
                    >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${severityStyle[f.severity]}`}>
                            {f.severity === "ok" ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{f.label}</span>
                                <Badge
                                    variant={
                                        f.severity === "danger" ? "danger" : f.severity === "warning" ? "warning" : "success"
                                    }
                                >
                                    {f.severity}
                                </Badge>
                            </div>
                            <div className="mt-0.5 text-xs text-[var(--text-muted)]">{f.note}</div>
                        </div>
                        <button onClick={() => removeFinding(f.id)} className="text-[var(--text-faint)]">
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}

                {findings.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-faint)]">
                        No findings added yet
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                    <Field label="Component / area">
                        <input
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                            value={draft.label}
                            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                            placeholder="e.g. Brakes"
                        />
                    </Field>
                    <Field label="Severity">
                        <Select
                            value={draft.severity}
                            onChange={(e) =>
                                setDraft({ ...draft, severity: e.target.value as JobDiagnosisFinding["severity"] })
                            }
                        >
                            <option value="ok">OK</option>
                            <option value="warning">Warning</option>
                            <option value="danger">Danger</option>
                        </Select>
                    </Field>
                </div>

                <Field label="Note" className="mt-3">
                    <Textarea
                        value={draft.note}
                        onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                        placeholder="e.g. Uneven pad wear, front left thinner than front right"
                    />
                </Field>

                <Button variant="secondary" onClick={addFinding} className="mt-3">
                    <Plus size={13} /> Add finding
                </Button>
            </div>

            <Button
                variant="primary"
                onClick={submit}
                disabled={saving}
                className="mt-6 w-full justify-center py-3 text-sm"
            >
                {saving ? "Saving…" : "Save diagnosis"}
            </Button>
        </div>
    );
}
