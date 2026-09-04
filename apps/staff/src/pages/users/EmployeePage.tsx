import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Banknote,
    BriefcaseBusiness,
    Car,
    Clock3,
    History,
    KeyRound,
    Phone,
    User,
    Wallet,
    Wrench,
} from "lucide-react";

import { users, useApi, useMutation } from "@garage/api-client";
import type { EmployeeActivityJob } from "@garage/api-client";
import { Badge, Button, Field, Input, Select } from "@garage/ui";

const PAY_METHODS = [
    "Commission",
    "Daily rate",
    "Daily rate + commission",
    "Fixed monthly",
];

function formatMoney(value: number) {
    return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

export function EmployeePage() {
    const { employeeId } = useParams<{ employeeId: string }>();

    const { data, loading, error, refetch } = useApi(
        () => users.get(employeeId!),
        [employeeId],
    );

    const [tab, setTab] = useState<
        "overview" | "compensation" | "activity"
    >("overview");

    if (loading) {
        return (
            <div className="p-6">
                <div className="h-6 w-48 animate-pulse rounded bg-[var(--surface-alt)]" />

                <div className="mt-5 h-32 animate-pulse rounded-xl bg-[var(--surface-alt)]" />

                <div className="mt-4 h-64 animate-pulse rounded-xl bg-[var(--surface-alt)]" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <Link
                    to="/employees"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                    <ArrowLeft size={15} />
                    Employees
                </Link>

                <div className="rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] p-5 text-sm text-[var(--danger)]">
                    {error ?? "Employee not found"}

                    <button
                        onClick={refetch}
                        className="ml-2 font-bold underline"
                    >
                        retry
                    </button>
                </div>
            </div>
        );
    }

    const employee = data;

    return (
        <div className="p-4">
            {/* Breadcrumb */}
            <Link
                to="/employees"
            >
                <Button variant="secondary" className="mb-2">
                    <ArrowLeft size={15} />
                    Employees
                </Button>
            </Link>

            {/* Employee header */}
            <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-alt)] text-[var(--primary)]">
                        <User size={24} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg font-bold">
                                {employee.name}
                            </h1>

                            <Badge
                                variant={
                                    employee.status === "Active"
                                        ? "success"
                                        : "danger"
                                }
                            >
                                {employee.status === "Active"
                                    ? "Active"
                                    : "Inactive"}
                            </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                            <span className="font-mono">
                                {employee.id}
                            </span>

                            <span>{employee.role}</span>

                            {employee.phone && (
                                <span className="inline-flex items-center gap-1">
                                    <Phone size={11} />
                                    {employee.phone}
                                </span>
                            )}
                        </div>
                    </div>

                    <Link to={`/employees/${employee.id}/edit`}>
                        <Button variant="secondary">
                            Edit Employee
                        </Button>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex border-t border-[var(--border)] px-5">
                    <TabButton
                        active={tab === "overview"}
                        onClick={() => setTab("overview")}
                    >
                        Overview
                    </TabButton>

                    <TabButton
                        active={tab === "compensation"}
                        onClick={() => setTab("compensation")}
                    >
                        Compensation
                    </TabButton>

                    <TabButton
                        active={tab === "activity"}
                        onClick={() => setTab("activity")}
                    >
                        Activity
                    </TabButton>
                </div>
            </div>

            {tab === "overview" && (
                <OverviewTab employee={employee} />
            )}
            
            {tab === "compensation" && (
                <CompensationTab employee={employee} refetch={refetch} />
            )}

            {tab === "activity" && (
                <ActivityTab employee={employee} />
            )}
        </div>
    );
}

