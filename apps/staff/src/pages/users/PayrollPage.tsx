import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Banknote,
    CheckCircle2,
    Clock3,
    Wallet,
} from "lucide-react";

import { payroll, useApi, useMutation } from "@garage/api-client";
import type { PayrollRow } from "@garage/types";
import { Badge, Button, Table } from "@garage/ui";

function formatMoney(value: number) {
    return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

function payMethodShort(row: PayrollRow): string {
    switch (row.payMethod) {
        case "Commission":
            return `${row.commissionRate ?? 0}% commission`;
        case "Daily rate":
            return `${formatMoney(row.rate ?? 0)}/day`;
        case "Daily rate + commission":
            return `${formatMoney(row.rate ?? 0)}/day + ${row.commissionRate ?? 0}%`;
        case "Fixed monthly":
            return `${formatMoney(row.rate ?? 0)}/month`;
        default:
            return row.payMethod;
    }
}

export function PayrollPage() {
    const [monthOffset, setMonthOffset] = useState(0);

    // Derive year + month (1-based) from the offset
    const { year, month, label } = useMemo(() => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() + monthOffset);
        return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            label: d.toLocaleDateString("en-KE", {
                month: "long",
                year: "numeric",
            }),
        };
    }, [monthOffset]);

    const {
        data,
        loading,
        error,
        refetch,
    } = useApi(
        () => payroll.getPeriod(year, month),
        [year, month],
    );

    const rows: PayrollRow[] = data ?? [];

    const totals = rows.reduce(
        (acc, r) => ({
            earnings: acc.earnings + r.earnings,
            paid:     acc.paid + (r.paid ? r.earnings : 0),
            balance:  acc.balance + (r.paid ? 0 : r.earnings),
        }),
        { earnings: 0, paid: 0, balance: 0 },
    );

    return (
        <div className="p-6">
            {error && (
                <div className="mb-5 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error} —{" "}
                    <button className="font-bold underline" onClick={refetch}>
                        retry
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl font-bold">Payroll</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Track employee earnings, payments and outstanding balances.
                    </p>
                </div>
            </div>

            {/* Period selector */}
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <button
                    onClick={() => setMonthOffset((v) => v - 1)}
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                    aria-label="Previous month"
                >
                    <ArrowLeft size={15} />
                </button>

                <div className="text-sm font-bold">{label}</div>

                <button
                    onClick={() => setMonthOffset((v) => v + 1)}
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                    aria-label="Next month"
                >
                    <ArrowRight size={15} />
                </button>
            </div>

            {/* Summary cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <PayrollStat
                    icon={<Banknote size={17} />}
                    label="Total earnings"
                    value={formatMoney(totals.earnings)}
                />
                <PayrollStat
                    icon={<CheckCircle2 size={17} />}
                    label="Already paid"
                    value={formatMoney(totals.paid)}
                />
                <PayrollStat
                    icon={<Clock3 size={17} />}
                    label="Outstanding"
                    value={formatMoney(totals.balance)}
                />
            </div>

            {/* Payroll table */}
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] p-5">
                    <h2 className="flex items-center gap-2 text-sm font-bold">
                        <Wallet size={15} className="text-[var(--primary)]" />
                        {label} payroll
                    </h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Employee earnings and payments for this period.
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-2 p-5">
                        {[1, 2, 3, 4].map((n) => (
                            <div
                                key={n}
                                className="h-12 animate-pulse rounded bg-[var(--surface-alt)]"
                            />
                        ))}
                    </div>
                ) : (
                    <Table
                        head={[
                            "Employee",
                            "Pay method",
                            "Jobs",
                            "Labor",
                            "Earnings",
                            "Status",
                            "",
                        ]}
                        rows={rows.map((row) => [
                            // Employee name + role
                            <Link
                                to={`/employees/${row.employeeId}`}
                                className="block"
                            >
                                <div className="font-semibold hover:text-[var(--primary)]">
                                    {row.name}
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)]">
                                    {row.role}
                                </div>
                            </Link>,

                            // Pay method summary
                            <span className="text-xs text-[var(--text-muted)]">
                                {payMethodShort(row)}
                            </span>,

                            // Jobs completed
                            <span className="tabular-nums">
                                {row.jobsCompleted}
                            </span>,

                            // Labor revenue generated
                            <span className="tabular-nums text-[var(--text-muted)]">
                                {formatMoney(row.laborGenerated)}
                            </span>,

                            // Calculated earnings
                            <span className="font-semibold tabular-nums">
                                {formatMoney(row.earnings)}
                            </span>,

                            // Paid badge
                            <Badge variant={row.paid ? "success" : "danger"}>
                                {row.paid ? "Paid" : "Pending"}
                            </Badge>,

                            // Actions
                            <div className="flex items-center justify-end gap-2">
                                <MarkPaidButton
                                    row={row}
                                    year={year}
                                    month={month}
                                    onDone={refetch}
                                />
                                <Link
                                    to={`/employees/${row.employeeId}`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                                >
                                    View
                                    <ArrowRight size={12} />
                                </Link>
                            </div>,
                        ])}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Mark-paid button ────────────────────────────────────────────────────────

function MarkPaidButton({
    row,
    year,
    month,
    onDone,
}: {
    row: PayrollRow;
    year: number;
    month: number;
    onDone: () => void;
}) {
    const { mutate, loading } = useMutation(() =>
        payroll.markPaid(row.employeeId, year, month, !row.paid),
    );

    const handleClick = async () => {
        await mutate();
        onDone();
    };

    if (row.paid) {
        return (
            <button
                onClick={handleClick}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)] disabled:opacity-50"
            >
                {loading ? "…" : "Unmark"}
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading || row.earnings === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
            {loading ? "…" : "Mark paid"}
        </button>
    );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function PayrollStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="rounded-lg bg-[var(--surface-alt)] p-2 text-[var(--primary)]">
                    {icon}
                </span>
                {label}
            </div>
            <div className="mt-3 text-xl font-bold">{value}</div>
        </div>
    );
}
