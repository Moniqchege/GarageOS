import { useState, type KeyboardEvent } from "react";
import { AlertTriangle, Boxes, Plus, ScanLine } from "lucide-react";

import { inventory, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Field, Input, Select, Table } from "@garage/ui";

const currency = (n: number) => "KSh " + Math.round(n).toLocaleString("en-KE");

const emptyForm = {
    sku: "", name: "", fits: "", qty: "",
    supplier: "AutoParts Kenya Ltd",
    cost: "", price: "", low: "",
};

export function StockPage() {
    const { data: items, loading, error, refetch } = useApi(() => inventory.list(), []);
    const { mutate: addItem,     loading: adding  } = useMutation(inventory.create);
    const { mutate: restockItem, loading: restocking } = useMutation(
        ({ sku, qty }: { sku: string; qty: number }) => inventory.restock(sku, { qty }),
    );

    const [scan, setScan]   = useState("");
    const [form, setForm]   = useState(emptyForm);

    const addStock = async () => {
        if (!form.sku || !form.qty) return;
        const existing = (items ?? []).find(
            (i) => i.sku.toLowerCase() === form.sku.toLowerCase(),
        );

        if (existing) {
            await restockItem({ sku: existing.sku, qty: Number(form.qty) });
        } else {
            await addItem({
                sku:   form.sku.toUpperCase(),
                name:  form.name  || "Unnamed part",
                fits:  form.fits  || "Universal",
                cost:  Number(form.cost)  || 0,
                price: Number(form.price) || 0,
                qty:   Number(form.qty),
                low:   Number(form.low)   || 5,
                added: "",
            });
        }
        setForm(emptyForm);
        refetch();
    };

    const handleScan = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter" || !scan) return;
        const existing = (items ?? []).find(
            (i) => i.sku.toLowerCase() === scan.toLowerCase(),
        );
        if (existing) {
            await restockItem({ sku: existing.sku, qty: 1 });
            refetch();
        } else {
            setForm({ ...form, sku: scan });
        }
        setScan("");
    };

    const list = items ?? [];

    return (
        <div className="p-6">
            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error} —{" "}
                    <button className="font-bold underline" onClick={refetch}>retry</button>
                </div>
            )}

            <div className="relative mb-5">
                <ScanLine
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]"
                />
                <Input
                    className="bg-[var(--surface-alt)] pl-9"
                    placeholder="Scan barcode, then press Enter…"
                    value={scan}
                    onChange={(e) => setScan(e.target.value)}
                    onKeyDown={handleScan}
                />
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); addStock(); }}
                className="mb-6 grid grid-cols-2 gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4.5 md:grid-cols-4"
            >
                <Field label="SKU / part number">
                    <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. BRK-2201" />
                </Field>
                <Field label="Part title">
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Brake Pads - Front" />
                </Field>
                <Field label="Fits (compatibility)">
                    <Input value={form.fits} onChange={(e) => setForm({ ...form, fits: e.target.value })} placeholder="Fits Toyota NZE" />
                </Field>
                <Field label="Bulk supplier">
                    <Select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                        <option>AutoParts Kenya Ltd</option>
                        <option>Nairobi Motor Spares</option>
                        <option>Mombasa Auto Imports</option>
                    </Select>
                </Field>
                <Field label="Quantity added">
                    <Input value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value.replace(/\D/g, "") })} placeholder="0" />
                </Field>
                <Field label="Wholesale buying price (KSh)">
                    <Input value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value.replace(/\D/g, "") })} placeholder="0" />
                </Field>
                <Field label="Target selling price (KSh)">
                    <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} placeholder="0" />
                </Field>
                <Field label="Low-stock alert threshold">
                    <Input value={form.low} onChange={(e) => setForm({ ...form, low: e.target.value.replace(/\D/g, "") })} placeholder="5" />
                </Field>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={adding || restocking}
                    className="col-span-2 justify-center md:col-span-1 md:self-end"
                >
                    <Plus size={14} /> {adding || restocking ? "Saving…" : "Add to inventory"}
                </Button>
            </form>

            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Boxes size={15} className="text-[var(--primary)]" />
                Recently ingested — active stock position
            </h2>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-10 animate-pulse rounded bg-[var(--surface-alt)]" />
                    ))}
                </div>
            ) : (
                <Table
                    head={["SKU", "Description", "Cost", "Price", "On hand", "Status"]}
                    rows={list.map((i) => [
                        <span className="font-mono text-[11px]">{i.sku}</span>,
                        <div>
                            <div>{i.name}</div>
                            <div className="text-[10px] text-[var(--text-faint)]">{i.fits}</div>
                        </div>,
                        currency(i.cost),
                        currency(i.price),
                        i.qty,
                        i.qty <= i.low
                            ? <Badge variant="warning"><AlertTriangle size={9} className="mr-1 inline" />Low stock</Badge>
                            : <Badge variant="success">In stock</Badge>,
                    ])}
                />
            )}
        </div>
    );
}