function OverviewTab({ employee }: { employee: any }) {
    const payLabel = formatPayLabel(employee);

    return (
        <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
                <SectionTitle
                    icon={<User size={15} />}
                    title="Personal information"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem label="Full name" value={employee.name} />

                    <InfoItem
                        label="Employee ID"
                        value={employee.id}
                        mono
                    />

                    <InfoItem
                        label="Phone"
                        value={employee.phone || "—"}
                    />

                    <InfoItem
                        label="Role"
                        value={employee.role}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <SectionTitle
                    icon={<Wallet size={15} />}
                    title="Current pay"
                />

                <div className="text-sm text-[var(--text-muted)]">
                    Pay method
                </div>

                <div className="mt-1 text-base font-bold">
                    {employee.payMethod ?? "Not configured"}
                </div>

                {payLabel && (
                    <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {payLabel}
                    </div>
                )}

                <div className="mt-5 text-sm text-[var(--text-muted)]">
                    Current earnings
                </div>

                <div className="mt-1 text-2xl font-bold">
                    —
                </div>

                <Link
                    to="/payroll"
                    className="mt-5 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                    View payroll →
                </Link>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
                <SectionTitle
                    icon={<BriefcaseBusiness size={15} />}
                    title="This period"
                />

                <div className="grid gap-4 sm:grid-cols-4">
                    <Metric label="Jobs completed" value="—" />

                    <Metric label="Labor generated" value="—" />

                    <Metric label="Earned" value="—" />

                    <Metric label="Paid" value="—" />
                </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <SectionTitle
                    icon={<KeyRound size={15} />}
                    title="System access"
                />

                <div className="flex items-center justify-between">
                    <span className="text-sm">
                        Login access
                    </span>

                    <Badge variant="success">Enabled</Badge>
                </div>

                <div className="mt-4 text-xs text-[var(--text-muted)]">
                    Last login
                </div>

                <div className="mt-1 text-sm">
                    {employee.lastLogin || "Never"}
                </div>

                <Button
                    variant="secondary"
                    className="mt-4 w-full justify-center"
                >
                    Manage access
                </Button>
            </div>
        </div>
    );
}

function formatPayLabel(employee: any): string | null {
    const { payMethod, rate, commissionRate } = employee;

    if (!payMethod) return null;

    const parts: string[] = [];

    if (
        (payMethod === "Daily rate" ||
            payMethod === "Daily rate + commission") &&
        rate != null
    ) {
        parts.push(`${formatMoney(rate)}/day`);
    }

    if (payMethod === "Fixed monthly" && rate != null) {
        parts.push(`${formatMoney(rate)}/month`);
    }

    if (
        (payMethod === "Commission" ||
            payMethod === "Daily rate + commission") &&
        commissionRate != null
    ) {
        parts.push(`${commissionRate}% commission`);
    }

    return parts.length ? parts.join(" · ") : null;
}

