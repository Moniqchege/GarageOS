import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Plus, Search } from "lucide-react";

import { customers, useApi } from "@garage/api-client";
import { Badge, Input, Table } from "@garage/ui";
import type { CustomerVehicleRecord } from "@garage/types";

const dueSoon = (c: CustomerVehicleRecord) => {
    const match = c.nextServiceDate.match(/(\d+) (\w+) (\d+)/);
    if (!match) return false;
    const [, day, month, year] = match;
    const daysLeft = Math.ceil(
        (new Date(`${month} ${day}, ${year}`).getTime() - Date.now()) / 86400000,
    );
    return daysLeft <= 21;
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
                    <h1 className="text-xl font-bold">Customers &amp; Vehicle History</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Vehicle roster and service due dates.
                    </p>
                </div>
                <Link
                    to="/intake"
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white"
                >
                    <Plus size={14} /> New intake
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
                    head={["Reg plate", "Customer", "Vehicle", "Mileage", "Last service", "Next service", ""]}
                    rows={filtered.map((c) => [
                        <span className="font-mono font-bold text-[var(--primary)]">{c.registration}</span>,
                        <div>
                            <div>{c.customer}</div>
                            <div className="text-[10px] text-[var(--text-faint)]">{c.phone}</div>
                        </div>,
                        c.model,
                        <span className="font-mono">{c.mileage.toLocaleString()} km</span>,
                        c.lastService,
                        <div>
                            <div>{c.nextServiceDate}</div>
                            <div className="text-[10px] text-[var(--text-faint)]">
                                at {c.nextServiceKm.toLocaleString()} km
                            </div>
                        </div>,
                        dueSoon(c)
                            ? <Badge variant="warning">Due soon</Badge>
                            : <Badge variant="success">On track</Badge>,
                    ])}
                />
            )}
        </div>
    );
}
