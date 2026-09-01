import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Banknote,
    Car,
    Check,
    ChevronRight,
    CircleDollarSign,
    FileText,
    Smartphone,
} from "lucide-react";

import { pos, jobs, useMutation } from "@garage/api-client";
import { Button, Field, Input } from "@garage/ui";

const currency = (n: number) =>
    "KSh " + Math.round(Number(n) || 0).toLocaleString("en-KE");

interface PendingSale {
    items: {
        sku: string;
        name: string;
        price: number;
        qty: number;
    }[];
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

    const [method, setMethod] = useState<"mpesa" | "cash">("mpesa");
    const [mpesaPhone, setMpesaPhone] = useState("");
    const [mpesaCode, setMpesaCode] = useState("");
    const [tendered, setTendered] = useState(0);

    const {
        mutate: checkoutSale,
        loading: posLoading,
        error: posError,
    } = useMutation(
        (payload: Parameters<typeof pos.checkout>[0]) =>
            pos.checkout(payload),
    );

    const {
        mutate: checkoutJob,
        loading: jobLoading,
        error: jobError,
    } = useMutation(
        (payload: Parameters<typeof pos.checkout>[0]) =>
            jobs.checkout(pendingSale?.jobId ?? "", payload),
    );

    const loading = pendingSale?.jobId ? jobLoading : posLoading;
    const error = pendingSale?.jobId ? jobError : posError;

