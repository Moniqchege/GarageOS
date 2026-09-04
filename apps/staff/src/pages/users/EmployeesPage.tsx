import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Banknote,
    BriefcaseBusiness,
    Plus,
    Search,
    Users,
    X,
} from "lucide-react";

import { users, payroll, useApi, useMutation } from "@garage/api-client";
import type { PayMethod } from "@garage/types";
import {
    Badge,
    Button,
    Field,
    Input,
    Select,
    Table,
} from "@garage/ui";

const SYSTEM_ROLES = [
    "System Administrator",
    "Lead Mechanic",
    "Mechanic",
];

const PAY_METHODS: PayMethod[] = [
    "Commission",
    "Daily rate",
    "Daily rate + commission",
    "Fixed monthly",
];

type FormState = {
    name: string;
    phone: string;
    role: string;
    pin: string;
    payMethod: PayMethod;
    rate: string;
    commissionRate: string;
    loginEnabled: boolean;
};

const emptyForm: FormState = {
    name: "",
    phone: "",
    role: "Storekeeper",
    pin: "",
    payMethod: "Commission",
    rate: "",
    commissionRate: "",
    loginEnabled: true,
};

function formatMoney(value: number) {
    return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

function formatPayLabel(employee: {
    payMethod?: string;
    rate?: number | null;
    commissionRate?: number | null;
}): string {
    const { payMethod, rate, commissionRate } = employee;

    if (!payMethod) return "Not configured";

    const parts: string[] = [payMethod];

    if (
        (payMethod === "Daily rate" ||
            payMethod === "Daily rate + commission" ||
            payMethod === "Fixed monthly") &&
        rate != null
    ) {
        parts.push(
            payMethod === "Fixed monthly"
                ? `${formatMoney(rate)}/mo`
                : `${formatMoney(rate)}/day`,
        );
    }

    if (
        (payMethod === "Commission" ||
            payMethod === "Daily rate + commission") &&
        commissionRate != null
    ) {
        parts.push(`${commissionRate}%`);
    }

    return parts.join(" · ");
}

export function EmployeesPage() {
    const { data, loading, error, refetch } = useApi(
        () => users.list(),
        [],
    );

    const { mutate: createUser, loading: saving } = useMutation(
        async (form: FormState) =>
            users.create({
                name: form.name,
                role: form.role,
                phone: form.phone,
                pin: form.loginEnabled ? form.pin : "",
                loginEnabled: form.loginEnabled,
                status: "Active",
                payMethod: form.payMethod,
                rate:
                    form.payMethod === "Daily rate" ||
                    form.payMethod === "Daily rate + commission" ||
                    form.payMethod === "Fixed monthly"
                        ? form.rate
                            ? Number(form.rate)
                            : null
                        : null,
                commissionRate:
                    form.payMethod === "Commission" ||
                    form.payMethod === "Daily rate + commission"
                        ? form.commissionRate
                            ? Number(form.commissionRate)
                            : null
                        : null,
            }),
    );

    const { mutate: toggleStatus } = useMutation(
        ({
            id,
            status,
        }: {
            id: string;
            status: "Active" | "Suspended";
        }) => users.setStatus(id, status),
    );

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All");
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);

    const list = data ?? [];

    const activeCount = list.filter(
        (employee) => employee.status === "Active",
    ).length;

    const commissionCount = list.filter(
        (employee) =>
            employee.payMethod === "Commission" ||
            employee.payMethod === "Daily rate + commission",
    ).length;

    const { year, month } = useMemo(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }, []);

    const { data: payrollData } = useApi(
        () => payroll.getPeriod(year, month),
        [year, month],
    );

    const outstandingPayroll = useMemo(() => {
        if (!payrollData) return 0;
        return payrollData.reduce(
            (sum, r) => sum + (r.paid ? 0 : r.earnings),
            0,
        );
    }, [payrollData]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return list.filter((employee) => {
            const matchesSearch =
                !q ||
                employee.name.toLowerCase().includes(q) ||
                employee.id.toLowerCase().includes(q) ||
                employee.role.toLowerCase().includes(q);

            const matchesStatus =
                statusFilter === "All" ||
                employee.status === statusFilter;

            const matchesRole =
                roleFilter === "All" ||
                employee.role === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [list, query, statusFilter, roleFilter]);

    const updateForm = <K extends keyof FormState>(
        key: K,
        value: FormState[K],
    ) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const openCreate = () => {
        setForm(emptyForm);
        setShowCreate(true);
    };

    const closeCreate = () => {
        if (saving) return;

        setShowCreate(false);
        setForm(emptyForm);
    };

    const save = async () => {
        if (!form.name.trim()) return;

        if (form.loginEnabled && form.pin.length !== 4) return;

        await createUser(form);

        setForm(emptyForm);
        setShowCreate(false);
        refetch();
    };

    const handleToggle = async (
        id: string,
        current: "Active" | "Suspended",
    ) => {
        await toggleStatus({
            id,
            status:
                current === "Active"
                    ? "Suspended"
                    : "Active",
        });

        refetch();
    };

    return (
        <div className="p-6">
            {/* Error */}
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
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text)]">
                        Employees
                    </h1>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Manage your garage staff, compensation and activity.
                    </p>
                </div>

                <Button
                    variant="primary"
                    onClick={openCreate}
                >
                    <Plus size={15} />
                    Add employee
                </Button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<Users size={17} />}
                    label="Total employees"
                    value={list.length}
                />

                <StatCard
                    icon={<BriefcaseBusiness size={17} />}
                    label="Active"
                    value={activeCount}
                />

                <StatCard
                    icon={<Banknote size={17} />}
                    label="Commission based"
                    value={commissionCount}
                />

                <StatCard
                    icon={<Banknote size={17} />}
                    label="Outstanding payroll"
                    value={formatMoney(outstandingPayroll)}
                />
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <Input
                        className="w-full pl-9"
                        placeholder="Search by name, employee ID or role"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <Select
                    className="lg:w-44"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="All">
                        All roles
                    </option>

                    {SYSTEM_ROLES.map((role) => (
                        <option
                            key={role}
                            value={role}
                        >
                            {role}
                        </option>
                    ))}
                </Select>

                <Select
                    className="lg:w-36"
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="All">
                        All status
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Suspended">
                        Inactive
                    </option>
                </Select>
            </div>

            {/* Employee table */}
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-bold">
                                <Users
                                    size={15}
                                    className="text-[var(--primary)]"
                                />

                                Employee directory
                            </h2>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                {filtered.length} employee
                                {filtered.length === 1
                                    ? ""
                                    : "s"}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-2 p-5">
                        {[1, 2, 3, 4, 5].map((n) => (
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
                            "Role",
                            "Pay method",
                            "Current earnings",
                            "Status",
                            "",
                        ]}
                        rows={filtered.map((employee) => [
                            <Link
                                key={`${employee.id}-name`}
                                to={`/employees/${employee.id}`}
                                className="block"
                            >
                                <div className="font-semibold hover:text-[var(--primary)]">
                                    {employee.name}
                                </div>

                                <div className="font-mono text-[10px] text-[var(--text-muted)]">
                                    {employee.id}
                                </div>
                            </Link>,

                            employee.role,

                            <span className="text-xs text-[var(--text-muted)]">
                                {formatPayLabel(employee)}
                            </span>,

                            <span className="text-sm font-semibold">
                                —
                            </span>,

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
                            </Badge>,

                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    to={`/employees/${employee.id}`}
                                    className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                                >
                                    View
                                </Link>

                                <button
                                    onClick={() =>
                                        handleToggle(
                                            employee.id,
                                            employee.status,
                                        )
                                    }
                                    className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                                >
                                    {employee.status === "Active"
                                        ? "Deactivate"
                                        : "Reactivate"}
                                </button>
                            </div>,
                        ])}
                    />
                )}
            </div>

            {/* =====================================================
                CREATE EMPLOYEE MODAL
               ===================================================== */}
            {showCreate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-employee-title"
                >
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Close"
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={closeCreate}
                    />

                    {/* Centered modal */}
                    <div
                        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-6 py-4">
                            <div>
                                <h2
                                    id="create-employee-title"
                                    className="text-base font-bold text-[var(--text)]"
                                >
                                    New employee
                                </h2>

                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    Add a staff member to your garage.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCreate}
                                disabled={saving}
                                aria-label="Close dialog"
                                className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="overflow-y-auto px-6 py-5">
                            {/* Personal information */}
                            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Personal information
                            </h3>

                            <Field label="Full employee name">
                                <Input
                                    autoFocus
                                    value={form.name}
                                    onChange={(e) =>
                                        updateForm(
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. John Kariuki"
                                />
                            </Field>

                            <Field
                                label="Phone number"
                                className="mt-3.5"
                            >
                                <Input
                                    value={form.phone}
                                    onChange={(e) =>
                                        updateForm(
                                            "phone",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="07xx xxx xxx"
                                />
                            </Field>

                            <Field
                                label="Role"
                                className="mt-3.5"
                            >
                                <Select
                                    value={form.role}
                                    onChange={(e) =>
                                        updateForm(
                                            "role",
                                            e.target.value,
                                        )
                                    }
                                >
                                    {SYSTEM_ROLES.map((role) => (
                                        <option key={role}>
                                            {role}
                                        </option>
                                    ))}
                                </Select>
                            </Field>

                            {/* Compensation */}
                            <div className="my-6 border-t border-[var(--border)]" />

                            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Compensation
                            </h3>

                            <Field label="Pay method">
                                <Select
                                    value={form.payMethod}
                                    onChange={(e) =>
                                        updateForm(
                                            "payMethod",
                                            e.target.value as PayMethod,
                                        )
                                    }
                                >
                                    {PAY_METHODS.map((method) => (
                                        <option key={method}>
                                            {method}
                                        </option>
                                    ))}
                                </Select>
                            </Field>

                            {(form.payMethod === "Daily rate" ||
                                form.payMethod ===
                                    "Daily rate + commission") && (
                                <Field
                                    label="Daily rate (KSh)"
                                    className="mt-3.5"
                                >
                                    <Input
                                        inputMode="decimal"
                                        value={form.rate}
                                        onChange={(e) =>
                                            updateForm(
                                                "rate",
                                                e.target.value.replace(
                                                    /[^\d.]/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        placeholder="e.g. 1,500"
                                    />
                                </Field>
                            )}

                            {form.payMethod === "Fixed monthly" && (
                                <Field
                                    label="Monthly salary (KSh)"
                                    className="mt-3.5"
                                >
                                    <Input
                                        inputMode="decimal"
                                        value={form.rate}
                                        onChange={(e) =>
                                            updateForm(
                                                "rate",
                                                e.target.value.replace(
                                                    /[^\d.]/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        placeholder="e.g. 35,000"
                                    />
                                </Field>
                            )}

                            {(form.payMethod === "Commission" ||
                                form.payMethod ===
                                    "Daily rate + commission") && (
                                <Field
                                    label="Commission rate (%)"
                                    className="mt-3.5"
                                >
                                    <Input
                                        inputMode="decimal"
                                        value={form.commissionRate}
                                        onChange={(e) =>
                                            updateForm(
                                                "commissionRate",
                                                e.target.value.replace(
                                                    /[^\d.]/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        placeholder="e.g. 20"
                                    />
                                </Field>
                            )}

                            {/* System access */}
                            <div className="my-6 border-t border-[var(--border)]" />

                            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                System access
                            </h3>

                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-3">
                                <input
                                    type="checkbox"
                                    checked={form.loginEnabled}
                                    onChange={(e) =>
                                        updateForm(
                                            "loginEnabled",
                                            e.target.checked,
                                        )
                                    }
                                    className="mt-0.5"
                                />

                                <span>
                                    <span className="block text-sm font-semibold">
                                        Allow system login
                                    </span>

                                    <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                                        Give this employee access to the
                                        garage system.
                                    </span>
                                </span>
                            </label>

                            {form.loginEnabled && (
                                <Field
                                    label="4-digit secure PIN"
                                    className="mt-3.5"
                                >
                                    <Input
                                        maxLength={4}
                                        inputMode="numeric"
                                        type="password"
                                        value={form.pin}
                                        onChange={(e) =>
                                            updateForm(
                                                "pin",
                                                e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 4),
                                            )
                                        }
                                        placeholder="••••"
                                    />
                                </Field>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex shrink-0 gap-3 border-t border-[var(--border)] px-6 py-4">
                            <Button
                                variant="secondary"
                                onClick={closeCreate}
                                disabled={saving}
                                className="flex-1 justify-center"
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="primary"
                                onClick={save}
                                disabled={
                                    saving ||
                                    !form.name.trim() ||
                                    (form.loginEnabled &&
                                        form.pin.length !== 4)
                                }
                                className="flex-1 justify-center"
                            >
                                {saving
                                    ? "Creating…"
                                    : "Create employee"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center gap-2 text-[var(--text-muted)]">
                <span className="rounded-lg bg-[var(--surface-alt)] p-2 text-[var(--primary)]">
                    {icon}
                </span>

                <span className="text-xs font-medium">
                    {label}
                </span>
            </div>

            <div className="text-xl font-bold">
                {value}
            </div>
        </div>
    );
}