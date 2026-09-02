import { useMemo, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Barcode,
    Minus,
    Package,
    Phone,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
} from "lucide-react";

import { pos, inventory, useApi, useMutation } from "@garage/api-client";
import type { Cart } from "@garage/api-client";
import { Button, Input } from "@garage/ui";
import { INVENTORY_CATEGORIES } from "@garage/types";

const currency = (n: number) =>
    "KES " + Math.round(n).toLocaleString("en-KE");

const ALL_CATEGORY = "All";
const productCategories = [ALL_CATEGORY, ...INVENTORY_CATEGORIES];

export function PosPage() {
    const navigate = useNavigate();

    // ─────────────────────────────────────────────────────────────
    // DATA — fetched once, unfiltered; category filtering happens
    // client-side in `visibleProducts` below.
    // ─────────────────────────────────────────────────────────────

    const { data: cart, refetch: refetchCart } = useApi(() => pos.getCart(), []);
    const { data: inventoryList } = useApi(() => inventory.list(), []);

    // ─────────────────────────────────────────────────────────────
    // MUTATIONS
    // ─────────────────────────────────────────────────────────────

    const { mutate: addItem } = useMutation((sku: string) => pos.addItem(sku, 1));
    const { mutate: removeItem } = useMutation((sku: string) => pos.removeItem(sku));
    const { mutate: clearSale } = useMutation(() => pos.clearCart());

    // ─────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────

    const [scan, setScan] = useState("");
    const [loyaltyPhone, setLoyaltyPhone] = useState("");
    const [productSearch, setProductSearch] = useState("");
    // "All" = no category filter applied yet — everything fetched on
    // load is shown until the user actively picks a category.
    const [cat, setCat] = useState<string>(ALL_CATEGORY);

    // ─────────────────────────────────────────────────────────────
    // CART
    // ─────────────────────────────────────────────────────────────

    const activeCart: Cart = cart ?? { items: [], subtotal: 0, vat: 0, total: 0 };

    const totalUnits = activeCart.items.reduce((sum, item) => sum + Number(item.qty), 0);

    // ─────────────────────────────────────────────────────────────
    // PRODUCTS — filtered in-memory from the single unfiltered fetch
    // ─────────────────────────────────────────────────────────────

    const visibleProducts = useMemo(() => {
        return (inventoryList ?? []).filter((product) => {
            if (cat !== ALL_CATEGORY && product.category !== cat) return false;

            if (!productSearch.trim()) return true;

            const query = productSearch.toLowerCase();

            return (
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query)
            );
        });
    }, [inventoryList, cat, productSearch]);

    // ─────────────────────────────────────────────────────────────
    // CART HANDLERS
    // ─────────────────────────────────────────────────────────────

    const handleAddToCart = async (sku: string) => {
        await addItem(sku);
        refetchCart();
    };

    const { mutate: updateItem } = useMutation(
        ({ sku, qty }: { sku: string; qty: number }) => pos.updateItem(sku, qty),
    );

    const handleDecreaseQuantity = async (sku: string, currentQty: number) => {
        if (currentQty <= 1) {
            await removeItem(sku);
        } else {
            await updateItem({ sku, qty: currentQty - 1 });
        }
        refetchCart();
    };

    const handleRemoveFromCart = async (sku: string) => {
        await removeItem(sku);
        refetchCart();
    };

    // ─────────────────────────────────────────────────────────────
    // BARCODE / SKU SCANNING
    // ─────────────────────────────────────────────────────────────

    const handleScan = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter" || !scan.trim()) return;

        const item = (inventoryList ?? []).find(
            (i) => i.sku.toLowerCase() === scan.trim().toLowerCase(),
        );

        if (item && item.qty > 0) {
            await addItem(item.sku);
            refetchCart();
        }

        setScan("");
    };

    // ─────────────────────────────────────────────────────────────
    // CANCEL SALE
    // ─────────────────────────────────────────────────────────────

    const handleCancel = async () => {
        await clearSale();
        refetchCart();
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────
    //
    // Layout strategy (xl and up only — below xl the page just
    // flows/scrolls normally like before):
    //   - the whole page becomes a fixed h-screen flex column
    //   - <main> grows to fill whatever height is left (xl:flex-1)
    //   - the grid row inside <main> is minmax(0,1fr), so it always
    //     equals exactly whatever height <main> has — no guessed px
    //   - the cart <section> stretches to that row height (grid's
    //     default align-items: stretch), and internally splits into
    //     a shrink-0 header, a flex-1 scrollable item list, and a
    //     shrink-0 footer — so the footer (with Pay Now) can never
    //     be pushed off/clipped, and only the item list scrolls.
    //   - the product catalogue gets the same treatment so it
    //     scrolls internally instead of overflowing the fixed row.

    return (
        <div className="min-h-full bg-[var(--background)] xl:flex xl:h-screen xl:flex-col xl:overflow-hidden">
            {/* PAGE HEADER */}
            <header className="border-b border-[var(--border)] bg-[var(--surface)] xl:shrink-0">
                <div className="px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-dim)]">
                                <ShoppingCart size={19} className="text-[var(--primary)]" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base font-bold text-[var(--text)]">
                                        Point of Sale
                                    </h1>
                                    <span className="hidden rounded-full bg-[var(--primary-dim)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--primary)] sm:inline-flex">
                                        Sales
                                    </span>
                                </div>
                                <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                                    Counter sales & inventory checkout
                                </p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-6 sm:flex">
                            <div className="text-right">
                                <div className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-faint)]">
                                    Products
                                </div>
                                <div className="mt-0.5 font-mono text-xs font-semibold text-[var(--text)]">
                                    {activeCart.items.length}
                                </div>
                            </div>
                            <div className="h-7 w-px bg-[var(--border)]" />
                            <div className="text-right">
                                <div className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-faint)]">
                                    Units
                                </div>
                                <div className="mt-0.5 font-mono text-xs font-semibold text-[var(--text)]">
                                    {totalUnits}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* SEARCH / SCANNER BAR */}
            <div className="border-b border-[var(--border)] bg-[var(--surface)] xl:shrink-0">
                <div className="px-5 py-4 sm:px-6">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="relative">
                            <Barcode
                                size={17}
                                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--primary)]"
                            />
                            <Input
                                className="h-11 border-[var(--primary)]/30 bg-[var(--background)] pl-10 pr-16 text-sm shadow-sm focus:border-[var(--primary)]"
                                placeholder="Scan barcode or enter SKU..."
                                value={scan}
                                onChange={(e) => setScan(e.target.value)}
                                onKeyDown={handleScan}
                                autoFocus
                            />
                            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-[var(--surface)] px-2 py-1 text-[9px] font-medium tracking-wide text-[var(--text-faint)] shadow-sm sm:block">
                                ENTER
                            </div>
                        </div>

                        <div className="relative">
                            <Phone
                                size={15}
                                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]"
                            />
                            <Input
                                className="h-11 bg-[var(--background)] pl-10 text-sm"
                                placeholder="Customer phone (optional)"
                                value={loyaltyPhone}
                                onChange={(e) => setLoyaltyPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN POS AREA */}
            <main className="grid !p-3 sm:p-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[430px_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)] xl:overflow-hidden">
                {/* CART */}
                <section className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border-b border-[var(--border)] bg-[var(--surface)] xl:w-[400px] xl:border-b-0 xl:border-r">
                    {/* Sale header — static */}
                    <div className="shrink-0 border-b border-[var(--border)] p-3">
                        <div className="mb-1 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-[var(--text)]">
                                    Current Sale
                                </h2>
                                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                    Add products and review quantities
                                </p>
                            </div>
                            <div className="rounded-full bg-[var(--background)] px-2.5 py-1 font-mono text-[9px] text-[var(--text-muted)]">
                                {activeCart.items.length} items
                            </div>
                        </div>
                    </div>

                    {/* Cart list — the ONLY scrollable part of this section */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-1">
                        <div className="flex flex-col gap-2">
                            {activeCart.items.length === 0 ? (
                                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--background)]">
                                        <ShoppingCart size={24} className="text-[var(--text-faint)]" />
                                    </div>
                                    <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">
                                        No items in this sale
                                    </h3>
                                    <p className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-[var(--text-muted)]">
                                        Scan a barcode or select a product from the catalogue to begin.
                                    </p>
                                </div>
                            ) : (
                                activeCart.items.map((item) => (
                                    <article
                                        key={item.sku}
                                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 transition hover:border-[var(--primary)]/30"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--text-muted)]">
                                                    <Package size={19} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="line-clamp-2 text-xs font-semibold leading-tight text-[var(--text)]">
                                                        {item.name}
                                                    </div>
                                                    <div className="mt-1 font-mono text-[9px] text-[var(--text-faint)]">
                                                        {item.sku}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFromCart(item.sku)}
                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--danger)] opacity-70 transition hover:bg-[var(--danger-dim)] hover:opacity-100"
                                                aria-label={`Remove ${item.name} from sale`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                                            <div className="flex h-9 items-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDecreaseQuantity(item.sku, item.qty)}
                                                    disabled={item.qty <= 1}
                                                    className="flex h-full w-9 items-center justify-center text-[var(--text)] transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-30"
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="flex h-full min-w-10 items-center justify-center border-x border-[var(--border)] bg-[var(--surface)] px-2 font-mono text-xs font-medium text-[var(--text)]">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(item.sku)}
                                                    className="flex h-full w-9 items-center justify-center text-[var(--text)] transition hover:bg-[var(--surface)] hover:text-[var(--secondary)]"
                                                    aria-label={`Increase ${item.name} quantity`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-[9px] text-[var(--text-muted)]">
                                                    {currency(item.price)} ea
                                                </div>
                                                <div className="mt-0.5 font-mono text-sm font-bold text-[var(--text)]">
                                                    {currency(item.price * item.qty)}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Cart summary + actions — static, always visible */}
                    <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--text-muted)]">Subtotal</span>
                                <span className="font-mono text-[var(--text)]">
                                    {currency(activeCart.subtotal)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--text-muted)]">VAT (16%)</span>
                                <span className="font-mono text-[var(--text)]">
                                    {currency(activeCart.vat)}
                                </span>
                            </div>
                            <div className="mt-3 flex items-end justify-between border-t border-[var(--border)] pt-3">
                                <div>
                                    <div className="text-sm font-bold text-[var(--text)]">Total</div>
                                    <div className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                                        {totalUnits} {totalUnits === 1 ? "unit" : "units"}
                                    </div>
                                </div>
                                <div className="font-mono text-xl font-bold tracking-tight text-[var(--primary)]">
                                    {currency(activeCart.total)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={activeCart.items.length === 0}
                                className="min-h-12 w-1/3 justify-center rounded-lg border-2 border-[var(--border)] font-semibold text-[var(--text)] transition hover:border-[var(--danger)]/40 hover:bg-[var(--danger-dim)] hover:text-[var(--danger)]"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                disabled={activeCart.items.length === 0}
                                onClick={() =>
                                    navigate("checkout", {
                                        state: {
                                            items: activeCart.items,
                                            subtotal: activeCart.subtotal,
                                            vat: activeCart.vat,
                                            total: activeCart.total,
                                        },
                                    })
                                }
                                className="min-h-12 flex-1 justify-center gap-2 rounded-lg bg-[var(--primary)] font-bold text-white transition hover:opacity-90"
                            >
                                Pay Now <ArrowRight size={16} />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* PRODUCT CATALOGUE — scrolls internally at xl now that it's height-constrained too */}
                <section className="min-h-0 min-w-0 xl:overflow-y-auto">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text)]">Product catalogue</h2>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                Select a product to add it to the sale
                            </p>
                        </div>

                        <div className="relative hidden w-64 sm:block">
                            <Search
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-faint)]"
                            />
                            <Input
                                className="h-9 bg-[var(--surface)] pl-9 text-xs"
                                placeholder="Search products..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="relative mb-4 sm:hidden">
                        <Search
                            size={14}
                            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-faint)]"
                        />
                        <Input
                            className="h-10 bg-[var(--surface)] pl-9"
                            placeholder="Search products..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>

                    {/* Categories — "All" shows everything fetched on load;
                        picking one narrows the client-side filter only */}
                    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                        {productCategories.map((category) => {
                            const selected = cat === category;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setCat(category)}
                                    className={[
                                        "shrink-0 rounded-lg border px-3.5 py-2",
                                        "text-[11px] font-medium transition",
                                        selected
                                            ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)] shadow-sm"
                                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--primary)]/40 hover:text-[var(--text)]",
                                    ].join(" ")}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] text-[var(--text-faint)]">
                            {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
                        </span>

                        {productSearch && (
                            <button
                                type="button"
                                onClick={() => setProductSearch("")}
                                className="text-[10px] font-medium text-[var(--primary)] hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>

                    {visibleProducts.length === 0 ? (
                        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--background)]">
                                <Package size={26} className="text-[var(--text-faint)]" />
                            </div>
                            <p className="mt-4 text-sm font-semibold text-[var(--text)]">No products found</p>
                            <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-[var(--text-muted)]">
                                Try another category or search term.
                            </p>
                        </div>
                    ) : (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                {visibleProducts.map((product) => {
                                    const outOfStock = product.qty <= 0;
                                    return (
                                        <div
                                            key={product.sku}
                                            className={[
                                                "group relative flex flex-col gap-3 rounded-lg border p-2",
                                                "bg-[var(--surface)] transition-all duration-300",
                                                outOfStock
                                                    ? "border-[var(--border)] opacity-60"
                                                    : "border-[var(--border)] hover:shadow-md",
                                            ].join(" ")}
                                        >                                           
                                            {/* SKU + stock badge */}
                                            <div className="ml-2 flex items-start justify-between gap-2">
                                                <div className="font-mono text-[9px] tracking-wide text-[var(--text-faint)]">
                                                    {product.sku}
                                                </div>
                                                {outOfStock ? (
                                                    <div className="flex items-center gap-1 rounded-full bg-[var(--danger)]/10 px-2 py-0.5 text-[9px] font-semibold text-[var(--danger)]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
                                                        Out of stock
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-[9px] font-semibold text-[var(--success)]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                                                        {product.qty} available
                                                    </div>
                                                )}
                                            </div>
                                            {/* Icon + name */}
                                            <div className="ml-2 flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--primary)]/10 bg-[var(--primary-dim)]">
                                                    <Package size={16} className="text-[var(--primary)]" />
                                                </div>
                                                <div className="line-clamp-2 text-lg font-bold leading-tight text-[var(--text)]">
                                                    {product.name}
                                                </div>
                                            </div>

                                            {/* Price + add button */}
                                            <div className="ml-2 mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3">
    <div className="text-[9px] uppercase tracking-wider text-[var(--text-faint)]">
        Unit price
    </div>

    <div className="font-mono text-sm font-bold text-[var(--primary)]">
        {currency(product.price)}
    </div>
</div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}