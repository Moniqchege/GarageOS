import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Boxes,
    ChevronLeft,
    ChevronRight,
    Package,
    PackageX,
    Pencil,
    Plus,
    Search,
    TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { inventory, useApi } from "@garage/api-client";
import { Badge, Button, Input, Select, Table } from "@garage/ui";

const currency = (n: number) =>
    "KSh " + Math.round(Number(n) || 0).toLocaleString("en-KE");

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (current > 3) pages.push("ellipsis");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("ellipsis");

    pages.push(total);

    return pages;
}

export function StockPage() {
    const navigate = useNavigate();

    const { data: items, loading, error, refetch } = useApi(() => inventory.list(), []);

    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "healthy" | "low" | "out">("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

    const list = items ?? [];

    const stats = useMemo(() => {
        const low = list.filter((item) => item.qty > 0 && item.qty <= item.low);
        const out = list.filter((item) => item.qty <= 0);
        const healthy = list.filter((item) => item.qty > item.low);
        const units = list.reduce((sum, item) => sum + Number(item.qty || 0), 0);
        const costValue = list.reduce((sum, item) => sum + Number(item.cost || 0) * Number(item.qty || 0), 0);
        const retailValue = list.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);

        return {
            total: list.length,
            units,
            low: low.length,
            out: out.length,
            healthy: healthy.length,
            costValue,
            retailValue,
            potentialProfit: retailValue - costValue,
        };
    }, [list]);

    const healthPercentage = stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0;

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();

        return list.filter((item) => {
            const matchesSearch =
                !q ||
                item.sku.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q) ||
                item.fits.toLowerCase().includes(q);

            let matchesStatus = true;
            if (stockFilter === "healthy") matchesStatus = item.qty > item.low;
            if (stockFilter === "low") matchesStatus = item.qty > 0 && item.qty <= item.low;
            if (stockFilter === "out") matchesStatus = item.qty <= 0;

            return matchesSearch && matchesStatus;
        });
    }, [list, search, stockFilter]);

    useEffect(() => {
        setPage(1);
    }, [search, stockFilter, pageSize]);

    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);
    const pageNumbers = useMemo(() => getPageNumbers(safePage, totalPages), [safePage, totalPages]);

    const tableRows = paginatedItems.map((item) => {
        const isOut = item.qty <= 0;
        const isLow = item.qty > 0 && item.qty <= item.low;
        const stockValue = Number(item.cost || 0) * Number(item.qty || 0);

        return [
            <span className="font-mono text-[11px] font-semibold">{item.sku}</span>,

            <div>
                <div className="font-medium">{item.name}</div>
                <div className="mt-0.5 text-[10px] text-[var(--text-faint)]">{item.fits || "Universal"}</div>
            </div>,

            <span className="font-mono text-xs">{currency(item.cost)}</span>,
            <span className="font-mono text-xs font-semibold">{currency(item.price)}</span>,

            <div>
                <span className={`font-mono text-sm font-bold ${
                    isOut ? "text-[var(--danger)]" : isLow ? "text-[var(--warning)]" : "text-[var(--text)]"
                }`}>
                    {item.qty}
                </span>
                <span className="ml-1.5 text-[10px] text-[var(--text-faint)]">/ min {item.low}</span>
            </div>,

            <span className="font-mono text-xs">{currency(stockValue)}</span>,

            isOut ? (
                <Badge variant="danger"><PackageX size={9} className="mr-1 inline" />Out of stock</Badge>
            ) : isLow ? (
                <Badge variant="warning"><AlertTriangle size={9} className="mr-1 inline" />Low stock</Badge>
            ) : (
                <Badge variant="success">In stock</Badge>
            ),

            <button
                type="button"
                onClick={() => navigate(`/stock/intake?sku=${item.sku}`)}
                className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
                <Pencil size={11} />
                Edit
            </button>,
        ];
    });

    return (
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Boxes size={20} className="text-[var(--primary)]" />
                            <h1 className="text-xl font-bold">Inventory</h1>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Complete overview of parts, stock levels, valuation and availability.
                        </p>
                    </div>

                    <Button variant="primary" onClick={() => navigate("/stock/intake")}>
                        <Plus size={14} />
                        Receive stock
                    </Button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-5 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                        {error} <button onClick={refetch} className="font-bold underline">Retry</button>
                    </div>
                )}

                {/* KPI GRID */}
                <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric label="Total SKUs" value={stats.total} description="Active inventory items" icon={<Boxes size={17} />} />
                    <Metric label="Units on hand" value={stats.units.toLocaleString()} description="Physical stock available" icon={<Package size={17} />} />
                    <Metric label="Low stock" value={stats.low} description="Below reorder threshold" icon={<AlertTriangle size={17} />} warning={stats.low > 0} />
                    <Metric label="Out of stock" value={stats.out} description="Requires replenishment" icon={<PackageX size={17} />} danger={stats.out > 0} />
                </div>

                {/* VALUE / HEALTH */}
                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <div className="text-sm font-bold">Stock health</div>
                                <div className="mt-1 text-[11px] text-[var(--text-muted)]">Current availability across your inventory.</div>
                            </div>
                            <div className="font-mono text-xl font-bold text-[var(--primary)]">{healthPercentage}%</div>
                        </div>

                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${healthPercentage}%` }} />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <HealthStat label="Healthy" value={stats.healthy} />
                            <HealthStat label="Low" value={stats.low} warning />
                            <HealthStat label="Empty" value={stats.out} danger />
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <div className="text-sm font-bold">Inventory valuation</div>
                                <div className="mt-1 text-[11px] text-[var(--text-muted)]">Current stock financial position.</div>
                            </div>
                            <TrendingUp size={17} className="text-[var(--secondary)]" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <ValueStat label="Cost value" value={currency(stats.costValue)} />
                            <ValueStat label="Retail value" value={currency(stats.retailValue)} primary />
                            <ValueStat label="Potential GP" value={currency(stats.potentialProfit)} secondary />
                        </div>

                        <div className="mt-5 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--text-faint)]">
                            Potential GP assumes every unit is sold at its current selling price.
                        </div>
                    </div>
                </div>

                {/* ALERTS */}
                {(stats.out > 0 || stats.low > 0) && (
                    <div className="mb-6 grid gap-3 md:grid-cols-2">
                        {stats.out > 0 && (
                            <button
                                onClick={() => setStockFilter("out")}
                                className="flex items-center justify-between rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] p-4 text-left transition-opacity hover:opacity-80"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface)]">
                                        <PackageX size={17} className="text-[var(--danger)]" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{stats.out} parts out of stock</div>
                                        <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">Click to view items requiring replenishment.</div>
                                    </div>
                                </div>
                                <ArrowDown size={15} className="text-[var(--danger)]" />
                            </button>
                        )}

                        {stats.low > 0 && (
                            <button
                                onClick={() => setStockFilter("low")}
                                className="flex items-center justify-between rounded-xl border border-[var(--warning)] bg-[var(--warning-dim)] p-4 text-left transition-opacity hover:opacity-80"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface)]">
                                        <AlertTriangle size={17} className="text-[var(--warning)]" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{stats.low} parts running low</div>
                                        <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">Review stock before parts become unavailable.</div>
                                    </div>
                                </div>
                                <ArrowUp size={15} className="text-[var(--warning)]" />
                            </button>
                        )}
                    </div>
                )}

                {/* INVENTORY */}
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
                        <div className="relative">
                            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <Input
                                className="!w-150 pl-8"
                                placeholder="Search SKU, part or vehicle…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <Select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value as "all" | "healthy" | "low" | "out")}
                            className="!w-80 sm:w-40"
                        >
                            <option value="all">All inventory</option>
                            <option value="healthy">Healthy stock</option>
                            <option value="low">Low stock</option>
                            <option value="out">Out of stock</option>
                        </Select>
                    </div>
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="h-12 animate-pulse rounded bg-[var(--surface-alt)]" />
                            ))}
                        </div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
                        <Search size={20} className="mx-auto text-[var(--text-faint)]" />
                        <div className="mt-3 text-sm font-semibold">No inventory found</div>
                        <div className="mt-1 text-xs text-[var(--text-muted)]">Try another search or stock filter.</div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        <Table
                            head={["SKU", "Part", "Cost", "Price", "On hand", "Stock value", "Status", "Actions"]}
                            rows={tableRows}
                        />

                        {/* PAGINATION — footer bar attached to the table card */}
                        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-[var(--text-muted)]">
                                Showing <span className="font-semibold text-[var(--text)]">{startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)}</span> of{" "}
                                <span className="font-semibold text-[var(--text)]">{totalItems}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                    <span>Items per page:</span>
                                    <Select
                                        value={String(pageSize)}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="!w-18 !h-7 !py-0 text-xs"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage <= 1}
                                        aria-label="Previous page"
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[var(--surface-hover)]"
                                    >
                                        <ChevronLeft size={13} />
                                    </button>

                                    {pageNumbers.map((p, idx) =>
                                        p === "ellipsis" ? (
                                            <span
                                                key={`ellipsis-${idx}`}
                                                className="px-1 text-xs text-[var(--text-faint)]"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPage(p)}
                                                aria-current={p === safePage ? "page" : undefined}
                                                className={`flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 font-mono text-xs font-semibold transition ${
                                                    p === safePage
                                                        ? "bg-[var(--primary)] text-white"
                                                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage >= totalPages}
                                        aria-label="Next page"
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[var(--surface-hover)]"
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* SMALL COMPONENTS — unchanged */

