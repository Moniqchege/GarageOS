import { useState } from "react";
import { Plus, Search, Wrench } from "lucide-react";

import { labor, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Field, Input, Select, Table } from "@garage/ui";

const categories = [
    "Diagnostics",
    "Suspension",
    "Brakes",
    "Engine & Servicing",
    "Electrical",
    "Bodywork",
];

const emptyForm = { name: "", category: categories[0], price: "" };

export function LaborChargesPage() {
    const { data: charges, loading, error, refetch } = useApi(() => labor.list(), []);
    const { mutate: addCharge, loading: adding } = useMutation(labor.create);
    const { mutate: removeCharge } = useMutation(labor.remove);

    const [query, setQuery] = useState("");
    const [form, setForm] = useState(emptyForm);

    const add = async () => {
        if (!form.name || !form.price) return;
        await addCharge({ name: form.name, category: form.category, price: Number(form.price) });
        setForm(emptyForm);
        refetch();
    };

    const remove = async (code: string) => {
        await removeCharge(code);
        refetch();
    };

    const list = charges ?? [];
    const filtered = list.filter(
        (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.category.toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Labor Charge Catalog</h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Define the labor rates this garage charges — used on every job
                    card's labor selector.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error} —{" "}
                    <button className="font-bold underline" onClick={refetch}>retry</button>
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    add();
                }}
                className="mb-6 grid grid-cols-2 gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4.5 md:grid-cols-4"
            >
                <Field label="Labor description" className="md:col-span-2">
                    <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Clutch plate replacement"
                    />
                </Field>
                <Field label="Category">
                    <Select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                        {categories.map((c) => (
                            <option key={c}>{c}</option>
                        ))}
                    </Select>
                </Field>
                <Field label="Charge (KSh)">
                    <Input
                        value={form.price}
                        onChange={(e) =>
                            setForm({ ...form, price: e.target.value.replace(/\D/g, "") })
                        }
                        placeholder="0"
                    />
                </Field>

                <Button
                    type="submit"
                    variant="primary"
                    disabled={adding}
                    className="col-span-2 justify-center md:col-span-4"
                >
                    <Plus size={14} /> {adding ? "Saving…" : "Add labor charge"}
                </Button>
            </form>

            <div className="mb-3 flex items-center gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                    <Wrench size={15} className="text-[var(--primary)]" />
                    Current rates
                </h2>

                <div className="relative ml-auto">
                    <Search
                        size={13}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <Input
                        className="w-56 pl-8"
                        placeholder="Search labor charges"
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
                    head={["Code", "Description", "Category", "Charge", ""]}
                    rows={filtered.map((c) => [
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                            {c.code}
                        </span>,
                        c.name,
                        <Badge>{c.category}</Badge>,
                        <span className="font-mono">
                            KSh {c.price.toLocaleString("en-KE")}
                        </span>,
                        <button
                            onClick={() => remove(c.code)}
                            className="text-[11px] font-semibold text-[var(--danger)]"
                        >
                            Remove
                        </button>,
                    ])}
                />
            )}
        </div>
    );
}
