
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Car,
    Check,
    ChevronRight,
    CircleCheck,
    FileText,
    Plus,
    Printer,
    Receipt,
    ShieldCheck,
} from "lucide-react";

import type { Receipt as ReceiptType } from "@garage/api-client";
import { Button } from "@garage/ui";

const fmt = (n: number) =>
    Math.round(Number(n) || 0).toLocaleString("en-KE");

const currency = (n: number) => `KSh ${fmt(n)}`;

export function ReceiptPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const receipt = state as ReceiptType | null;

    if (!receipt) {
        return (
            <div className="flex min-h-full items-center justify-center p-6">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-alt)]">
                        <Receipt
                            size={21}
                            className="text-[var(--text-muted)]"
                        />
                    </div>

                    <h2 className="text-base font-bold text-[var(--text)]">
                        No receipt available
                    </h2>

                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                        Complete a sale from the POS counter first to generate
                        a receipt.
                    </p>

                    <button
                        onClick={() => navigate("/pos")}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] border p-2 rounded-lg border-[var(--border)] transition hover:text-[var(--text)]"
                    >
                        <ArrowLeft size={14} />
                        Back to counter
                    </button>
                </div>
            </div>
        );
    }

    const {
        items,
        subtotal,
        vat,
        total,
        method,
        mpesaRef,
        id,
        vatReg,
        jobId,
        registration,
    } = receipt;

    const itemCount = items.reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0,
    );

    const isJobCheckout = Boolean(jobId);
    const isMpesa = method === "mpesa";

    const printDocuments = () => {
        window.print();
    };

    return (
        <div className="min-h-full bg-[var(--background)] !p-3 sm:p-6 lg:p-8 print:bg-white print:p-0">
            <div className="mx-auto max-w-7xl">
                {/*  HEADER*/}
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <button
                        onClick={() => navigate("/pos")}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] border p-2 rounded-lg border-[var(--border)] transition hover:text-[var(--text)]"
                    >
                        <ArrowLeft size={15} />
                        Back to counter
                    </button>

                    <button
                        onClick={() => navigate("/pos")}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                    >
                        <Plus size={14} />
                        New sale
                    </button>
                </div>

                {/* SUCCESS HEADER */}
                <div className="mb-7 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--secondary-dim)]">
                                <Check
                                    size={23}
                                    strokeWidth={2.5}
                                    className="text-[var(--secondary)]"
                                />
                            </div>

                            <div>
                                <div className="text-lg font-bold text-[var(--text)]">
                                    Payment received
                                </div>

                                <div className="mt-1 text-xs text-[var(--text-muted)]">
                                    Transaction completed successfully. The
                                    documents below are ready for printing.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:text-right">
                            <div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                                    Amount paid
                                </div>

                                <div className="mt-0.5 font-mono text-[20px] font-bold text-[var(--primary)]">
                                    {currency(total)}
                                </div>
                            </div>

                            <div className="hidden h-10 w-px bg-[var(--border)] sm:block" />

                            <div className="hidden sm:block">
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                                    Receipt
                                </div>

                                <div className="mt-0.5 font-mono text-xs font-semibold text-[var(--text)]">
                                    {id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRANSACTION CONTEXT */}
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                            Transaction
                        </div>

                        <div className="mt-1 font-mono text-sm font-semibold text-[var(--text)]">
                            {id}
                        </div>
                    </div>

                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                            Payment
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
                            {isMpesa ? (
                                <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)]" />
                                    M-Pesa
                                </>
                            ) : (
                                <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                                    Cash
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                            Vehicle
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
                            <Car
                                size={13}
                                className="text-[var(--primary)]"
                            />

                            {registration || "Retail sale"}
                        </div>
                    </div>

                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                            Items
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                            {itemCount} item
                            {itemCount !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    {/* DOCUMENTS */}
                    <section>
                        <div className="mb-4 flex items-center justify-between print:hidden">
                            <div>
                                <h2 className="text-sm font-bold text-[var(--text)]">
                                    Transaction documents
                                </h2>

                                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                    Invoice and vehicle clearance documents
                                </p>
                            </div>

                            <Button
                                variant="ghost"
                                onClick={printDocuments}
                            >
                                <Printer size={14} />
                                Print
                            </Button>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 sm:p-6">
                            <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-start">
                                {/* ETR INVOICE */}
                                <div className="w-full">
                                    <div className="mb-2 flex items-center justify-between px-1 print:hidden">
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                            <FileText size={12} />
                                            Tax invoice
                                        </div>

                                        <div className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[9px] text-[var(--text-faint)]">
                                            A4 / Receipt
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-lg bg-white text-neutral-900 shadow-lg">
                                        <div className="p-5 font-mono text-[11px]">
                                            {/* Invoice heading */}
                                            <div className="text-center">
                                                <div className="text-sm font-bold">
                                                    GARAGE OS
                                                </div>

                                                <div className="mt-0.5 text-[10px] font-bold">
                                                    ETR INVOICE
                                                </div>

                                                <div className="mt-1 text-[9px] text-neutral-500">
                                                    Electronic Tax Receipt
                                                </div>
                                            </div>

                                            <div className="my-3 border-t border-dashed border-neutral-300" />

                                            <div className="space-y-0.5 text-[9.5px] text-neutral-500">
                                                <div className="flex justify-between">
                                                    <span>Invoice</span>
                                                    <span className="font-semibold text-neutral-700">
                                                        {id}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span>VAT Reg.</span>
                                                    <span>{vatReg}</span>
                                                </div>

                                                {registration && (
                                                    <div className="flex justify-between">
                                                        <span>Vehicle</span>
                                                        <span className="font-bold text-neutral-700">
                                                            {registration}
                                                        </span>
                                                    </div>
                                                )}

                                                {jobId && (
                                                    <div className="flex justify-between">
                                                        <span>Job Card</span>
                                                        <span>{jobId}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="my-3 border-t border-dashed border-neutral-300" />

                                            {/* Items */}
                                            <div className="mb-1 flex justify-between text-[9px] font-bold uppercase text-neutral-500">
                                                <span>Description</span>
                                                <span>Amount</span>
                                            </div>

                                            {items.map((item) => (
                                                <div
                                                    key={item.sku}
                                                    className="mb-1 flex justify-between gap-2"
                                                >
                                                    <span className="min-w-0 truncate">
                                                        {item.name.slice(0, 24)}{" "}
                                                        x{item.qty}
                                                    </span>

                                                    <span className="shrink-0">
                                                        {fmt(
                                                            item.price *
                                                                item.qty,
                                                        )}
                                                    </span>
                                                </div>
                                            ))}

                                            <div className="my-3 border-t border-dashed border-neutral-300" />

                                            <div className="space-y-0.5">
                                                <div className="flex justify-between">
                                                    <span>Subtotal</span>
                                                    <span>
                                                        {fmt(subtotal)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span>VAT 16%</span>
                                                    <span>{fmt(vat)}</span>
                                                </div>

                                                <div className="mt-1 flex justify-between text-[12px] font-bold">
                                                    <span>TOTAL KSh</span>
                                                    <span>{fmt(total)}</span>
                                                </div>
                                            </div>

                                            <div className="my-3 border-t border-dashed border-neutral-300" />

                                            {/* Payment */}
                                            <div className="text-center">
                                                <div className="font-bold">
                                                    PAYMENT
                                                </div>

                                                <div className="mt-1 text-neutral-500">
                                                    {isMpesa
                                                        ? "M-Pesa"
                                                        : "Cash payment"}
                                                </div>

                                                {isMpesa && mpesaRef && (
                                                    <div className="mt-0.5 font-bold text-neutral-700">
                                                        Ref: {mpesaRef}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 text-center text-[8.5px] leading-relaxed text-neutral-400">
                                                Thank you for your business.
                                                <br />
                                                Please retain this receipt for
                                                your records.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ═════════════════════════════════
                                    GATE PASS
                                ══════════════════════════════════ */}
                                {/* <div className="w-full max-w-[330px]">
                                    <div className="mb-2 flex items-center justify-between px-1 print:hidden">
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                            <ShieldCheck size={12} />
                                            Clearance
                                        </div>

                                        <div className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[9px] text-[var(--text-faint)]">
                                            Gate pass
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-lg bg-white text-neutral-900 shadow-lg">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                                                    <ShieldCheck
                                                        size={20}
                                                        className="text-neutral-800"
                                                    />
                                                </div>

                                                <div className="text-sm font-bold">
                                                    SECURITY GATE PASS
                                                </div>

                                                <div className="mt-1 text-[9px] uppercase tracking-wider text-neutral-500">
                                                    Vehicle clearance document
                                                </div>
                                            </div>

                                            <div className="my-4 border-t border-dashed border-neutral-300" />

                                            <div className="text-center">
                                                <div className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                                                    Vehicle registration
                                                </div>

                                                <div className="mt-1 font-mono text-2xl font-bold tracking-wide">
                                                    {registration ||
                                                        "N/A — RETAIL SALE"}
                                                </div>
                                            </div>

                                            {jobId && (
                                                <div className="mt-4 rounded-md bg-neutral-100 px-3 py-2.5">
                                                    <div className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                                                        Job card
                                                    </div>

                                                    <div className="mt-0.5 font-mono text-sm font-bold">
                                                        {jobId}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 rounded-md bg-neutral-900 px-3 py-3 text-center text-white">
                                                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold">
                                                    <CircleCheck size={14} />
                                                    PAYMENT CLEARED
                                                </div>

                                                <div className="mt-1 text-[9px] text-neutral-300">
                                                    Vehicle cleared for exit
                                                </div>
                                            </div>

                                            <div
                                                className="mt-5 h-9"
                                                style={{
                                                    background:
                                                        "repeating-linear-gradient(90deg,#1a1a1a 0 2px,transparent 2px 5px)",
                                                }}
                                            />

                                            <div className="mt-1 text-center font-mono text-[8.5px] text-neutral-500">
                                                {id}
                                            </div>

                                            <div className="mt-4 border-t border-neutral-200 pt-3 text-center text-[8.5px] leading-relaxed text-neutral-400">
                                                Present this clearance slip at
                                                the security gate.
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </section>

                    {/* TRANSACTION SUMMARY */}
                    <aside className="space-y-5">
                        {/* Payment summary */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="mb-4 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--secondary-dim)]">
                                    <CircleCheck
                                        size={17}
                                        className="text-[var(--secondary)]"
                                    />
                                </div>

                                <div>
                                    <div className="text-sm font-bold text-[var(--text)]">
                                        Payment complete
                                    </div>

                                    <div className="text-[10px] text-[var(--text-muted)]">
                                        Transaction successfully recorded
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-[var(--surface-alt)] px-4 py-4 text-center">
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Total paid
                                </div>

                                <div className="mt-1 font-mono text-2xl font-bold text-[var(--primary)]">
                                    {currency(total)}
                                </div>
                            </div>

                            <div className="mt-4 space-y-2.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">
                                        Payment method
                                    </span>

                                    <span className="font-semibold text-[var(--text)]">
                                        {isMpesa ? "M-Pesa" : "Cash"}
                                    </span>
                                </div>

                                {isMpesa && mpesaRef && (
                                    <div className="flex justify-between gap-3 text-xs">
                                        <span className="text-[var(--text-muted)]">
                                            M-Pesa reference
                                        </span>

                                        <span className="font-mono font-semibold text-[var(--text)]">
                                            {mpesaRef}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">
                                        Subtotal
                                    </span>

                                    <span className="font-mono text-[var(--text)]">
                                        {currency(subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">
                                        VAT
                                    </span>

                                    <span className="font-mono text-[var(--text)]">
                                        {currency(vat)}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t border-[var(--border)] pt-2.5 text-sm font-bold">
                                    <span>Total</span>

                                    <span className="font-mono text-[var(--primary)]">
                                        {currency(total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Job / vehicle card */}
                        {/* {(jobId || registration) && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                                <div className="mb-4 flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dim)]">
                                        <Car
                                            size={16}
                                            className="text-[var(--primary)]"
                                        />
                                    </div>

                                    <div>
                                        <div className="text-sm font-bold text-[var(--text)]">
                                            Vehicle clearance
                                        </div>

                                        <div className="text-[10px] text-[var(--text-muted)]">
                                            Payment linked to vehicle
                                        </div>
                                    </div>
                                </div>

                                {registration && (
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                                        <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                                            Registration
                                        </div>

                                        <div className="mt-1 font-mono text-lg font-bold text-[var(--text)]">
                                            {registration}
                                        </div>
                                    </div>
                                )}

                                {jobId && (
                                    <div className="mt-2 flex items-center justify-between rounded-lg bg-[var(--surface-alt)] px-4 py-3">
                                        <span className="text-xs text-[var(--text-muted)]">
                                            Job card
                                        </span>

                                        <span className="font-mono text-xs font-semibold text-[var(--text)]">
                                            {jobId}
                                        </span>
                                    </div>
                                )}

                                {registration && (
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/customers/${registration}/history`,
                                            )
                                        }
                                        className="mt-3 flex w-full items-center justify-between rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    >
                                        <span>
                                            View vehicle service history
                                        </span>

                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        )} */}

                        {/* Actions */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 print:hidden">
                            <div className="text-sm font-bold text-[var(--text)]">
                                Actions
                            </div>

                            <div className="mt-4 space-y-2">
                                <Button
                                    variant="primary"
                                    onClick={printDocuments}
                                    className="w-full justify-center"
                                >
                                    <Printer size={14} />
                                    Print documents
                                </Button>

                                {registration && (
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/customers/${registration}/history`,
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    >
                                        View service history
                                        <ChevronRight size={13} />
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate("/pos")}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                >
                                    <Plus size={13} />
                                    Start new sale
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Print-specific styles */}
            <style>
                {`
                    @media print {
                        @page {
                            margin: 12mm;
                        }

                        body {
                            background: white !important;
                        }

                        button,
                        aside,
                        .print\\:hidden {
                            display: none !important;
                        }

                        .shadow-lg {
                            box-shadow: none !important;
                        }

                        .border {
                            border-color: #ddd !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}