    const itemCount = useMemo(
        () =>
            pendingSale?.items.reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0,
            ) ?? 0,
        [pendingSale?.items],
    );

    if (!pendingSale) {
        return (
            <div className="flex min-h-full items-center justify-center p-6">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-alt)]">
                        <FileText
                            size={21}
                            className="text-[var(--text-muted)]"
                        />
                    </div>

                    <h2 className="text-base font-bold text-[var(--text)]">
                        No pending sale
                    </h2>

                    <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                        Start a sale from the POS counter to continue with
                        checkout.
                    </p>

                    <button
                        onClick={() => navigate("/pos")}
                        className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]"
                    >
                        <ArrowLeft size={14} />
                        Back to counter
                    </button>
                </div>
            </div>
        );
    }

    const { total, subtotal, vat, items } = pendingSale;

    const change = Math.max(0, tendered - total);

    const canConfirm =
        method === "mpesa"
            ? mpesaCode.trim().length >= 8
            : tendered >= total;

    const confirm = async () => {
        if (!canConfirm || loading) return;

        const payload = {
            method,
            amountTendered: method === "cash" ? tendered : undefined,
            mpesaRef: method === "mpesa" ? mpesaCode.trim() : undefined,
        };

        const receipt = pendingSale.jobId
            ? await checkoutJob(payload)
            : await checkoutSale(payload);

        if (receipt) {
            navigate("/pos/receipt", {
                state: receipt,
            });
        }
    };

    const addCash = (amount: number) => {
        setTendered((current) => current + amount);
    };

    const setExactAmount = () => {
        setTendered(total);
    };

    return (
        <div className="min-h-full bg-[var(--background)] !p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/pos")}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] border p-2 rounded-lg border-[var(--border)] transition hover:text-[var(--text)]"
                    >
                        <ArrowLeft size={15} />
                        Back to counter
                    </button>

                    <div className="text-right">
                        <div className="text-sm font-bold text-[var(--text)]">
                            Checkout <span className="text-[var(--primary)]">{pendingSale.jobId}</span>
                        </div>
                    </div>

                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="space-y-5">
                        {/* Job / vehicle information */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                                <div>
                                    <div className="text-sm font-bold text-[var(--text)]">
                                        {pendingSale.jobId
                                            ? "Job checkout"
                                            : "Order summary"}
                                    </div>

                                    <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                                        {itemCount} item
                                        {itemCount !== 1 ? "s" : ""}
                                    </div>
                                </div>

                                {pendingSale.registration && (
                                    <div className="flex items-center gap-1.5 rounded-md bg-[var(--primary-dim)] px-2.5 py-1.5 text-xs font-bold text-[var(--primary)]">
                                        <Car size={13} />
                                        {pendingSale.registration}
                                    </div>
                                )}
                            </div>

                            {pendingSale.jobId && (
                                <div className="grid grid-cols-2 gap-4 border-b border-[var(--border)] px-4 py-3">
                                    <div>
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                                            Job
                                        </div>

                                        <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                                            #{pendingSale.jobId}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                                            Vehicle
                                        </div>

                                        <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                                            {pendingSale.registration ||
                                                "—"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div className="divide-y divide-[var(--border)]">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <div
                                            key={item.sku}
                                            className="flex items-center justify-between gap-4 px-4 py-3"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-[var(--text)]">
                                                    {item.name}
                                                </div>

                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                                    <span>
                                                        {item.qty} ×{" "}
                                                        {currency(item.price)}
                                                    </span>

                                                    {item.sku && (
                                                        <>
                                                            <span className="text-[var(--text-faint)]">
                                                                ·
                                                            </span>

                                                            <span className="font-mono">
                                                                {item.sku}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 font-mono text-sm font-semibold text-[var(--text)]">
                                                {currency(
                                                    item.price * item.qty,
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-7 text-center text-sm text-[var(--text-muted)]">
                                        No items on this sale.
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-[var(--border)] px-4 py-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                                        <span>Subtotal</span>

                                        <span className="font-mono">
                                            {currency(subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                                        <span>VAT</span>

                                        <span className="font-mono">
                                            {currency(vat)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-end justify-between border-t border-[var(--border)] pt-4">
                                    <div>
                                        <div className="text-sm font-bold text-[var(--text)]">
                                            Total
                                        </div>

                                        <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                            Amount payable
                                        </div>
                                    </div>

                                    <div className="font-mono text-2xl font-bold text-[var(--primary)]">
                                        {currency(total)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment summary card on desktop */}
                        <div className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:block">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-dim)]">
                                    <CircleDollarSign
                                        size={18}
                                        className="text-[var(--primary)]"
                                    />
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-[var(--text)]">
                                        Ready for payment
                                    </div>

                                    <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                                        Select a payment method and complete
                                        the transaction.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ═════════════════════════════════════════
                        RIGHT — PAYMENT
                    ══════════════════════════════════════════ */}
                    <section>
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] !p-4 sm:p-6">
                            {/* Payment heading */}
                            <div className="mb-5">
                                <div className="text-base font-bold text-[var(--text)]">
                                    Payment
                                </div>

                                <div className="mt-1 text-xs text-[var(--text-muted)]">
                                    Choose how the customer is paying.
                                </div>
                            </div>

                            {/* Amount due */}
                            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Amount due
                                </div>

                                <div className="mt-1 font-mono text-2xl font-bold text-[var(--primary)]">
                                    {currency(total)}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3">
                                    <div className="text-xs font-semibold text-[var(--danger)]">
                                        Payment failed
                                    </div>

                                    <div className="mt-1 text-sm text-[var(--danger)]">
                                        {error}
                                    </div>
                                </div>
                            )}

                            {/* Payment methods */}
                            <div className="mt-5">
                                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Payment method
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMethod("mpesa")}
                                        className={`flex items-center gap-3 rounded-lg border p-3.5 text-left transition ${
                                            method === "mpesa"
                                            ? "border-[var(--secondary)] bg-[var(--secondary-dim)]"
                                            : "border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--text-muted)]"
                                            }`}
                                    >
                                        <Smartphone
                                            size={18}
                                            className="text-[var(--secondary)] shrink-0"
                                        />

                                        <div>
                                            <div className="text-sm font-semibold text-[var(--text)]">
                                                M-Pesa
                                            </div>
                                            <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                                Mobile payment
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMethod("cash")}
                                        className={`flex items-center gap-3 rounded-lg border p-3.5 text-left transition ${
                                            method === "cash"
                                            ? "border-[var(--primary)] bg-[var(--primary-dim)]"
                                                : "border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--text-muted)]"
                                            }`}
                                    >
                                        <Banknote
                                            size={18}
                                            className="text-[var(--primary)] shrink-0"
                                        />
                                        
                                        <div>
                                            <div className="text-sm font-semibold text-[var(--text)]">
                                                Cash
                                            </div>
                                            <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                                Cash payment
                                            </div>
                                        </div>
                                    </button>

                                </div>
                            </div>

                            {/* ═════════════════════════════════════
                                M-PESA FORM
                            ══════════════════════════════════════ */}
                            {method === "mpesa" ? (
                                <div className="mt-5">
                                    <div className="mb-4 rounded-lg bg-[var(--secondary-dim)] px-3.5 py-3">
                                        <div className="text-xs font-semibold text-[var(--secondary)]">
                                            M-Pesa payment
                                        </div>

                                        <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                                            Enter the customer's Safaricom
                                            number and the transaction code
                                            from their M-Pesa confirmation.
                                        </div>
                                    </div>

                                    <Field label="Customer Safaricom number">
                                        <Input
                                            value={mpesaPhone}
                                            onChange={(e) =>
                                                setMpesaPhone(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="07xx xxx xxx"
                                            inputMode="tel"
                                        />
                                    </Field>

                                    <Field
                                        label="M-Pesa transaction code"
                                        className="mt-4"
                                    >
                                        <Input
                                            className="font-mono tracking-widest uppercase"
                                            maxLength={10}
                                            value={mpesaCode}
                                            onChange={(e) =>
                                                setMpesaCode(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="QGH7K2LMP1"
                                        />
                                    </Field>

                                    <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-faint)]">
                                        <span>
                                            Transaction reference required
                                        </span>

                                        <span className="font-mono">
                                            {mpesaCode.length}/10
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* ═════════════════════════════════════
                                   CASH FORM
                                ══════════════════════════════════════ */
                                <div className="mt-5">
                                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                        Amount tendered
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                                        <div className="font-mono text-2xl font-bold text-[var(--text)]">
                                            {currency(tendered)}
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-4 gap-2">
                                        {[100, 200, 500, 1000].map((amount) => (
                                            <button
                                                key={amount}
                                                type="button"
                                                onClick={() =>
                                                    addCash(amount)
                                                }
                                                className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] py-3 font-mono text-xs font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-dim)]"
                                            >
                                                {amount.toLocaleString(
                                                    "en-KE",
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={setExactAmount}
                                            className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                        >
                                            Exact amount
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setTendered(0)}
                                            className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--danger)]"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    {/* Change */}
                                    <div
                                        className={`mt-5 rounded-lg border px-4 py-4 ${
                                            tendered >= total
                                                ? "border-[var(--primary)] bg-[var(--primary-dim)]"
                                                : "border-[var(--border)] bg-[var(--surface-alt)]"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-semibold text-[var(--text)]">
                                                    Change due
                                                </div>

                                                <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                                    Return to customer
                                                </div>
                                            </div>

                                            <div
                                                className={`font-mono text-2xl font-bold ${
                                                    tendered >= total
                                                        ? "text-[var(--primary)]"
                                                        : "text-[var(--text-muted)]"
                                                }`}
                                            >
                                                {currency(change)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Confirmation */}
                            <div className="mt-6 border-t border-[var(--border)] pt-5">
                                <Button
                                    variant="primary"
                                    disabled={!canConfirm || loading}
                                    onClick={confirm}
                                    className="w-full disabled:opacity-50 justify-center py-3.5 text-sm"
                                >
                                    <Check size={16} />

                                    {loading
                                        ? "Processing…"
                                        : "Confirm payment & print"}

                                    {!loading && (
                                        <ChevronRight
                                            size={15}
                                            className="ml-0.5"
                                        />
                                    )}
                                </Button>

                                <p className="mt-2.5 text-center text-[10px] leading-relaxed text-[var(--text-faint)]">
                                    A receipt will be generated after
                                    successful payment.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

