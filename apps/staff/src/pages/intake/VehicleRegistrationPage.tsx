import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Car, Fuel, Gauge, Phone, Plus } from "lucide-react";

import { customers, useMutation } from "@garage/api-client";
import { Button, Card, Field, Input } from "@garage/ui";
import type { VehicleRegistrationPayload } from "@garage/types";

const fuelLabels = ["E", "1/4", "1/2", "3/4", "F"];

export function VehicleRegistrationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { mutate: registerVehicle, loading, error } = useMutation(
        (data: VehicleRegistrationPayload) => customers.registerVehicle(data),
    );

    const [form, setForm] = useState({
        reg: searchParams.get("registration") ?? "",
        model: "",
        year: "",
        color: "",
        mileage: "",
        fuel: 2,
        customer: "",
        phone: "",
        email: "",
        lastServiceKm: "",
        serviceIntervalKm: "",
    });

    const canSubmit =
        form.reg.trim() && form.model.trim() && form.customer.trim() && form.phone.trim();

    const create = async () => {
        if (!canSubmit) return;

        const vehicle = await registerVehicle({
            registration: form.reg,
            model: form.model,
            year: form.year ? Number(form.year) : undefined,
            color: form.color || undefined,
            mileage: form.mileage ? Number(form.mileage) : undefined,
            fuel: form.fuel,
            customerName: form.customer,
            phone: form.phone,
            email: form.email || undefined,
            lastServiceKm: form.lastServiceKm ? Number(form.lastServiceKm) : undefined,
            serviceIntervalKm: form.serviceIntervalKm
                ? Number(form.serviceIntervalKm)
                : undefined,
        });

        if (vehicle) {
            navigate(`/intake?registration=${encodeURIComponent(form.reg)}`);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">Register vehicle</h1>
                        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            New customer
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Add a new customer and vehicle to the roster. Once registered, open a job
                        card for it from the intake screen.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/intake")}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                    <ArrowLeft size={14} /> Back to intake
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
                <Card className="p-5">
                    <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dim)] text-[var(--primary)]">
                            <Car size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">Vehicle details</h2>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                Identify the vehicle being added to the roster.
                            </p>
                        </div>
                    </div>

                    <Field label="Registration plate">
                        <Input
                            className="font-mono text-base tracking-wide"
                            value={form.reg}
                            onChange={(e) => setForm({ ...form, reg: e.target.value.toUpperCase() })}
                            placeholder="KDK 420X"
                        />
                    </Field>

                    <Field label="Make / model" className="mt-4">
                        <Input
                            value={form.model}
                            onChange={(e) => setForm({ ...form, model: e.target.value })}
                            placeholder="e.g. Toyota Probox"
                        />
                    </Field>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Field label="Year">
                            <Input
                                value={form.year}
                                onChange={(e) =>
                                    setForm({ ...form, year: e.target.value.replace(/\D/g, "") })
                                }
                                placeholder="e.g. 2016"
                            />
                        </Field>
                        <Field label="Colour">
                            <Input
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                                placeholder="e.g. White"
                            />
                        </Field>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Field label="Last serviced at (km)">
                            <Input
                                value={form.lastServiceKm}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        lastServiceKm: e.target.value.replace(/\D/g, ""),
                                    })
                                }
                                placeholder="e.g. 80000"
                            />
                        </Field>
                        <Field label="Service interval (km)">
                            <Input
                                value={form.serviceIntervalKm}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        serviceIntervalKm: e.target.value.replace(/\D/g, ""),
                                    })
                                }
                                placeholder="e.g. 5000"
                            />
                        </Field>
                    </div>

                    <Field label="Mileage (km)" className="mt-4">
                        <div className="relative">
                            <Gauge
                                size={14}
                                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                            />
                            <Input
                                className="pl-8"
                                value={form.mileage}
                                onChange={(e) =>
                                    setForm({ ...form, mileage: e.target.value.replace(/\D/g, "") })
                                }
                                placeholder="e.g. 84200"
                            />
                        </div>
                    </Field>
                </Card>

                <Card className="p-5">
                    <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dim)] text-[var(--primary)]">
                            <Phone size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">Customer details</h2>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                If this phone number already exists, the vehicle is attached to
                                that customer instead of creating a duplicate.
                            </p>
                        </div>
                    </div>

                    <Field label="Customer name">
                        <Input
                            value={form.customer}
                            onChange={(e) => setForm({ ...form, customer: e.target.value })}
                            placeholder="e.g. James Mutiso"
                        />
                    </Field>
                    <Field label="Phone number" className="mt-4">
                        <Input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="07xx xxx xxx"
                        />
                    </Field>
                    <Field label="Email (optional)" className="mt-4">
                        <Input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="name@example.com"
                        />
                    </Field>

                    <div className="mt-5 flex justify-end border-t border-[var(--border)] pt-4">
                        <Button
                            variant="primary"
                            onClick={create}
                            disabled={loading || !canSubmit}
                            className="justify-center px-5"
                        >
                            <Plus size={14} />
                            {loading ? "Registering…" : "Register vehicle"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}