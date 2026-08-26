import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Check, Smartphone } from "lucide-react";

import { pos, jobs, useMutation } from "@garage/api-client";
import { Button, Field, Input } from "@garage/ui";

const currency = (n: number) => "KSh " + Math.round(n).toLocaleString("en-KE");

interface PendingSale {
    items: { sku: string; name: string; price: number; qty: number }[];
    subtotal: number;
    vat: number;
    total: number;
    jobId?: string;
    registration?: string;
}

export function CheckoutPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const pendingSale = state as PendingSale | null;

    const [method,     setMethod]     = useState<"mpesa" | "cash">("mpesa");
    const [mpesaPhone, setMpesaPhone] = useState("");
    const [mpesaCode,  setMpesaCode]  = useState("");
    const [tendered,   setTendered]   = useState(0);

    const { mutate: checkoutSale, loading: posLoading, error: posError } = useMutation(
        (payload: Parameters<typeof pos.checkout>[0]) => pos.checkout(payload),
    );
    const { mutate: checkoutJob, loading: jobLoading, error: jobError } = useMutation(
        (payload: Parameters<typeof pos.checkout>[0]) =>
            jobs.checkout(pendingSale?.jobId ?? "", payload),
    );
    const loading = pendingSale?.jobId ? jobLoading : posLoading;
    const error = pendingSale?.jobId ? jobError : posError;

    if (!pendingSale) {
        return (
            <div className="p-6">
                <p className="text-sm text-[var(--text-muted)]">
                    No pending sale. Start one from the POS counter.
                </p>
                <button
                    onClick={() => navigate("/pos")}
                    className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]"
                >
                    <ArrowLeft size={13} /> Back to counter
                </button>
            </div>
        );
    }

    const { total, subtotal, vat } = pendingSale;
    const change     = Math.max(0, tendered - total);
    const canConfirm = method === "mpesa" ? mpesaCode.length >= 8 : tendered >= total;

    const confirm = async () => {
        const payload = {
            method,
            amountTendered: method === "cash" ? tendered : undefined,
            mpesaRef:       method === "mpesa" ? mpesaCode : undefined,
        };
        const receipt = pendingSale.jobId
            ? await checkoutJob(payload)
            : await checkoutSale(payload);
        if (receipt) navigate("/pos/receipt", { state: receipt });
    };

    return (
        <div className="mx-auto max-w-lg p-6">
            <button
                onClick={() => navigate("/pos")}
                className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)]"
            >
                <ArrowLeft size={13} /> Back to counter
            </button>

            <div className="mb-6 text-center">
                {pendingSale.registration && (
                    <div className="mb-1 text-xs font-semibold text-[var(--primary)]">
                        Job checkout — {pendingSale.registration}
                    </div>
                )}
                <div className="text-xs text-[var(--text-muted)]">Total due</div>
                <div className="font-mono text-4xl font-bold text-[var(--primary)]">
                    {currency(total)}
                </div>
                <div className="mt-1 text-[11px] text-[var(--text-faint)]">
                    Subtotal {currency(subtotal)} · VAT {currency(vat)}
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            )}

            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setMethod("mpesa")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm ${
                        method === "mpesa"
                            ? "border-[var(--secondary)] bg-[var(--secondary-dim)]"
                            : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                >
                    <Smartphone size={15} className="text-[var(--secondary)]" /> M-Pesa
                </button>
                <button
                    onClick={() => setMethod("cash")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm ${
                        method === "cash"
                            ? "border-[var(--primary)] bg-[var(--primary-dim)]"
                            : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                >
                    <Banknote size={15} className="text-[var(--primary)]" /> Cash
                </button>
            </div>

            {method === "mpesa" ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4.5">
                    <Field label="Customer Safaricom number">
                        <Input
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            placeholder="07xx xxx xxx"
                        />
                    </Field>
                    <Field label="M-Pesa transaction code" className="mt-3.5">
                        <Input
                            className="font-mono tracking-wide"
                            maxLength={10}
                            value={mpesaCode}
                            onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                            placeholder="e.g. QGH7K2LMP1"
                        />
                    </Field>
                </div>
            ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4.5">
                    <div className="mb-2.5 text-[11px] text-[var(--text-muted)]">
                        Tap notes tendered by customer
                    </div>
                    <div className="mb-3.5 flex flex-wrap gap-2">
                        {[100, 200, 500, 1000].map((n) => (
                            <button
                                key={n}
                                onClick={() => setTendered((t) => t + n)}
                                className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2.5 font-mono text-sm"
                            >
                                KSh {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setTendered(0)}
                            className="rounded-lg px-3 py-2.5 text-xs text-[var(--text-muted)]"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="flex justify-between py-0.5 text-xs text-[var(--text-muted)]">
                        <span>Tendered</span>
                        <span className="font-mono">{currency(tendered)}</span>
                    </div>
                    <div className="mt-1.5 flex justify-between border-t border-[var(--border)] pt-2 text-sm font-bold">
                        <span>Change due</span>
                        <span className="font-mono text-lg text-[var(--primary)]">
                            {currency(change)}
                        </span>
                    </div>
                </div>
            )}

            <Button
                variant="primary"
                disabled={!canConfirm || loading}
                onClick={confirm}
                className="mt-5 w-full justify-center py-3 text-sm"
            >
                <Check size={15} /> {loading ? "Processing…" : "Confirm payment & print"}
            </Button>
        </div>
    );
}