function CompensationTab({
    employee,
    refetch,
}: {
    employee: any;
    refetch: () => void;
}) {
    const [payMethod, setPayMethod] = useState<string>(
        employee.payMethod ?? "Commission",
    );
    const [rate, setRate] = useState(
        employee.rate != null ? String(employee.rate) : "",
    );
    const [commissionRate, setCommissionRate] = useState(
        employee.commissionRate != null
            ? String(employee.commissionRate)
            : "",
    );
    const [saved, setSaved] = useState(false);

    const { mutate: saveCompensation, loading: saving, error } = useMutation(
        () =>
            users.updateCompensation(employee.id, {
                payMethod: payMethod as any,
                rate:
                    payMethod === "Daily rate" ||
                    payMethod === "Daily rate + commission" ||
                    payMethod === "Fixed monthly"
                        ? rate
                            ? Number(rate)
                            : null
                        : null,
                commissionRate:
                    payMethod === "Commission" ||
                    payMethod === "Daily rate + commission"
                        ? commissionRate
                            ? Number(commissionRate)
                            : null
                        : null,
            }),
    );

    const handleSave = async () => {
        setSaved(false);
        await saveCompensation();
        setSaved(true);
        refetch();
    };

    return (
        <div className="max-w-3xl">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <SectionTitle
                    icon={<Banknote size={15} />}
                    title="Compensation"
                />

                <p className="mb-6 text-xs text-[var(--text-muted)]">
                    Define how this employee is paid. This will be used
                    by payroll when calculating earnings.
                </p>

                {error && (
                    <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-3 py-2 text-xs text-[var(--danger)]">
                        {error}
                    </div>
                )}

                <Field label="Pay method">
                    <Select
                        value={payMethod}
                        onChange={(e) => {
                            setPayMethod(e.target.value);
                            setSaved(false);
                        }}
                    >
                        {PAY_METHODS.map((method) => (
                            <option key={method}>
                                {method}
                            </option>
                        ))}
                    </Select>
                </Field>

                {(payMethod === "Daily rate" ||
                    payMethod === "Daily rate + commission") && (
                    <Field
                        label="Daily rate (KSh)"
                        className="mt-4"
                    >
                        <Input
                            inputMode="decimal"
                            value={rate}
                            onChange={(e) => {
                                setRate(e.target.value.replace(/[^\d.]/g, ""));
                                setSaved(false);
                            }}
                            placeholder="e.g. 1,500"
                        />
                    </Field>
                )}

                {payMethod === "Fixed monthly" && (
                    <Field
                        label="Monthly salary (KSh)"
                        className="mt-4"
                    >
                        <Input
                            inputMode="decimal"
                            value={rate}
                            onChange={(e) => {
                                setRate(e.target.value.replace(/[^\d.]/g, ""));
                                setSaved(false);
                            }}
                            placeholder="e.g. 35,000"
                        />
                    </Field>
                )}

                {(payMethod === "Commission" ||
                    payMethod === "Daily rate + commission") && (
                    <Field
                        label="Commission rate (%)"
                        className="mt-4"
                    >
                        <Input
                            inputMode="decimal"
                            value={commissionRate}
                            onChange={(e) => {
                                setCommissionRate(
                                    e.target.value.replace(/[^\d.]/g, ""),
                                );
                                setSaved(false);
                            }}
                            placeholder="e.g. 20"
                        />
                    </Field>
                )}

                <div className="mt-7 flex items-center justify-end gap-3">
                    {saved && !saving && (
                        <span className="text-xs font-medium text-[var(--primary)]">
                            Saved
                        </span>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : "Save compensation"}
                    </Button>
                </div>
            </div>

            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <SectionTitle
                    icon={<History size={15} />}
                    title="Compensation history"
                />

                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                    No compensation history yet.
                </div>
            </div>
        </div>
    );
}

function ActivityTab({ employee }: { employee: any }) {
    const { data: activity, loading, error } = useApi(
        () => users.getActivity(employee.id),
        [employee.id],
    );

    const formatDate = (ts: number | null) => {
        if (!ts) return "—";
        return new Date(ts).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatMoney = (n: number) =>
        `KSh ${Math.round(n).toLocaleString("en-KE")}`;

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] p-5">
                <SectionTitle
                    icon={<Clock3 size={15} />}
                    title="Job Activity"
                />
                <p className="text-xs text-[var(--text-muted)]">
                    Completed job cards assigned to {employee.name}.
                </p>
            </div>

            {loading && (
                <div className="space-y-3 p-5">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-14 animate-pulse rounded-lg bg-[var(--surface-alt)]"
                        />
                    ))}
                </div>
            )}

            {error && (
                <div className="p-5 text-sm text-[var(--danger)]">
                    Failed to load activity — {error}
                </div>
            )}

            {!loading && !error && (!activity || activity.length === 0) && (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Wrench size={28} className="text-[var(--text-muted)]" />
                    <p className="text-sm font-semibold text-[var(--text)]">
                        No completed jobs yet
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                        Completed job cards assigned to this employee will appear here.
                    </p>
                </div>
            )}

            {!loading && activity && activity.length > 0 && (
                <div className="divide-y divide-[var(--border)]">
                    {activity.map((job) => (
                        <ActivityRow
                            key={job.id}
                            job={job}
                            formatDate={formatDate}
                            formatMoney={formatMoney}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ActivityRow({
    job,
    formatDate,
    formatMoney,
}: {
    job: EmployeeActivityJob;
    formatDate: (ts: number | null) => string;
    formatMoney: (n: number) => string;
}) {
    return (
        <Link
            to={`/jobs/${job.id}`}
            className="flex items-start gap-4 p-5 transition hover:bg-[var(--surface-alt)]"
        >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--secondary-dim)] text-[var(--secondary)]">
                <Wrench size={13} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                    <span className="text-sm font-semibold text-[var(--text)]">
                        {job.id}
                    </span>
                    <span className="text-xs font-semibold text-[var(--secondary)]">
                        {formatMoney(job.total)}
                    </span>
                </div>

                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Car size={11} />
                    <span>{job.vehicle}</span>
                    {job.customer && (
                        <>
                            <span>·</span>
                            <span>{job.customer}</span>
                        </>
                    )}
                </div>

                <div className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">
                    {job.faults}
                </div>

                <div className="mt-1.5 text-[10px] text-[var(--text-muted)]">
                    Completed {formatDate(job.completedAt)}
                </div>
            </div>
        </Link>
    );
}

function SectionTitle({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <h2 className="mb-5 flex items-center gap-2 text-sm font-bold">
            <span className="text-[var(--primary)]">
                {icon}
            </span>

            {title}
        </h2>
    );
}

function InfoItem({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div>
            <div className="text-xs text-[var(--text-muted)]">
                {label}
            </div>

            <div
                className={`mt-1 text-sm font-medium ${
                    mono ? "font-mono" : ""
                }`}
            >
                {value}
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <div className="text-xs text-[var(--text-muted)]">
                {label}
            </div>

            <div className="mt-1 text-lg font-bold">
                {value}
            </div>
        </div>
    );
}

function TabButton({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
                active
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
        >
            {children}
        </button>
    );
}