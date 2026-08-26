import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Fuel, Gauge, Phone, Plus } from "lucide-react";

import { jobs, useMutation } from "@garage/api-client";
import { Button, Card, Field, Input, Textarea } from "@garage/ui";

const fuelLabels = ["E", "1/4", "1/2", "3/4", "F"];

export function IntakePage() {
    const navigate = useNavigate();
    const { mutate: createJob, loading, error } = useMutation(
        (data: Parameters<typeof jobs.create>[0]) => jobs.create(data),
    );

    const [form, setForm] = useState({
        reg: "",
        mileage: "",
        fuel: 2,
        phone: "",
        customer: "",
        faults: "",
    });

    const create = async () => {
        if (!form.reg || !form.customer) return;
        const job = await createJob({
            registration: form.reg,
            customer:     form.customer,
            phone:        form.phone,
            mechanic:     "",
            faults:       form.faults,
        });
        if (job) navigate("/");
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">Registration &amp; Assessment</h1>
                        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            New job
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Log an incoming vehicle and open a new job card.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                    <ArrowLeft size={14} /> View Bay Board
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
                <Card className="p-5">
                    <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dim)] text-[var(--primary)]">
                            <Car size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">Vehicle details</h2>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                Identify the vehicle entering the workshop.
                            </p>
                        </div>
                    </div>

                    <Field label="Registration plate">
                        <Input
                            className="font-mono text-base tracking-wide"
                            value={form.reg}
                            onChange={(e) => setForm({ ...form, reg: e.target.value.toUpperCase() })}
                            placeholder="KDK 420X"
                        />
                    </Field>

                    <Field label="Mileage (km)" className="mt-4">
                        <div className="relative">
                            <Gauge
                                size={14}
                                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                            />
                            <Input
                                className="pl-8"
                                value={form.mileage}
                                onChange={(e) => setForm({ ...form, mileage: e.target.value.replace(/\D/g, "") })}
                                placeholder="e.g. 84200"
                            />
                        </div>
                    </Field>

                    <Field
                        label={<span className="flex items-center gap-1"><Fuel size={11} /> Fuel status</span>}
                        className="mt-5"
                    >
                        <div className="px-1">
                            <input
                                type="range"
                                min={0}
                                max={4}
                                value={form.fuel}
                                onChange={(e) => setForm({ ...form, fuel: Number(e.target.value) })}
                                className="w-full accent-[var(--primary)]"
                            />
                            <div className="mt-1 flex justify-between text-[11px] text-[var(--text-muted)]">
                                {fuelLabels.map((label, index) => (
                                    <span
                                        key={label}
                                        className={form.fuel === index ? "font-bold text-[var(--primary)]" : ""}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Field>
                </Card>

                <Card className="p-5">
                    <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dim)] text-[var(--primary)]">
                            <Phone size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">Customer &amp; fault report</h2>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                Capture customer information and reported issues.
                            </p>
                        </div>
                    </div>

                    <Field label="Customer name">
                        <Input
                            value={form.customer}
                            onChange={(e) => setForm({ ...form, customer: e.target.value })}
                            placeholder="e.g. James Mutiso"
                        />
                    </Field>
                    <Field label="Phone number" className="mt-4">
                        <Input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="07xx xxx xxx"
                        />
                    </Field>
                    <Field label="Reported mechanical faults" className="mt-4">
                        <Textarea
                            value={form.faults}
                            onChange={(e) => setForm({ ...form, faults: e.target.value })}
                            placeholder="Describe what the driver reported…"
                            className="min-h-[120px]"
                        />
                    </Field>

                    <div className="mt-5 flex justify-end border-t border-[var(--border)] pt-4">
                        <Button
                            variant="primary"
                            onClick={create}
                            disabled={loading || !form.reg || !form.customer}
                            className="justify-center px-5"
                        >
                            <Plus size={14} />
                            {loading ? "Creating…" : "Create job card"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
