import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, Boxes, CheckCircle2, PackagePlus, ScanLine } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { inventory, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Field, Input, Select } from "@garage/ui";
import { INVENTORY_CATEGORIES } from "@garage/types";

const currency = (n: number) =>
    "KSh " + Math.round(Number(n) || 0).toLocaleString("en-KE");

const emptyForm = {
    sku: "",
    name: "",
    fits: "",
    category: INVENTORY_CATEGORIES[0],
    qty: "",
    supplier: "AutoParts Kenya Ltd",
    cost: "",
    price: "",
    low: "",
};

export function StockIntakePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const {
        data: items,
        loading: inventoryLoading,
        error: inventoryError,
    } = useApi(() => inventory.list(), []);

    const { data: nextSkuData } = useApi(() => inventory.nextSku(), []);

    const {
        mutate: addItem,
        loading: adding,
        error: addError,
    } = useMutation(inventory.create);

    const {
        mutate: restockItem,
        loading: restocking,
        error: restockError,
    } = useMutation(
        ({ sku, qty }: { sku: string; qty: number }) =>
            inventory.restock(sku, { qty }),
    );

    const [form, setForm] = useState(emptyForm);
    const [scan, setScan] = useState("");
    const [scanNotFound, setScanNotFound] = useState(false);
    const [success, setSuccess] = useState(false);

    const prefillApplied = useRef(false);

    const list = items ?? [];

    useEffect(() => {
        const skuParam = searchParams.get("sku");
        if (!skuParam || !items || prefillApplied.current) return;

        const existing = items.find(
            (item) => item.sku.toLowerCase() === skuParam.toLowerCase(),
        );

        if (existing) {
            prefillApplied.current = true;
            setForm({
                ...emptyForm,
                sku: existing.sku,
                name: existing.name,
                fits: existing.fits,
                cost: String(existing.cost ?? ""),
                price: String(existing.price ?? ""),
                low: String(existing.low ?? ""),
            });
        }
    }, [searchParams, items]);

    useEffect(() => {
        if (prefillApplied.current || form.sku) return;
        if (nextSkuData?.sku) {
            setForm((current) => ({ ...current, sku: nextSkuData.sku }));
        }
    }, [nextSkuData, form.sku]);

    const existingItem = useMemo(() => {
        if (!form.sku.trim()) return null;

        return list.find(
            (item) =>
                item.sku.toLowerCase() ===
                form.sku.trim().toLowerCase(),
        );
    }, [form.sku, list]);

    const isExisting = Boolean(existingItem);

    const quantity = Number(form.qty) || 0;
    const cost = Number(form.cost) || 0;
    const price = Number(form.price) || 0;

    const stockValue = quantity * cost;
    const potentialSalesValue = quantity * price;
    const potentialProfit = potentialSalesValue - stockValue;

    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

    const updateField = (
        field: keyof typeof emptyForm,
        value: string,
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
        setSuccess(false);
    };

    const updateNumericField = (
        field: "qty" | "cost" | "price" | "low",
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value.replace(/\D/g, ""),
        }));
        setSuccess(false);
    };

    const handleScan = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter" || !scan.trim()) return;

        const sku = scan.trim();
        const existing = list.find(
            (item) => item.sku.toLowerCase() === sku.toLowerCase(),
        );

        setScanNotFound(false);

        if (existing) {
            prefillApplied.current = true;
            setForm({
                ...emptyForm,
                sku: existing.sku,
                name: existing.name,
                fits: existing.fits,
                cost: String(existing.cost ?? ""),
                price: String(existing.price ?? ""),
                low: String(existing.low ?? ""),
            });
        } else {
            setScanNotFound(true);
        }

        setScan("");
        setSuccess(false);
    };

    const submit = async () => {
        if (!form.sku.trim() || quantity <= 0) return;

        setSuccess(false);

        if (existingItem) {
            await restockItem({ sku: existingItem.sku, qty: quantity });
        } else {
            await addItem({
                name: form.name.trim() || "Unnamed part",
                fits: form.fits.trim() || "Universal",
                category: form.category,
                cost,
                price,
                qty: quantity,
                low: Number(form.low) || 5,
                added: "",
            });
        }

        setSuccess(true);
        setTimeout(() => navigate("/stock"), 700);
    };

    const loading = adding || restocking;
    const error = addError || restockError;

    return (
        <div className="min-h-full !p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                {/* HEADER */}
                <div className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <PackagePlus size={20} className="text-[var(--primary)]" />
                                <h1 className="text-xl font-bold">Receive stock</h1>
                            </div>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Add a new part or replenish an existing inventory item.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={() => navigate("/stock")}
                                className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] border p-2 rounded-lg border-[var(--border)] transition hover:text-[var(--text)]"
                            >
                                <ArrowLeft size={13} />
                                Back to inventory
                            </button>

                            {isExisting && <Badge variant="success">Existing SKU</Badge>}
                        </div>
                    </div>
                </div>

                {/* SUCCESS */}
                {success && (
                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-[var(--secondary)] bg-[var(--secondary-dim)] px-4 py-3">
                        <CheckCircle2 size={17} className="text-[var(--secondary)]" />
                        <div>
                            <div className="text-sm font-semibold">Stock received successfully</div>
                            <div className="text-[10px] text-[var(--text-muted)]">Returning to inventory…</div>
                        </div>
                    </div>
                )}

                {/* ERROR */}
                {(inventoryError || error) && (
                    <div className="mb-5 rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                        {inventoryError || error}
                    </div>
                )}

                {/* SCANNER */}
                <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <div className="border-b border-[var(--border)] px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <ScanLine size={15} className="text-[var(--primary)]" />
                            Identify part
                        </div>

                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                            Scan a barcode or enter an existing SKU to restock it — or use the Edit
                            button from the inventory table instead of typing it here.
                        </p>
                    </div>

                    <div className="p-5">
                        <div className="relative">
                            <ScanLine
                                size={17}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]"
                            />
                            <Input
                                className="bg-[var(--surface-alt)] pl-10"
                                value={scan}
                                onChange={(e) => setScan(e.target.value)}
                                onKeyDown={handleScan}
                                placeholder="Scan barcode or type an existing SKU, then press Enter…"
                                autoFocus
                            />
                        </div>

                        {scanNotFound ? (
                            <div className="mt-2 text-[10px] text-[var(--warning)]">
                                No part found for that code. Fill in the details below to add it as a
                                new part — a SKU will be generated automatically.
                            </div>
                        ) : (
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-faint)]">
                                <span className="rounded border border-[var(--border)] bg-[var(--surface-alt)] px-1.5 py-0.5 font-mono">
                                    ENTER
                                </span>
                                <span>Existing SKU → restock</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    {/* MAIN FORM */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="border-b border-[var(--border)] px-5 py-4">
                            <div className="text-sm font-bold">Part information</div>
                            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                                {isExisting
                                    ? "This SKU already exists. Enter the quantity received to increase its stock."
                                    : "Enter the details for the new inventory item. Its SKU is assigned automatically."}
                            </div>
                        </div>

                        <div className="space-y-5 p-5">
                            {/* Part identity */}
                            <div>
                                <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                                    Identification
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* <Field label={isExisting ? "SKU / part number" : "SKU (auto-generated)"}>
                                        <Input
                                            value={form.sku || "Generating…"}
                                            disabled
                                        />
                                    </Field> */}

                                    <Field label="Part title">
                                        <Input
                                            value={form.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                            placeholder="e.g. Front Brake Pads"
                                            disabled={isExisting}
                                        />
                                    </Field>

                                    <Field label="Category">
                                        <Select
                                            value={form.category}
                                            onChange={(e) => updateField("category", e.target.value)}
                                            disabled={isExisting}
                                        >
                                            {INVENTORY_CATEGORIES.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </Select>
                                    </Field>

                                    <Field label="Fits / compatibility">
                                        <Input
                                            value={form.fits}
                                            onChange={(e) => updateField("fits", e.target.value)}
                                            placeholder="Toyota NZE"
                                            disabled={isExisting}
                                        />
                                    </Field>

                                    <Field label="Supplier">
                                        <Select
                                            value={form.supplier}
                                            onChange={(e) => updateField("supplier", e.target.value)}
                                            disabled={isExisting}
                                        >
                                            <option>AutoParts Kenya Ltd</option>
                                            <option>Nairobi Motor Spares</option>
                                            <option>Mombasa Auto Imports</option>
                                        </Select>
                                    </Field>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="border-t border-[var(--border)] pt-5">
                                <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                                    Stock quantity
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label={isExisting ? "Quantity received" : "Opening quantity"}>
                                        <Input
                                            value={form.qty}
                                            onChange={(e) => updateNumericField("qty", e.target.value)}
                                            placeholder="0"
                                            inputMode="numeric"
                                        />
                                    </Field>

                                    <Field label="Low-stock threshold">
                                        <Input
                                            value={form.low}
                                            onChange={(e) => updateNumericField("low", e.target.value)}
                                            placeholder="5"
                                            inputMode="numeric"
                                            disabled={isExisting}
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Pricing */}
                            {!isExisting && (
                                <div className="border-t border-[var(--border)] pt-5">
                                    <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                                        Pricing
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Wholesale cost (KSh)">
                                            <Input
                                                value={form.cost}
                                                onChange={(e) => updateNumericField("cost", e.target.value)}
                                                placeholder="0"
                                                inputMode="numeric"
                                            />
                                        </Field>

                                        <Field label="Selling price (KSh)">
                                            <Input
                                                value={form.price}
                                                onChange={(e) => updateNumericField("price", e.target.value)}
                                                placeholder="0"
                                                inputMode="numeric"
                                            />
                                        </Field>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form footer */}
                        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-alt)] px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                            <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/stock")}
                                    className="flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)] sm:min-w-[100px]"
                                >
                                    Cancel
                                </button>

                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={submit}
                                    disabled={
                                        loading ||
                                        inventoryLoading ||
                                        !form.sku.trim() ||
                                        quantity <= 0
                                    }
                                    className="justify-center sm:min-w-[190px]"
                                >
                                    <PackagePlus size={14} />
                                    {loading ? "Saving…" : isExisting ? "Receive stock" : "Add to inventory"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* PREVIEW / SUMMARY */}
                    <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="mb-4 text-sm font-bold">Stock operation</div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-dim)]">
                                    {isExisting ? (
                                        <Boxes size={18} className="text-[var(--primary)]" />
                                    ) : (
                                        <PackagePlus size={18} className="text-[var(--primary)]" />
                                    )}
                                </div>

                                <div>
                                    <div className="text-sm font-semibold">
                                        {isExisting ? "Restocking" : "New inventory item"}
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                        {form.sku || "Waiting for SKU"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-[var(--border)] pt-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">Quantity</span>
                                    <span className="font-mono font-bold">+{quantity}</span>
                                </div>

                                {isExisting && existingItem && (
                                    <>
                                        <div className="mt-2 flex justify-between text-xs">
                                            <span className="text-[var(--text-muted)]">Current stock</span>
                                            <span className="font-mono">{existingItem.qty}</span>
                                        </div>

                                        <div className="mt-2 flex justify-between text-xs font-bold">
                                            <span>New stock</span>
                                            <span className="font-mono text-[var(--primary)]">
                                                {Number(existingItem.qty) + quantity}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-sm font-bold">Financial preview</div>
                                <TrendingIcon />
                            </div>

                            <div className="space-y-3">
                                <SummaryRow label="Stock cost" value={currency(stockValue)} />
                                <SummaryRow label="Potential sales" value={currency(potentialSalesValue)} primary />

                                <div className="border-t border-[var(--border)] pt-3">
                                    <SummaryRow label="Potential gross profit" value={currency(potentialProfit)} secondary />
                                </div>

                                {!isExisting && price > 0 && (
                                    <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                                        <span>Estimated margin</span>
                                        <span className="font-mono font-semibold">
                                            {Math.max(0, margin).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
                            <div className="text-[11px] font-semibold">Inventory rule</div>
                            <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--text-muted)]">
                                SKUs are assigned automatically when a part is created, so the same
                                code can never be issued twice. Restocking an existing part only
                                increases its quantity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, primary, secondary }: {
    label: string; value: string; primary?: boolean; secondary?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
            <span className={`font-mono text-sm font-bold ${
                primary ? "text-[var(--primary)]" : secondary ? "text-[var(--secondary)]" : ""
            }`}>
                {value}
            </span>
        </div>
    );
}

function TrendingIcon() {
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--secondary-dim)]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--secondary)]">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
            </svg>
        </div>
    );
}