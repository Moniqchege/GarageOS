import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Phone, ScanLine, ShoppingCart, Trash2, X } from "lucide-react";

import { pos, inventory, useApi, useMutation } from "@garage/api-client";
import type { Cart } from "@garage/api-client";
import { Button, Input } from "@garage/ui";

const currency = (n: number) => "KSh " + Math.round(n).toLocaleString("en-KE");

const productCategories = [
    "Fast Moving Parts", "Engine Oils", "Filters", "Brake Pads", "Electrical Components",
];
const productsByCategory: Record<string, string[]> = {
    "Fast Moving Parts":     ["WPR-3321", "FLT-1002", "ELE-6650"],
    "Engine Oils":           ["OIL-5540"],
    "Filters":               ["FLT-1002", "FLT-2210"],
    "Brake Pads":            ["BRK-2201"],
    "Electrical Components": ["BAT-9010", "ELE-6650"],
};

export function PosPage() {
    const navigate = useNavigate();

    // Remote state
    const { data: cart, refetch: refetchCart } = useApi(() => pos.getCart(), []);
    const { data: inventoryList } = useApi(() => inventory.list(), []);
    const { mutate: addItem }     = useMutation((sku: string) => pos.addItem(sku, 1));
    const { mutate: removeItem }  = useMutation((sku: string) => pos.removeItem(sku));
    const { mutate: clearSale }   = useMutation(() => pos.clearCart());

    // Local UI state
    const [cat,          setCat]          = useState(productCategories[0]);
    const [scan,         setScan]         = useState("");
    const [loyaltyPhone, setLoyaltyPhone] = useState("");

    // Keep cart fresh when component mounts
    useEffect(() => { refetchCart(); }, []);

    const handleAddToCart = async (sku: string) => {
        await addItem(sku);
        refetchCart();
    };

    const handleRemoveFromCart = async (sku: string) => {
        await removeItem(sku);
        refetchCart();
    };

    const handleScan = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter" || !scan) return;
        const item = (inventoryList ?? []).find(
            (i) => i.sku.toLowerCase() === scan.toLowerCase(),
        );
        if (item) {
            await addItem(item.sku);
            refetchCart();
        }
        setScan("");
    };

    const handleCancel = async () => {
        await clearSale();
        refetchCart();
    };

    const activeCart: Cart = cart ?? { items: [], subtotal: 0, vat: 0, total: 0 };

    return (
        <div className="p-6">
            <div className="mb-3.5 flex gap-3">
                <div className="relative flex-1">
                    <ScanLine
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]"
                    />
                    <Input
                        className="pl-9"
                        placeholder="Scan barcode or type SKU, then Enter…"
                        value={scan}
                        onChange={(e) => setScan(e.target.value)}
                        onKeyDown={handleScan}
                    />
                </div>
                <div className="relative w-56">
                    <Phone
                        size={13}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <Input
                        className="pl-8"
                        placeholder="Loyalty phone (optional)"
                        value={loyaltyPhone}
                        onChange={(e) => setLoyaltyPhone(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[45%_1fr]">
                {/* ── Cart panel ── */}
                <div className="flex min-h-[460px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3.5 py-3 text-xs font-bold">
                        <ShoppingCart size={14} className="text-[var(--primary)]" />
                        Active checkout cart
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {activeCart.items.length === 0 && (
                            <div className="p-8 text-center text-xs text-[var(--text-faint)]">
                                Scan or tap a product to begin a sale
                            </div>
                        )}
                        {activeCart.items.map((c) => (
                            <div key={c.sku} className="flex items-center gap-2.5 border-b border-[var(--border)] px-3.5 py-2.5">
                                <div className="flex-1">
                                    <div className="text-xs">{c.name}</div>
                                    <div className="font-mono text-[10px] text-[var(--text-faint)]">
                                        {c.sku} · {currency(c.price)} × {c.qty}
                                    </div>
                                </div>
                                <div className="font-mono text-sm">{currency(c.price * c.qty)}</div>
                                <button onClick={() => handleRemoveFromCart(c.sku)} className="text-[var(--text-faint)]">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-[var(--border)] p-3.5">
                        <div className="flex justify-between py-0.5 text-xs text-[var(--text-muted)]">
                            <span>Gross subtotal</span>
                            <span className="font-mono">{currency(activeCart.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-0.5 text-xs text-[var(--text-muted)]">
                            <span>VAT (16%)</span>
                            <span className="font-mono">{currency(activeCart.vat)}</span>
                        </div>
                        <div className="mt-1.5 flex justify-between border-t border-[var(--border)] pt-2 text-sm font-bold">
                            <span>Net cash total</span>
                            <span className="font-mono text-lg text-[var(--primary)]">
                                {currency(activeCart.total)}
                            </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleCancel}
                                className="flex-1 justify-center"
                            >
                                <X size={13} /> Cancel sale
                            </Button>
                            <Button
                                variant="primary"
                                disabled={activeCart.items.length === 0}
                                onClick={() =>
                                    navigate("checkout", {
                                        state: {
                                            items:    activeCart.items,
                                            subtotal: activeCart.subtotal,
                                            vat:      activeCart.vat,
                                            total:    activeCart.total,
                                        },
                                    })
                                }
                                className="flex-[2] justify-center"
                            >
                                Pay bill counter
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Product grid ── */}
                <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                        {productCategories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCat(c)}
                                className={`rounded-full border px-3 py-1.5 text-[11px] ${
                                    cat === c
                                        ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]"
                                        : "border-[var(--border)] text-[var(--text-muted)]"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {(productsByCategory[cat] ?? []).map((sku) => {
                            const p = (inventoryList ?? []).find((i) => i.sku === sku);
                            if (!p) return null;
                            return (
                                <button
                                    key={sku}
                                    onClick={() => handleAddToCart(sku)}
                                    disabled={p.qty <= 0}
                                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-left disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Package size={16} className="text-[var(--secondary)]" />
                                    <div className="my-2 text-xs leading-tight">{p.name}</div>
                                    <div className="font-mono text-[10px] text-[var(--text-faint)]">{p.sku}</div>
                                    <div className="mt-1.5 font-mono text-sm text-[var(--primary)]">
                                        {currency(p.price)}
                                    </div>
                                    <div className="text-[10px] text-[var(--text-faint)]">{p.qty} in stock</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
