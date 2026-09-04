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

import { users, useApi } from "@garage/api-client";
import { Badge, Button, Table } from "@garage/ui";

function formatMoney(value: number) {
    return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

export function PayrollPage() {
    const { data, loading, error, refetch } = useApi(
        () => users.list(),
        [],
    );

    const [monthOffset, setMonthOffset] = useState(0);

    const period = useMemo(() => {
        const date = new Date();

        date.setMonth(date.getMonth() + monthOffset);

        return date.toLocaleDateString("en-KE", {
            month: "long",
            year: "numeric",
        });
    }, [monthOffset]);

    const employees = data ?? [];

    /*
     * Placeholder values until payroll API is implemented.
     *
     * Keep these calculations here temporarily so the UI can be
     * developed independently from the backend.
     */
    const payrollRows = employees.map((employee) => ({
        employee,
        earnings: 0,
        paid: 0,
        balance: 0,
    }));

    const totals = payrollRows.reduce(
        (acc, row) => ({
            earnings: acc.earnings + row.earnings,
            paid: acc.paid + row.paid,
            balance: acc.balance + row.balance,
        }),
        {
            earnings: 0,
            paid: 0,
            balance: 0,
        },
    );

    return (
        <div className="p-6">
            {error && (
                <div className="mb-5 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error} —{" "}
                    <button
                        className="font-bold underline"
                        onClick={refetch}
                    >
                        retry
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl font-bold">
                        Payroll
                    </h1>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Track employee earnings, payments and outstanding
                        balances.
                    </p>
                </div>

                <Button variant="primary">
                    <Banknote size={15} />
                    Calculate payroll
                </Button>
            </div>

            {/* Period selector */}
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <button
                    onClick={() =>
                        setMonthOffset((value) => value - 1)
                    }
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                    <ArrowLeft size={15} />
                </button>

                <div className="text-sm font-bold">
                    {period}
                </div>

                <button
                    onClick={() =>
                        setMonthOffset((value) => value + 1)
                    }
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                    <ArrowRight size={15} />
                </button>
            </div>

            {/* Summary */}
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-bold">
                                <Wallet
                                    size={15}
                                    className="text-[var(--primary)]"
                                />
                                {period} payroll
                            </h2>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Employee earnings and payments for this
                                period.
                            </p>
                        </div>
                    </div>
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
                            "Earnings",
                            "Paid",
                            "Balance",
                            "Status",
                            "",
                        ]}
                        rows={payrollRows.map((row) => [
                            <Link
                                to={`/employees/${row.employee.id}`}
                                className="block"
                            >
                                <div className="font-semibold hover:text-[var(--primary)]">
                                    {row.employee.name}
                                </div>

                                <div className="text-[10px] text-[var(--text-muted)]">
                                    {row.employee.role}
                                </div>
                            </Link>,

                            <span className="font-semibold">
                                {formatMoney(row.earnings)}
                            </span>,

                            formatMoney(row.paid),

                            <span className="font-semibold">
                                {formatMoney(row.balance)}
                            </span>,

                            <Badge
                                variant={
                                    row.balance === 0
                                        ? "success"
                                        : "danger"
                                }
                            >
                                {row.balance === 0
                                    ? "Paid"
                                    : "Pending"}
                            </Badge>,

                            <Link
                                to={`/employees/${row.employee.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                            >
                                View
                                <ArrowRight size={12} />
                            </Link>,
                        ])}
                    />
                )}
            </div>
        </div>
    );
}

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

            <div className="mt-3 text-xl font-bold">
                {value}
            </div>
        </div>
    );
}