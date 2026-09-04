import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Banknote,
    BriefcaseBusiness,
    Clock3,
    History,
    KeyRound,
    Phone,
    User,
    Wallet,
} from "lucide-react";

import { users, useApi } from "@garage/api-client";
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
        <div className="p-6">
            {/* Breadcrumb */}
            <Link
                to="/employees"
                className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
            >
                <ArrowLeft size={15} />
                Employees
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
                            Edit employee
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
                <CompensationTab employee={employee} />
            )}

            {tab === "activity" && (
                <ActivityTab employee={employee} />
            )}
        </div>
    );
}

function OverviewTab({ employee }: { employee: any }) {
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
                    Not configured
                </div>

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

function CompensationTab({ employee }: { employee: any }) {
    const [payMethod, setPayMethod] = useState("Commission");
    const [rate, setRate] = useState("");
    const [commissionRate, setCommissionRate] = useState("");

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

                <Field label="Pay method">
                    <Select
                        value={payMethod}
                        onChange={(e) =>
                            setPayMethod(e.target.value)
                        }
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
                            value={rate}
                            onChange={(e) =>
                                setRate(e.target.value)
                            }
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
                            value={rate}
                            onChange={(e) =>
                                setRate(e.target.value)
                            }
                            placeholder="e.g. 35,000"
                        />
                    </Field>
                )}

                {(payMethod === "Commission" ||
                    payMethod ===
                        "Daily rate + commission") && (
                    <Field
                        label="Commission rate (%)"
                        className="mt-4"
                    >
                        <Input
                            value={commissionRate}
                            onChange={(e) =>
                                setCommissionRate(
                                    e.target.value,
                                )
                            }
                            placeholder="e.g. 20"
                        />
                    </Field>
                )}

                <div className="mt-7 flex justify-end">
                    <Button variant="primary">
                        Save compensation
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
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] p-5">
                <SectionTitle
                    icon={<Clock3 size={15} />}
                    title="Activity"
                />

                <div className="mt-4 flex gap-2">
                    {["All", "Jobs", "Payments", "System"].map(
                        (filter) => (
                            <button
                                key={filter}
                                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                            >
                                {filter}
                            </button>
                        ),
                    )}
                </div>
            </div>

            <div className="divide-y divide-[var(--border)]">
                <ActivityRow
                    time="Today, 09:42"
                    title="Activity will appear here"
                    description="Job, payment and system activity for this employee will be displayed here."
                />
            </div>
        </div>
    );
}

function ActivityRow({
    time,
    title,
    description,
}: {
    time: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4 p-5">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />

            <div>
                <div className="text-sm font-semibold">
                    {title}
                </div>

                <div className="mt-1 text-xs text-[var(--text-muted)]">
                    {description}
                </div>

                <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                    {time}
                </div>
            </div>
        </div>
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