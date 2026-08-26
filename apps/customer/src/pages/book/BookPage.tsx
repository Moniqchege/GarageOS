import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { customers, useApi, useMutation, post } from "@garage/api-client";
import { Field, Input, Textarea } from "@garage/ui";

const CUSTOMER_REG = "KDK 420X";
const BUSINESS_NAME = "Kamau & Sons Auto Garage";
const slots = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

interface AppointmentPayload {
    registration: string;
    date: string;
    slot: string;
    issue: string;
}

export function BookPage() {
    const { data: vehicles } = useApi(
        () => customers.vehicles(CUSTOMER_REG),
        [],
    );

    const { mutate: bookAppointment, loading } = useMutation(
        (payload: AppointmentPayload) =>
            post<{ id: string }>("/api/appointments", payload),
    );

    const regs = (vehicles ?? []).map((v) => v.registration);

    const [vehIdx, setVehIdx] = useState(0);
    const [date,   setDate]   = useState("");
    const [issue,  setIssue]  = useState("");
    const [slot,   setSlot]   = useState("");
    const [sent,   setSent]   = useState(false);

    const handleSubmit = async () => {
        if (!date || !slot) return;
        await bookAppointment({
            registration: regs[vehIdx] ?? CUSTOMER_REG,
            date,
            slot,
            issue,
        });
        setSent(true);
    };

    if (sent) {
        return (
            <div className="px-8 py-16 text-center">
                <div className="mx-auto mb-4 flex h-15 w-15 items-center justify-center rounded-full bg-[var(--secondary-dim)]">
                    <CheckCircle2 size={28} className="text-[var(--secondary)]" />
                </div>
                <h1 className="text-lg font-bold">Booking request sent</h1>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                    {BUSINESS_NAME} will confirm your {slot} slot on{" "}
                    {date || "your chosen date"} shortly. You'll get a notification
                    once confirmed.
                </p>
                <button
                    onClick={() => { setSent(false); setDate(""); setSlot(""); setIssue(""); }}
                    className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold"
                >
                    Book another
                </button>
            </div>
        );
    }

    return (
        <div className="px-5 py-6">
            <h1 className="text-xl font-bold">Book a service</h1>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Request an appointment — we'll confirm by notification
            </p>

            <div className="mt-5">
                <Field label="Vehicle">
                    <div className="flex gap-2">
                        {regs.length === 0
                            ? <div className="h-10 flex-1 animate-pulse rounded-lg bg-[var(--surface-alt)]" />
                            : regs.map((reg, i) => (
                                <button
                                    key={reg}
                                    onClick={() => setVehIdx(i)}
                                    className={`flex-1 rounded-lg border px-2 py-2.5 font-mono text-xs font-bold ${
                                        vehIdx === i
                                            ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]"
                                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                    }`}
                                >
                                    {reg}
                                </button>
                            ))}
                    </div>
                </Field>

                <Field label="Preferred date" className="mt-4">
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </Field>

                <Field label="Preferred time slot" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                        {slots.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSlot(s)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                    slot === s
                                        ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]"
                                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label="What's the issue? (optional)" className="mt-4">
                    <Textarea
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                        placeholder="e.g. Routine service, or describe a noise / warning light…"
                    />
                </Field>

                <button
                    onClick={handleSubmit}
                    disabled={!date || !slot || loading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[var(--text-faint)]"
                >
                    {loading ? "Sending…" : "Request appointment"} <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
