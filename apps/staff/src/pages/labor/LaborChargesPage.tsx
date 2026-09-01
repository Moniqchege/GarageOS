import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Edit3,
    Plus,
    Search,
    Trash2,
    Wrench,
    X,
} from "lucide-react";

import { labor, useApi, useMutation } from "@garage/api-client";
import { Badge, Button, Input, Select, Table } from "@garage/ui";
import type { LaborCharge } from "@garage/types";

const categories = [
    "Diagnostics",
    "Suspension",
    "Brakes",
    "Engine & Servicing",
    "Electrical",
    "Bodywork",
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const currency = (value: number) =>
    `KSh ${Math.round(Number(value) || 0).toLocaleString("en-KE")}`;

export function LaborChargesPage() {
    const {
        data: charges,
        loading,
        error,
        refetch,
    } = useApi(() => labor.list(), []);

    const { mutate: removeCharge, loading: removing } = useMutation(
        labor.remove,
    );

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Replaces window.confirm — holds the charge pending deletion, or
    // null when the dialog is closed.
    const [pendingDelete, setPendingDelete] = useState<LaborCharge | null>(null);

    const list = charges ?? [];

    const filtered = useMemo(() => {
        const search = query.trim().toLowerCase();

        return [...list]
            .filter((charge) => {
                const matchesCategory =
                    category === "All" || charge.category === category;

                if (!matchesCategory) return false;

                if (!search) return true;

                return (
                    charge.code.toLowerCase().includes(search) ||
                    charge.name.toLowerCase().includes(search) ||
                    charge.category.toLowerCase().includes(search)
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [list, query, category]);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize),
    );

    const safePage = Math.min(page, totalPages);

    const paginated = filtered.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    const totalItems = filtered.length;
    const startIndex =
        totalItems === 0 ? 0 : (safePage - 1) * pageSize;
    const pageNumbers = useMemo(() => {
        const pages: (number | "ellipsis")[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        pages.push(1);

        if (safePage > 4) {
            pages.push("ellipsis");
        }

        const start = Math.max(2, safePage - 1);
        const end = Math.min(totalPages - 1, safePage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (safePage < totalPages - 3) {
            pages.push("ellipsis");
        }

        pages.push(totalPages);

        return pages;
    }, [safePage, totalPages]);

    const averageCharge =
        list.length > 0
            ? Math.round(
                  list.reduce(
                      (sum, charge) => sum + Number(charge.price || 0),
                      0,
                  ) / list.length,
              )
            : 0;

    const categoryCount = new Set(
        list.map((charge) => charge.category),
    ).size;

    const handleSearch = (value: string) => {
        setQuery(value);
        setPage(1);
    };

    const handleCategory = (value: string) => {
        setCategory(value);
        setPage(1);
    };

    const handlePageSize = (value: number) => {
        setPageSize(value);
        setPage(1);
    };

    const confirmRemove = async () => {
        if (!pendingDelete) return;

        try {
            await removeCharge(pendingDelete.code);
            await refetch();
            setPendingDelete(null);
        } catch {
            // Leave the dialog open on failure so the user can see the
            // error banner above and retry or cancel.
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-dim)]">
                            <Wrench
                                size={20}
                                className="text-[var(--primary)]"
                            />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Labor Rate Schedule
                            </h1>
                            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                                Manage the labor services and rates used across
                                job cards.
                            </p>
                        </div>
                    </div>
                </div>

                <Link to="/labor/new">
                    <Button variant="primary">
                        <Plus size={15} />
                        Add labor rate
                    </Button>
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center justify-between rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    <span>{error}</span>

                    <button
                        className="font-bold underline"
                        onClick={refetch}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SummaryCard
                    label="Total labor rates"
                    value={list.length.toLocaleString("en-KE")}
                    description="Active services in the schedule"
                />

                <SummaryCard
                    label="Categories"
                    value={categoryCount.toLocaleString("en-KE")}
                    description="Service categories configured"
                />

                <SummaryCard
                    label="Average charge"
                    value={currency(averageCharge)}
                    description="Average labor rate"
                />
            </div>

            {/* Main content */}
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
                    <div className="relative">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            className="!w-150 pl-8"
                            placeholder="Search services or codes..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <Select
                        value={category}
                        onChange={(e) =>
                            handleCategory(e.target.value)
                        }
                        className="!w-80 sm:w-52"
                    >
                        <option value="All">All categories</option>

                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                {/* Table */}
                {loading ? (
                    <div className="space-y-2 p-4">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div
                                key={n}
                                className="h-12 animate-pulse rounded-lg bg-[var(--surface-alt)]"
                            />
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <EmptyState
                        hasFilters={Boolean(query) || category !== "All"}
                        onClear={() => {
                            setQuery("");
                            setCategory("All");
                            setPage(1);
                        }}
                    />
                ) : (
                    <>
                        <Table
                            head={[
                                "Code",
                                "Description",
                                "Category",
                                "Charge",
                                "Actions",
                            ]}
                            rows={paginated.map((charge) => [
                                <span
                                    key={`${charge.code}-code`}
                                    className="font-mono text-[11px] font-medium text-[var(--text-muted)]"
                                >
                                    {charge.code}
                                </span>,

                                <div
                                    key={`${charge.code}-name`}
                                    className="font-medium"
                                >
                                    {charge.name}
                                </div>,

                                <Badge key={`${charge.code}-category`}>
                                    {charge.category}
                                </Badge>,

                                <span
                                    key={`${charge.code}-price`}
                                    className="font-mono font-semibold"
                                >
                                    {currency(charge.price)}
                                </span>,

                                <div
                                    key={`${charge.code}-actions`}
                                    className="flex items-center gap-1"
                                >
                                    <Link to={`/labor/${charge.code}/edit`}>
                                        <button
                                            type="button"
                                            title="Edit labor rate"
                                            className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                                        >
                                            <Edit3 size={15} />
                                            Edit
                                        </button>
                                    </Link>

                                    <button
                                        type="button"
                                        title="Remove labor rate"
                                        onClick={() => setPendingDelete(charge)}
                                        className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                                    >
                                        <Trash2 size={15} />
                                        Delete
                                    </button>
                                </div>,
                            ])}
                        />

                        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Result count */}
                            <div className="text-xs text-[var(--text-muted)]">
                                Showing{" "}
                                <span className="font-semibold text-[var(--text)]">
                                    {startIndex + 1}–
                                    {Math.min(startIndex + pageSize, totalItems)}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-[var(--text)]">
                                    {totalItems}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                    <span>Items per page:</span>
                                    <Select
                                        value={String(pageSize)}
                                        onChange={(e) =>
                                            handlePageSize(Number(e.target.value))
                                        }
                                        className="!h-7 !w-18 !py-0 text-xs"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.max(1, current - 1),
                                            )
                                        }
                                        disabled={safePage <= 1}
                                        aria-label="Previous page"
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={13} />
                                    </button>
                                    {pageNumbers.map((item, index) =>
                                        item === "ellipsis" ? (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="px-1 text-xs text-[var(--text-faint)]"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setPage(item)}
                                                aria-current={
                                                    item === safePage
                                                        ? "page"
                                                        : undefined
                                                }
                                                className={`flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 font-mono text-xs font-semibold transition ${item === safePage
                                                    ? "bg-[var(--primary)] text-white"
                                                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ),
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.min(totalPages, current + 1),
                                            )
                                        }
                                        disabled={safePage >= totalPages}
                                        aria-label="Next page"
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* DELETE CONFIRMATION DIALOG */}
            <ConfirmDeleteDialog
                charge={pendingDelete}
                loading={removing}
                onCancel={() => setPendingDelete(null)}
                onConfirm={confirmRemove}
            />
        </div>
    );
}

function ConfirmDeleteDialog({
    charge,
    loading,
    onCancel,
    onConfirm,
}: {
    charge: LaborCharge | null;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const open = Boolean(charge);

    useEffect(() => {
        if (!open) return;

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKey);

        return () => {
            window.removeEventListener("keydown", handleKey);
        };
    }, [open, loading, onCancel]);

    if (!open || !charge) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                onClick={() => {
                    if (!loading) onCancel();
                }}
            />

            {/* Dialog */}
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            >
                {/* Danger header */}
                <div className="border-b border-[var(--border)] bg-[var(--danger-dim)] px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--danger)]/10">
                            <AlertTriangle
                                size={20}
                                className="text-[var(--danger)]"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2
                                id="delete-dialog-title"
                                className="text-sm font-bold text-[var(--text)]"
                            >
                                Remove labor rate
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-[var(--danger)]/80">
                                This action permanently removes this service
                                from your labor rate schedule.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            aria-label="Close dialog"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--danger)]/70 transition hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>

                {/* Service being deleted */}
                <div className="p-5">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Labor service
                    </p>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]">
                        {/* Service identity */}
                        <div className="flex items-start gap-3 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-dim)]">
                                <Wrench
                                    size={17}
                                    className="text-[var(--primary)]"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold text-[var(--text)]">
                                        {charge.name}
                                    </h3>

                                    <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[var(--text-muted)]">
                                        {charge.code}
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <Badge>{charge.category}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Service details */}
                        <div className="grid grid-cols-2 border-t border-[var(--border)]">
                            <div className="border-r border-[var(--border)] px-4 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                    Category
                                </p>

                                <p className="mt-1 text-xs font-semibold text-[var(--text)]">
                                    {charge.category}
                                </p>
                            </div>

                            <div className="px-4 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                    Current charge
                                </p>

                                <p className="mt-1 font-mono text-xs font-semibold text-[var(--text)]">
                                    KSh{" "}
                                    {Number(charge.price || 0).toLocaleString(
                                        "en-KE",
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div
                        id="delete-dialog-description"
                        className="mt-4 flex gap-2.5 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger-dim)] px-3 py-2.5"
                    >
                        <AlertTriangle
                            size={14}
                            className="mt-0.5 shrink-0 text-[var(--danger)]"
                        />

                        <p className="text-xs leading-5 text-[var(--text-muted)]">
                            Removing this rate means it will no longer be
                            available for selection on new job cards.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface-alt)] px-5 py-4 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Keep labor rate
                    </Button>

                    <Button
                        type="button"
                        variant="primary"
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full !bg-[var(--danger)] !text-white hover:!opacity-90 sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Removing…
                            </>
                        ) : (
                            <>
                                <Trash2 size={14} />
                                Remove rate
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}


function SummaryCard({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold">{value}</p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
                {description}
            </p>
        </div>
    );
}

function EmptyState({
    hasFilters,
    onClear,
}: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-alt)]">
                <Wrench
                    size={20}
                    className="text-[var(--text-muted)]"
                />
            </div>

            <h3 className="font-semibold">
                {hasFilters
                    ? "No matching labor rates"
                    : "No labor rates yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                {hasFilters
                    ? "Try changing your search or category filter."
                    : "Add your first labor rate to start building the garage service schedule."}
            </p>

            {hasFilters && (
                <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={onClear}
                >
                    Clear filters
                </Button>
            )}
        </div>
    );
}