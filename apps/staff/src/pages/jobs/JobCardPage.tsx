import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, CreditCard, Package, Plus, Receipt as ReceiptIcon, Trash2, Wrench } from "lucide-react";

import { inventory, jobs, labor, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Select, Table } from "@garage/ui";
import type { JobLine } from "@garage/types";

const currency = (n: number) => "KSh " + Math.round(n).toLocaleString("en-KE");

export function JobCardPage() {
    const { jobId = "" } = useParams();
    const navigate = useNavigate();

    // ─── Remote data ─────────────────────────────────────────────────────────
    const {
        data: job,
        loading: jobLoading,
        error: jobError,
        refetch: refetchJob,
    } = useApi(() => jobs.get(jobId), [jobId]);

    const { data: catalog } = useApi(() => labor.list(), []);
    const { data: inventoryList } = useApi(() => inventory.list(), []);

    // ─── Local pickers ───────────────────────────────────────────────────────
    const [laborPick, setLaborPick] = useState("");
    const [partPick,  setPartPick]  = useState("");

    // ─── Mutations ───────────────────────────────────────────────────────────
    const { mutate: updateMechanic } = useMutation(
        (mechanic: string) => jobs.update(jobId, { mechanic }),
    );
    const { mutate: addLine, loading: addingLine } = useMutation(
        (line: JobLine) => jobs.addLine(jobId, line),
    );
    const { mutate: removeLine } = useMutation(
        (idx: number) => jobs.removeLine(jobId, idx),
    );

    const mechanics =
        inventoryList
            ? [] // real mechanic list comes from /api/users; stub with store employees
            : [];
    // Use employees from the users endpoint for the mechanic dropdown
    const { data: users } = useApi(
        () => import("@garage/api-client").then((m) => m.users.list()),
        [],
    );
    const mechanicOptions = (users ?? [])
        .filter((u) => u.role === "Lead Mechanic" && u.status === "Active")
        .map((u) => u.name);

    if (jobLoading) {
        return (
            <div className="p-6">
                <div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-alt)]" />
                <div className="mt-4 h-64 animate-pulse rounded-xl bg-[var(--surface-alt)]" />
            </div>
        );
    }

    if (jobError || !job) {
        return (
            <div className="p-6">
                <p className="text-sm text-[var(--danger)]">{jobError ?? "Job not found"}</p>
                <Link to="/" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                    <ArrowLeft size={13} /> Back to bay board
                </Link>
            </div>
        );
    }

    const lines = job.lines ?? [];
    const total = lines.reduce((s, l) => s + l.price, 0);

    const handleAddLabor = async () => {
        const entry = (catalog ?? []).find((l) => l.code === laborPick);
        if (!entry) return;
        await addLine({ type: "labor", name: entry.name, price: entry.price });
        refetchJob();
    };

    const handleAddPart = async () => {
        const part = (inventoryList ?? []).find((p) => p.sku === partPick);
        if (!part) return;
        await addLine({ type: "part", name: part.name, price: part.price, sku: part.sku });
        refetchJob();
    };

    const handleRemoveLine = async (idx: number) => {
        await removeLine(idx);
        refetchJob();
    };

    const handleMechanicChange = async (mechanic: string) => {
        await updateMechanic(mechanic);
        refetchJob();
    };

    // Default picker values once data arrives
    const defaultLabor = laborPick || (catalog?.[0]?.code ?? "");
    const defaultPart  = partPick  || (inventoryList?.[0]?.sku ?? "");

    const goToCheckout = () => {
        navigate("/pos/checkout", {
            state: {
                items: lines.map((l, i) => ({
                    sku: l.sku ?? `${job.id}-${i}`,
                    name: l.name,
                    price: l.price,
                    qty: 1,
                })),
                subtotal: total,
                vat: total * 0.16,
                total: total * 1.16,
                jobId: job.id,
                registration: job.registration,
            },
        });
    };

    return (
        <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)]"
                >
                    <ArrowLeft size={13} /> Back to bay board
                </Link>

                <Link
                    to={`/jobs/${job.id}/diagnosis`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                    <ClipboardList size={13} /> Full diagnosis
                </Link>
            </div>

            <h1 className="mb-4 text-2xl font-bold">Job card — {job.registration}</h1>

            <div className="mb-4.5 flex flex-wrap items-center gap-4">
                <div className="w-56">
                    <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        Assign lead mechanic
                    </div>
                    <Select
                        value={job.mechanic}
                        onChange={(e) => handleMechanicChange(e.target.value)}
                    >
                        {mechanicOptions.length === 0 && (
                            <option value={job.mechanic}>{job.mechanic || "—"}</option>
                        )}
                        {mechanicOptions.map((m) => (
                            <option key={m}>{m}</option>
                        ))}
                    </Select>
                </div>

                <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-muted)]">
                    {job.faults}
                </div>
            </div>

            <div className="mb-4.5 grid gap-4 md:grid-cols-2">
                {/* Labor selector */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <Wrench size={14} className="text-[var(--primary)]" />
                        Labor charge selector
                    </h2>
                    <div className="flex gap-2">
                        <Select
                            value={defaultLabor}
                            onChange={(e) => setLaborPick(e.target.value)}
                        >
                            {(catalog ?? []).map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.name} — {currency(l.price)}
                                </option>
                            ))}
                        </Select>
                        <Button
                            variant="secondary"
                            onClick={handleAddLabor}
                            disabled={addingLine || !catalog?.length}
                        >
                            <Plus size={13} />
                        </Button>
                    </div>
                </div>

                {/* Parts selector */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <Package size={14} className="text-[var(--primary)]" />
                        Parts pull selector
                    </h2>
                    <div className="flex gap-2">
                        <Select
                            value={defaultPart}
                            onChange={(e) => setPartPick(e.target.value)}
                        >
                            {(inventoryList ?? []).map((p) => (
                                <option key={p.sku} value={p.sku}>
                                    {p.name} — {currency(p.price)} ({p.qty} in stock)
                                </option>
                            ))}
                        </Select>
                        <Button
                            variant="secondary"
                            onClick={handleAddPart}
                            disabled={addingLine || !inventoryList?.length}
                        >
                            <Plus size={13} />
                        </Button>
                    </div>
                </div>
            </div>

            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <ReceiptIcon size={14} className="text-[var(--primary)]" />
                Job line items
            </h2>

            <Table
                head={["Type", "Description", "Amount", ""]}
                rows={lines.map((l, i) => [
                    <Badge variant={l.type === "labor" ? "default" : "success"}>{l.type}</Badge>,
                    l.name,
                    currency(l.price),
                    <button onClick={() => handleRemoveLine(i)} className="text-[var(--text-faint)]">
                        <Trash2 size={13} />
                    </button>,
                ])}
            />

            <div className="mt-4 flex items-center justify-end gap-5">
                <div className="text-sm text-[var(--text-muted)]">Job total</div>
                <div className="font-mono text-2xl font-bold text-[var(--primary)]">
                    {currency(total)}
                </div>
                <Button
                    variant="primary"
                    disabled={lines.length === 0}
                    onClick={goToCheckout}
                >
                    <CreditCard size={14} /> Checkout
                </Button>
            </div>
        </div>
    );
}
