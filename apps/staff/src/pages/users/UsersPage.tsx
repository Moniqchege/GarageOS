import { useState } from "react";
import { Plus, Search, UserCog, Users } from "lucide-react";

import { users, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Field, Input, Select, Table } from "@garage/ui";

const SYSTEM_ROLES = [
    "System Administrator",
    "Storekeeper",
    "Service Advisor",
    "Lead Mechanic",
    "Terminal Cashier",
];

const emptyForm = { name: "", phone: "", role: "Storekeeper", pin: "", rate: "" };

export function UsersPage() {
    const { data, loading, error, refetch } = useApi(() => users.list(), []);
    const { mutate: createUser, loading: saving } = useMutation(
        (form: typeof emptyForm) =>
            users.create({
                name:   form.name,
                role:   form.role,
                phone:  form.phone,
                pin:    form.pin,
                status: "Active",
            }),
    );
    const { mutate: toggleStatus } = useMutation(
        ({ id, status }: { id: string; status: "Active" | "Suspended" }) =>
            users.setStatus(id, status),
    );

    const [query, setQuery] = useState("");
    const [form,  setForm]  = useState(emptyForm);

    const save = async () => {
        if (!form.name || form.pin.length !== 4) return;
        await createUser(form);
        setForm(emptyForm);
        refetch();
    };

    const handleToggle = async (id: string, current: "Active" | "Suspended") => {
        await toggleStatus({ id, status: current === "Active" ? "Suspended" : "Active" });
        refetch();
    };

    const list = data ?? [];
    const filtered = list.filter(
        (e) =>
            e.name.toLowerCase().includes(query.toLowerCase()) ||
            e.id.toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <div className="p-6">
            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error} —{" "}
                    <button className="font-bold underline" onClick={refetch}>retry</button>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
                {/* ── Add form ── */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
                        <UserCog size={15} className="text-[var(--primary)]" />
                        New staff profile
                    </h2>
                    <Field label="Full employee name">
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Kariuki" />
                    </Field>
                    <Field label="Phone number" className="mt-3.5">
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07xx xxx xxx" />
                    </Field>
                    <Field label="Role" className="mt-3.5">
                        <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            {SYSTEM_ROLES.map((r) => <option key={r}>{r}</option>)}
                        </Select>
                    </Field>
                    <Field label="4-digit secure PIN" className="mt-3.5">
                        <Input
                            maxLength={4}
                            value={form.pin}
                            onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
                            placeholder="••••"
                        />
                    </Field>
                    <Field label="Base salary / commission rate (KSh)" className="mt-3.5">
                        <Input value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="e.g. 28,000" />
                    </Field>
                    <Button
                        variant="primary"
                        onClick={save}
                        disabled={saving}
                        className="mt-4 w-full justify-center"
                    >
                        <Plus size={14} /> {saving ? "Saving…" : "Save employee"}
                    </Button>
                </div>

                {/* ── Table ── */}
                <div>
                    <div className="mb-3.5 flex items-center gap-2">
                        <h2 className="flex items-center gap-2 text-sm font-bold">
                            <Users size={15} className="text-[var(--primary)]" />
                            Active employee data sheet
                        </h2>
                        <div className="relative ml-auto">
                            <Search
                                size={13}
                                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                            />
                            <Input
                                className="!w-120 pl-8"
                                placeholder="Search staff"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-10 animate-pulse rounded bg-[var(--surface-alt)]" />
                            ))}
                        </div>
                    ) : (
                        <Table
                            head={["ID", "Name", "Role", "Status", "Last login", "Action"]}
                            rows={filtered.map((e) => [
                                <span className="font-mono text-[11px] text-[var(--text-muted)]">{e.id}</span>,
                                e.name,
                                e.role,
                                <Badge variant={e.status === "Active" ? "success" : "danger"}>{e.status}</Badge>,
                                <span className="text-xs text-[var(--text-muted)]">{e.lastLogin}</span>,
                                <button
                                    onClick={() => handleToggle(e.id, e.status)}
                                    className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                                >
                                    {e.status === "Active" ? "Deactivate" : "Reactivate"}
                                </button>,
                            ])}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
