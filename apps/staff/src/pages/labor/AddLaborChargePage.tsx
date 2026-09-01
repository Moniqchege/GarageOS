import { FormEvent, useEffect, useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    CircleDollarSign,
    Tag,
    Wrench,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { labor, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Field, Input, Select } from "@garage/ui";

const categories = [
    "Diagnostics",
    "Suspension",
    "Brakes",
    "Engine & Servicing",
    "Electrical",
    "Bodywork",
];

type LaborForm = {
    name: string;
    category: string;
    price: string;
};

const emptyForm: LaborForm = {
    name: "",
    category: categories[0],
    price: "",
};

export function AddLaborChargePage() {
    const navigate = useNavigate();
    const { code } = useParams();

    const editing = Boolean(code);

    const [form, setForm] = useState<LaborForm>(emptyForm);
    const [validationError, setValidationError] = useState("");

    const {
    data: existingCharge,
    loading: loadingCharges,
    error: loadError,
} = useApi(
    () => (editing && code ? labor.get(code) : Promise.resolve(null)),
    [editing, code],
);

useEffect(() => {
    if (!existingCharge) return;

    setForm({
        name: existingCharge.name,
        category: existingCharge.category,
        price: String(existingCharge.price),
    });
}, [existingCharge]);

    const { mutate: addCharge, loading: adding } = useMutation(
        labor.create,
    );

    const { mutate: updateCharge, loading: updating } = useMutation(
        labor.update,
    );

    const saving = adding || updating;

    const updateForm = (
        field: keyof LaborForm,
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setValidationError("");
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        const name = form.name.trim();
        const price = Number(form.price);

        if (!name) {
            setValidationError(
                "Enter a description for the labor service.",
            );
            return;
        }

        if (
            !form.price ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            setValidationError(
                "Enter a valid labor charge greater than zero.",
            );
            return;
        }

        setValidationError("");

        try {
            if (editing && code) {
                await updateCharge(code, {
                    name,
                    category: form.category,
                    price,
                });
            } else {
                await addCharge({
                    name,
                    category: form.category,
                    price,
                });
            }

            navigate("/labor");
        } catch {
            setValidationError(
                editing
                    ? "Unable to save the labor rate. Please try again."
                    : "Unable to add the labor rate. Please try again.",
            );
        }
    };

    if (editing && loadingCharges) {
        return (
            <div className="space-y-5 p-6">
                <div className="h-5 w-40 animate-pulse rounded bg-[var(--surface-alt)]" />

                <div className="h-20 animate-pulse rounded-xl bg-[var(--surface-alt)]" />

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="h-96 animate-pulse rounded-xl bg-[var(--surface-alt)]" />
                    <div className="h-72 animate-pulse rounded-xl bg-[var(--surface-alt)]" />
                </div>
            </div>
        );
    }

    const formattedPrice =
        form.price && Number(form.price) > 0
            ? Number(form.price).toLocaleString("en-KE")
            : "0";

    return (
        <div className="min-h-full p-5 md:p-6">
            {/* Page heading */}
            <div className="mb-6 flex flex-col gap-4 px-2 py-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-dim)]">
                        <Wrench
                            size={21}
                            className="text-[var(--primary)]"
                        />
                    </div>

                    <div>
                        <h1 className="text-lg font-bold md:text-lg">
                            {editing
                                ? "Edit labor rate"
                                : "Add labor rate"}
                        </h1>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {editing
                                ? "Update the service details and pricing."
                                : "Create a labor service for your garage rate schedule."}
                        </p>
                    </div>
                </div>

               <Link
                    to="/labor"
                    className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] border p-2 rounded-lg border-[var(--border)] transition hover:text-[var(--text)]"
                >
                    <ArrowLeft size={15} />
                    Labor rates
                </Link>
            </div>

            {/* Errors */}
            {loadError && (
                <div className="mb-5 rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {loadError}
                </div>
            )}

            {validationError && (
                <div className="mb-5 rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {validationError}
                </div>
            )}

            {/* Workspace */}
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* Form */}
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                >
                    <div className="border-b border-[var(--border)] px-5 py-4">
                        <h2 className="text-sm font-bold">
                            Service details
                        </h2>

                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Enter the information that technicians and
                            service advisors will see when adding labor
                            to a job.
                        </p>
                    </div>

                    <div className="space-y-5 p-5">
                        <Field label="Labor description">
                            <Input
                                value={form.name}
                                onChange={(e) =>
                                    updateForm(
                                        "name",
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. Clutch plate replacement"
                                autoFocus={!editing}
                            />

                            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                                Use a clear, customer-friendly service
                                description.
                            </p>
                        </Field>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Category">
                                <Select
                                    value={form.category}
                                    onChange={(e) =>
                                        updateForm(
                                            "category",
                                            e.target.value,
                                        )
                                    }
                                >
                                    {categories.map((item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    ))}
                                </Select>
                            </Field>

                            <Field label="Charge (KSh)">
                                <Input
                                    value={form.price}
                                    onChange={(e) =>
                                        updateForm(
                                            "price",
                                            e.target.value.replace(
                                                /\D/g,
                                                "",
                                            ),
                                        )
                                    }
                                    placeholder="0"
                                    inputMode="numeric"
                                />

                                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                                    Enter the standard labor charge
                                    before any job-specific adjustments.
                                </p>
                            </Field>
                        </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface-alt)] px-5 py-4 sm:flex-row sm:justify-end">
                        <Link to="/labor">
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            <CheckCircle2 size={15} />

                            {saving
                                ? editing
                                    ? "Saving…"
                                    : "Adding…"
                                : editing
                                  ? "Save changes"
                                  : "Add labor rate"}
                        </Button>
                    </div>
                </form>

                {/* Preview / information panel */}
                <div className="space-y-5">
                     {/* Category list */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            Available categories
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {categories.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        updateForm(
                                            "category",
                                            item,
                                        )
                                    }
                                    className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
                                        form.category === item
                                            ? "border-[var(--primary)] bg-[var(--primary-dim)] font-semibold text-[var(--primary)]"
                                            : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Live preview */}
                    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="border-b border-[var(--border)] px-5 py-4">
                            <h2 className="text-sm font-bold">
                                Rate preview
                            </h2>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                This is how the service will appear when
                                selected on a job card.
                            </p>
                        </div>

                        <div className="p-5">
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-dim)]">
                                                <Wrench
                                                    size={14}
                                                    className="text-[var(--primary)]"
                                                />
                                            </div>

                                            <span className="font-mono text-[10px] text-[var(--text-muted)]">
                                                {editing
                                                    ? code
                                                    : "AUTO"}
                                            </span>
                                        </div>

                                        <p className="truncate font-semibold">
                                            {form.name ||
                                                "Labor service name"}
                                        </p>

                                        <div className="mt-2">
                                            <Badge>
                                                {form.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="font-mono text-lg font-bold">
                                            KSh {formattedPrice}
                                        </p>
                                        <p className="text-[10px] text-[var(--text-muted)]">
                                            labor charge
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-alt)] text-[var(--text-muted)]">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-sm font-medium">
                    {value}
                </p>
            </div>
        </div>
    );
}