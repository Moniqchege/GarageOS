import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Plus, Search } from "lucide-react";

import { customers, useApi } from "@garage/api-client";
import { Badge, Input, Table } from "@garage/ui";
import type { CustomerVehicleRecord } from "@garage/types";

const dueSoon = (c: CustomerVehicleRecord) => {
    if (c.nextServiceKm == null) return false;

    const remainingKm = c.nextServiceKm - c.mileage;

    return remainingKm <= 500;
};

export function CustomersPage() {
    const { data, loading, error, refetch } = useApi(() => customers.list(), []);
    const [query, setQuery] = useState("");

    const list = data ?? [];
    const filtered = list.filter(
        (c) =>
            c.registration.toLowerCase().includes(query.toLowerCase()) ||
            c.customer.toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold">Repair &amp; Service Dossier</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Vehicle roster and service due dates.
                    </p>
                </div>
                <Link
                    to="/vehicles/register"
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white"
                >
                    <Plus size={14} /> Register New Vehicle
                </Link>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error} —{" "}
                    <button className="font-bold underline" onClick={refetch}>retry</button>
                </div>
            )}

            <div className="mb-4 flex items-center gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                    <CalendarClock size={15} className="text-[var(--primary)]" />
                    Vehicle roster
                </h2>
                <div className="relative ml-auto">
                    <Search
                        size={13}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <Input
                        className="!w-150 pl-8"
                        placeholder="Search plate or customer"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-12 animate-pulse rounded bg-[var(--surface-alt)]" />
                    ))}
                </div>
            ) : (
                    <Table
                        head={[
                            "Reg plate",
                            "Customer",
                            "Phone Number",
                            "Vehicle",
                            "Mileage",
                            "Last service",
                            "Next service",
                            "Status",
                        ]}
                        rows={filtered.map((c) => [
                            <span className="font-mono font-bold text-[var(--primary)]">
                                {c.registration}
                            </span>,
                            <div>
                                <div>{c.customer}</div>
                            </div>,
                            c.phone,
                            c.model,
                            <span className="font-mono">
                                {c.mileage.toLocaleString()} km
                            </span>,
                            <span className="font-mono">
                                {c.lastServiceKm.toLocaleString()} km
                            </span>,
                            <span className="font-mono">
                                {c.nextServiceKm.toLocaleString()} km
                            </span>,
                            dueSoon(c)
                                ? <Badge variant="warning">Due soon</Badge>
                                : <Badge variant="success">On track</Badge>,
                        ])}
                />
            )}
        </div>
    );
}