function Metric({ label, value, description, icon, warning, danger }: {
    label: string; value: string | number; description: string; icon: React.ReactNode; warning?: boolean; danger?: boolean;
}) {
    return (
        <div className={`rounded-xl border bg-[var(--surface)] p-4 ${
            danger ? "border-[var(--danger)]" : warning ? "border-[var(--warning)]" : "border-[var(--border)]"
        }`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">{label}</div>
                    <div className={`mt-2 text-2xl font-bold ${danger ? "text-[var(--danger)]" : warning ? "text-[var(--warning)]" : ""}`}>
                        {value}
                    </div>
                    <div className="mt-1 text-[10px] text-[var(--text-muted)]">{description}</div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-alt)]">{icon}</div>
            </div>
        </div>
    );
}

function HealthStat({ label, value, warning, danger }: { label: string; value: number; warning?: boolean; danger?: boolean; }) {
    return (
        <div>
            <div className={`font-mono text-lg font-bold ${danger ? "text-[var(--danger)]" : warning ? "text-[var(--warning)]" : ""}`}>{value}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
        </div>
    );
}

function ValueStat({ label, value, primary, secondary }: { label: string; value: string; primary?: boolean; secondary?: boolean; }) {
    return (
        <div>
            <div className={`font-mono text-lg font-bold ${primary ? "text-[var(--primary)]" : secondary ? "text-[var(--secondary)]" : ""}`}>{value}</div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">{label}</div>
        </div>
    );
}