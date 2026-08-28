import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Car, ClipboardList, Plus, Search, UserPlus } from "lucide-react";

import { customers, jobs, useMutation } from "@garage/api-client";
import { Button, Card, Field, Input, Textarea } from "@garage/ui";
import type { VehicleSearchResult } from "@garage/types";

const formatMileage = (value?: number | null) =>
    value == null ? "—" : `${Number(value).toLocaleString("en-KE")} km`;

export function IntakePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("registration") ?? "");
    const [results, setResults] = useState<VehicleSearchResult[]>([]);
    const [selected, setSelected] = useState<VehicleSearchResult | null>(null);
    const [faults, setFaults] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const fuelLabels = ["E", "1/4", "1/2", "3/4", "F"];
    const [mileage, setMileage] = useState("");
    const [fuel, setFuel] = useState(2);

    const { mutate: createJob, loading, error } = useMutation(
        (data: Parameters<typeof jobs.create>[0]) => jobs.create(data),
    );

    const selectVehicle = (vehicle: VehicleSearchResult) => {
        setSelected(vehicle);
        setMileage(String(vehicle.mileage ?? ""));
        setFuel(vehicle.fuel ?? 2);
    };

    const runSearch = async (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setSearching(true);
        setSearchError(null);

        try {
            const matches = await customers.searchVehicles(trimmed);
            setResults(matches);
            setHasSearched(true);

            if (matches.length === 1) {
                setSelected(matches[0]);
            }
        } catch (err) {
            setResults([]);
            setSearchError(err instanceof Error ? err.message : "Unable to search vehicles");
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        const reg = searchParams.get("registration");
        if (reg) void runSearch(reg);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            void runSearch(query);
        }
    };

    const changeVehicle = () => {
        setSelected(null);
        setFaults("");
    };

    const create = async () => {
        if (!selected) return;

        const job = await createJob({
            registration: selected.registration,
            customer: selected.customer.name,
            phone: selected.customer.phone,
            mechanic: "",
            faults,
            mileageAtStart: mileage ? Number(mileage) : undefined,
            fuel,
        });

        if (job) navigate("/");
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">Registration &amp; Assessment</h1>
                        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            New job
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Find an existing vehicle and log the reported fault to open a job card.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                    <ArrowLeft size={14} /> View Bay Board
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            )}

            {!selected ? (
                <Card className="p-5">
                    <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dim)] text-[var(--primary)]">
                            <Search size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">Find vehicle</h2>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                Search by registration, customer name, or phone.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            className="flex-1 font-mono text-base tracking-wide"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Registration, customer name or phone"
                        />
                        <Button
                            variant="primary"
                            onClick={() => void runSearch(query)}
                            disabled={searching || !query.trim()}
                        >
                            <Search size={13} />
                            {searching ? "Searching…" : "Search"}
                        </Button>
                    </div>

                    {searchError && (
                        <div className="mt-3 rounded-lg bg-[var(--danger-dim)] p-3 text-xs text-[var(--danger)]">
                            {searchError}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {results.map((vehicle) => (
                                <button
                                    key={vehicle.registration}
                                    type="button"
                                    onClick={() => setSelected(vehicle)}
                                    className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3 text-left hover:bg-[var(--surface-alt)]"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Car size={14} className="text-[var(--primary)]" />
                                            <span className="font-mono text-sm font-bold">
                                                {vehicle.registration}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm font-semibold">
                                            {vehicle.customer.name}
                                        </div>
                                        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                                            {vehicle.customer.phone} {" · "} {vehicle.model} {" · "}
                                            {formatMileage(vehicle.mileage)}
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-[var(--primary)]">
                                        Select
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {!searching && hasSearched && !searchError && results.length === 0 && (
                        <div className="mt-4 rounded-lg bg-[var(--surface-alt)] p-4 text-center text-xs text-[var(--text-muted)]">
                            No existing vehicle found for "{query}".
                            <Link
                                to={`/vehicles/register?registration=${encodeURIComponent(
                                    query.toUpperCase(),
                                )}`}
                                className="ml-1 inline-flex items-center gap-1 font-semibold text-[var(--primary)]"
                            >
                                <UserPlus size={12} />
                                Register a new customer and vehicle
                            </Link>
                        </div>
                    )}
                </Card>
            ) : (
                <Card className="p-5">
                    <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dim)] text-[var(--primary)]">
                                <ClipboardList size={16} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold">Reported fault</h2>
                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                    Confirm the vehicle and capture what the driver reported.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={changeVehicle}
                            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)]"
                        >
                            Change vehicle
                        </button>
                    </div>

                    <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                        <div className="flex items-center gap-2">
                            <Car size={14} className="text-[var(--primary)]" />
                            <span className="font-mono text-sm font-bold">
                                {selected.registration}
                            </span>
                        </div>
                        <div className="mt-1 text-sm font-semibold">{selected.customer.name}</div>
                        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                            {selected.customer.phone} {" · "} {selected.model} {" · "}
                            {formatMileage(selected.mileage)}
                        </div>
                    </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <Field label="Current mileage (km)">
                                <Input
                                    value={mileage}
                                    onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))}
                                    placeholder="e.g. 84200"
                                />
                            </Field>
                            <Field label="Fuel status">
                                <div className="px-1 pt-2">
                                    <input
                                        type="range"
                                        min={0}
                                        max={4}
                                        value={fuel}
                                        onChange={(e) => setFuel(Number(e.target.value))}
                                        className="w-full accent-[var(--primary)]"
                                    />
                                    <div className="mt-1 flex justify-between text-[11px] text-[var(--text-muted)]">
                                        {fuelLabels.map((label, index) => (
                                            <span
                                                key={label}
                                                className={fuel === index ? "font-bold text-[var(--primary)]" : ""}
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Field>
                        </div>

                         <Field label="Reported mechanical faults">
                        <Textarea
                            value={faults}
                            onChange={(e) => setFaults(e.target.value)}
                            placeholder="Describe what the driver reported…"
                            className="min-h-[120px]"
                            />
                    </Field>

                    <div className="mt-5 flex justify-end border-t border-[var(--border)] pt-4">
                        <Button
                            variant="primary"
                            onClick={create}
                            disabled={loading}
                            className="justify-center px-5"
                        >
                            <Plus size={14} />
                            {loading ? "Creating…" : "Create job card"}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}