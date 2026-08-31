import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Car,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    History,
    Package,
    Plus,
    Receipt as ReceiptIcon,
    Search,
    Trash2,
    User,
    Wrench,
} from "lucide-react";

import {
    inventory,
    jobs,
    labor,
    users as usersApi,
    customers,
    useApi,
    useMutation,
} from "@garage/api-client";

import {
    Badge,
    Button,
    Input,
    Select,
    Table,
} from "@garage/ui";

import type {
    JobCard,
    JobDiagnosisFinding,
    JobLine,
    ServiceHistoryJob,
    VehicleSearchResult,
} from "@garage/types";

import { buildJobCheckoutState } from "../../lib/checkout";

const currency = (n: number) =>
    "KSh " + Math.round(Number(n || 0)).toLocaleString("en-KE");

const formatDate = (
    value: number | bigint | string | null | undefined,
) => {
    if (value == null) return "—";

    const timestamp =
        typeof value === "bigint"
            ? Number(value)
            : typeof value === "string"
                ? Number(value)
                : value;

    if (!Number.isFinite(timestamp)) return "—";

    return new Date(timestamp).toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatMileage = (value?: number | null) =>
    value == null
        ? "—"
        : `${Number(value).toLocaleString("en-KE")} km`;

export function JobCardPage() {
    const { jobId = "" } = useParams();
    const navigate = useNavigate();

    // ---------------------------------------------------------------------
    // Current job
    // ---------------------------------------------------------------------

    const {
        data: job,
        loading: jobLoading,
        error: jobError,
        refetch: refetchJob,
    } = useApi<JobCard>(
        () => jobs.get(jobId),
        [jobId],
    );

    // ---------------------------------------------------------------------
    // Catalogues
    // ---------------------------------------------------------------------

    const { data: catalog } = useApi(
        () => labor.list(),
        [],
    );

    const { data: inventoryList } = useApi(
        () => inventory.list(),
        [],
    );

    const { data: users } = useApi(
        () => usersApi.list(),
        [],
    );

    // ---------------------------------------------------------------------
    // Vehicle history
    // ---------------------------------------------------------------------

    const {
        data: vehicleHistory,
        loading: historyLoading,
        refetch: refetchHistory,
    } = useApi<ServiceHistoryJob[]>(
        () =>
            job?.registration
                ? customers.vehicleHistory(job.registration)
                : Promise.resolve([]),
        [job?.registration],
    );

    // ---------------------------------------------------------------------
    // Local state
    // ---------------------------------------------------------------------

    const [laborPick, setLaborPick] = useState("");
    const [partPick, setPartPick] = useState("");

    const [finalMileage, setFinalMileage] = useState("");

    const [showVehicleSearch, setShowVehicleSearch] =
        useState(false);

    const [vehicleSearch, setVehicleSearch] =
        useState("");

    const [searchedVehicles, setSearchedVehicles] =
        useState<VehicleSearchResult[]>([]);

    const [searchingVehicles, setSearchingVehicles] =
        useState(false);

    const [searchError, setSearchError] =
        useState<string | null>(null);

    // ---------------------------------------------------------------------
    // Mutations
    // ---------------------------------------------------------------------

    const { mutate: updateMechanic } = useMutation(
        (mechanic: string) =>
            jobs.update(jobId, { mechanic }),
    );

    const {
        mutate: addLine,
        loading: addingLine,
    } = useMutation(
        (line: JobLine) =>
            jobs.addLine(jobId, line),
    );

    const { mutate: removeLine } = useMutation(
        (index: number) =>
            jobs.removeLine(jobId, index),
    );

    const {
        mutate: setStage,
        loading: settingStage,
    } = useMutation(
        (stage: "active" | "done") =>
            jobs.setStage(jobId, stage),
    );

    const {
        mutate: completeJob,
        loading: completingJob,
    } = useMutation(
        (mileage: number) =>
            jobs.complete(jobId, { mileage }),
    );

    // ---------------------------------------------------------------------
    // Initialize final mileage
    // ---------------------------------------------------------------------

    useEffect(() => {
        if (!job) return;

        if (job.mileageAtEnd != null) {
            setFinalMileage(
                String(job.mileageAtEnd),
            );
            return;
        }

        if (job.vehicle?.mileage != null) {
            setFinalMileage(
                String(job.vehicle.mileage),
            );
        }
    }, [job]);

    useEffect(() => {
        if (!laborPick && catalog?.length) {
            setLaborPick(catalog[0].code);
        }
    }, [catalog, laborPick]);

    useEffect(() => {
        if (!partPick && inventoryList?.length) {
            setPartPick(inventoryList[0].sku);
        }
    }, [inventoryList, partPick]);

    // ---------------------------------------------------------------------
    // Mechanics
    // ---------------------------------------------------------------------

    const mechanicOptions = useMemo(
        () =>
            (users ?? [])
                .filter(
                    (user) =>
                        user.role === "Lead Mechanic" &&
                        user.status === "Active",
                )
                .map((user) => user.name),
        [users],
    );

    // ---------------------------------------------------------------------
    // Vehicle search
    // ---------------------------------------------------------------------

    const handleVehicleSearch = async () => {
        const query = vehicleSearch.trim();

        if (!query) {
            setSearchedVehicles([]);
            setSearchError(null);
            return;
        }

        setSearchingVehicles(true);
        setSearchError(null);

        try {
            const results =
                await customers.searchVehicles(query);

            setSearchedVehicles(results);
        } catch (error) {
            setSearchedVehicles([]);

            setSearchError(
                error instanceof Error
                    ? error.message
                    : "Unable to search vehicles",
            );
        } finally {
            setSearchingVehicles(false);
        }
    };

    const handleSearchKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            void handleVehicleSearch();
        }
    };

    const openVehicleHistory = (
        registration: string,
    ) => {
        navigate(
            `/customers/${encodeURIComponent(
                registration,
            )}/history`,
        );
    };

    const createJobForVehicle = (
        registration: string,
    ) => {
        navigate(
            `/intake?registration=${encodeURIComponent(
                registration,
            )}`,
        );
    };

    // ---------------------------------------------------------------------
    // Loading / error
    // ---------------------------------------------------------------------

    if (jobLoading) {
        return (
            <div className="p-6">
                <div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-alt)]" />

                <div className="mt-4 h-32 animate-pulse rounded-xl bg-[var(--surface-alt)]" />

                <div className="mt-4 h-64 animate-pulse rounded-xl bg-[var(--surface-alt)]" />
            </div>
        );
    }

    if (jobError || !job) {
        return (
            <div className="p-6">
                <p className="text-sm text-[var(--danger)]">
                    {jobError ?? "Job not found"}
                </p>

                <Link
                    to="/"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]"
                >
                    <ArrowLeft size={13} />
                    Back to bay board
                </Link>
            </div>
        );
    }

    // ---------------------------------------------------------------------
    // Derived values
    // ---------------------------------------------------------------------

    const lines = job.lines ?? [];

    const total = lines.reduce(
        (sum, line) =>
            sum + Number(line.price || 0),
        0,
    );

    const parts = lines.filter(
        (line) => line.type === "part",
    );

    const laborLines = lines.filter(
        (line) => line.type === "labor",
    );

    const currentVehicle = job.vehicle;

    const defaultLabor = laborPick;
    const defaultPart = partPick;

    // ---------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------

    const handleAddLabor = async () => {
        const selectedCode = laborPick || catalog?.[0]?.code;

        if (!selectedCode) {
            window.alert("Please select a labor charge.");
            return;
        }
        const entry = (catalog ?? []).find(
            (item) => item.code === selectedCode,
        );
        
        if (!entry) {
            window.alert("Selected labor charge was not found.");
            return;
        }

        try {
            await addLine({
                type: "labor",
                name: entry.name,
                price: Number(entry.price),
            });

            await refetchJob();
        } catch (error) {
            console.error("Failed to add labor:", error);

            window.alert(
                error instanceof Error
                    ? error.message
                    : "Failed to add labor charge.",
            );
        }
    };

    const handleAddPart = async () => {
        const selectedSku =
            partPick || inventoryList?.[0]?.sku;

        if (!selectedSku) {
            window.alert("Please select a part.");
            return;
        }

        const part = (inventoryList ?? []).find(
            (item) => item.sku === selectedSku,
        );

        if (!part) {
            window.alert("Selected part was not found.");
            return;
        }

        if (Number(part.qty) <= 0) {
            window.alert(
                `${part.name} is currently out of stock.`,
            );
            return;
        }

        try {
            await addLine({
                type: "part",
                name: part.name,
                price: Number(part.price),
                sku: part.sku,
            });

            await refetchJob();
        } catch (error) {
            console.error("Failed to add part:", error);

            window.alert(
                error instanceof Error
                    ? error.message
                    : "Failed to add part.",
            );
        }
    };

    const handleRemoveLine = async (
        index: number,
    ) => {
        await removeLine(index);
        await refetchJob();
    };

    const handleMechanicChange = async (
        mechanic: string,
    ) => {
        await updateMechanic(mechanic);
        await refetchJob();
    };

    const handleStageChange = async (
        stage: "active" | "done",
    ) => {
        await setStage(stage);

        await refetchJob();
        await refetchHistory();
    };

    const handleCompleteJob = async () => {
        const mileage = Number(finalMileage);

        if (
            !Number.isFinite(mileage) ||
            mileage < 0
        ) {
            window.alert(
                "Please enter a valid final mileage.",
            );
            return;
        }

        const currentMileage =
            currentVehicle?.mileage ?? 0;

        if (
            currentMileage > 0 &&
            mileage < currentMileage
        ) {
            window.alert(
                `Final mileage cannot be lower than the current vehicle mileage of ${currentMileage.toLocaleString(
                    "en-KE",
                )} km.`,
            );
            return;
        }

        await completeJob(mileage);

        await refetchJob();
        await refetchHistory();

        navigate("/");
    };

    const goToCheckout = () => {
        navigate(
            "/pos/checkout",
            {
                state:
                    buildJobCheckoutState(job),
            },
        );
    };

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------

    return (
        <div className="p-6">

            {/* =============================================================
                HEADER
            ============================================================= */}

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)]"
                >
                    <ArrowLeft size={13} />
                    Back to bay board
                </Link>

                <div className="flex flex-wrap items-center gap-2">

                    <Button
                        variant="secondary"
                        onClick={() =>
                            setShowVehicleSearch(
                                (value) => !value,
                            )
                        }
                    >
                        <Search size={13} />
                        Find vehicle
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() =>
                            createJobForVehicle(
                                job.registration,
                            )
                        }
                    >
                        <Plus size={13} />
                        New job for vehicle
                    </Button>

                    <Link
                        to={`/customers/${encodeURIComponent(
                            job.registration,
                        )}/history`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                    >
                        <History size={13} />
                        Service history
                    </Link>

                    {job.stage === "parts" && (
                        <Button
                            variant="secondary"
                            onClick={() =>
                                handleStageChange(
                                    "active",
                                )
                            }
                            disabled={
                                settingStage
                            }
                        >
                            <Wrench size={13} />

                            {settingStage
                                ? "Updating…"
                                : "Spares available — resume repair"}
                        </Button>
                    )}

                </div>
            </div>

            {/* =============================================================
                VEHICLE SEARCH
            ============================================================= */}

            {showVehicleSearch && (
                <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <div className="mb-4">
                        <h2 className="flex items-center gap-2 text-sm font-bold">
                            <Search
                                size={14}
                                className="text-[var(--primary)]"
                            />
                            Find existing vehicle
                        </h2>

                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Search by registration,
                            customer name, or phone.
                            Select the existing vehicle
                            to view its history or open
                            a new job card.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            value={vehicleSearch}
                            onChange={(event) =>
                                setVehicleSearch(
                                    event.target.value,
                                )
                            }
                            onKeyDown={
                                handleSearchKeyDown
                            }
                            placeholder="Registration, customer name or phone"
                            className="flex-1"
                        />

                        <Button
                            variant="primary"
                            onClick={
                                handleVehicleSearch
                            }
                            disabled={
                                searchingVehicles ||
                                !vehicleSearch.trim()
                            }
                        >
                            <Search size={13} />

                            {searchingVehicles
                                ? "Searching…"
                                : "Search"}
                        </Button>
                    </div>

                    {searchError && (
                        <div className="mt-3 rounded-lg bg-[var(--danger-dim)] p-3 text-xs text-[var(--danger)]">
                            {searchError}
                        </div>
                    )}

                    {searchedVehicles.length > 0 && (
                        <div className="mt-4 space-y-2">

                            {searchedVehicles.map(
                                (vehicle) => (
                                    <div
                                        key={
                                            vehicle.registration
                                        }
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3"
                                    >

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Car
                                                    size={14}
                                                    className="text-[var(--primary)]"
                                                />

                                                <span className="font-mono text-sm font-bold">
                                                    {
                                                        vehicle.registration
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-1 text-sm font-semibold">
                                                {
                                                    vehicle
                                                        .customer
                                                        .name
                                                }
                                            </div>

                                            <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                                                {
                                                    vehicle
                                                        .customer
                                                        .phone
                                                }
                                                {" · "}
                                                {
                                                    vehicle
                                                        .model
                                                }
                                                {" · "}
                                                {formatMileage(
                                                    vehicle.mileage,
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">

                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    openVehicleHistory(
                                                        vehicle.registration,
                                                    )
                                                }
                                            >
                                                <History
                                                    size={13}
                                                />
                                                History
                                            </Button>

                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    createJobForVehicle(
                                                        vehicle.registration,
                                                    )
                                                }
                                            >
                                                <Plus
                                                    size={13}
                                                />
                                                New job
                                            </Button>

                                        </div>
                                    </div>
                                ),
                            )}

                        </div>
                    )}

                    {!searchingVehicles &&
                        vehicleSearch.trim() &&
                        !searchError &&
                        searchedVehicles.length ===
                            0 && (
                            <div className="mt-4 rounded-lg bg-[var(--surface-alt)] p-4 text-center text-xs text-[var(--text-muted)]">
                                No existing vehicle found.
                                Use the intake screen to
                                register a new customer and
                                vehicle.
                            </div>
                        )}
                </div>
            )}

            {/* =============================================================
                JOB HEADER
            ============================================================= */}

            <div className="mb-4">

                <div className="flex items-center gap-2">

                    <h1 className="text-2xl font-bold">
                        Job card —{" "}
                        {job.registration}
                    </h1>

                    <Badge
                        variant={
                            job.stage === "done"
                                ? "success"
                                : job.stage === "parts"
                                    ? "warning"
                                    : "default"
                        }
                    >
                        {job.stage}
                    </Badge>

                </div>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Started{" "}
                    {formatDate(job.startedAt)}
                </p>
            </div>

            {/* =============================================================
                CUSTOMER + VEHICLE
            ============================================================= */}

            <div className="mb-5 grid gap-4 md:grid-cols-2">

                {/* Customer */}

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <User
                            size={14}
                            className="text-[var(--primary)]"
                        />
                        Customer
                    </h2>

                    <div className="text-sm font-semibold">
                        {currentVehicle
                            ?.customer?.name ??
                            job.customer ??
                            "—"}
                    </div>

                    <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {currentVehicle
                            ?.customer?.phone ??
                            job.phone ??
                            "No phone"}
                    </div>

                    {currentVehicle
                        ?.customer?.email && (
                        <div className="mt-1 text-xs text-[var(--text-muted)]">
                            {
                                currentVehicle
                                    .customer
                                    .email
                            }
                        </div>
                    )}

                </div>

                {/* Vehicle */}

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <Car
                            size={14}
                            className="text-[var(--primary)]"
                        />
                        Vehicle
                    </h2>

                    <div className="flex flex-wrap items-center gap-3">

                        <span className="font-mono text-lg font-bold text-[var(--primary)]">
                            {job.registration}
                        </span>

                        <span className="text-sm">
                            {currentVehicle
                                ?.model ??
                                "Vehicle model unavailable"}
                        </span>

                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">

                        {currentVehicle?.year && (
                            <span>
                                Year:{" "}
                                {
                                    currentVehicle
                                        .year
                                }
                            </span>
                        )}

                        {currentVehicle?.color && (
                            <span>
                                Colour:{" "}
                                {
                                    currentVehicle
                                        .color
                                }
                            </span>
                        )}

                        <span>
                            Current mileage:{" "}
                            <span className="font-mono">
                                {formatMileage(
                                    currentVehicle
                                        ?.mileage,
                                )}
                            </span>
                        </span>

                    </div>
                </div>
            </div>

            {/* =============================================================
                MECHANIC + FAULT
            ============================================================= */}

            <div className="mb-5 flex flex-wrap items-center gap-4">

                <div className="w-56">

                    <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        Assign lead mechanic
                    </div>

                    <Select
                        value={
                            job.mechanic
                        }
                        onChange={(event) =>
                            handleMechanicChange(
                                event.target.value,
                            )
                        }
                    >

                        {mechanicOptions.length ===
                            0 && (
                            <option
                                value={
                                    job.mechanic
                                }
                            >
                                {job.mechanic ||
                                    "—"}
                            </option>
                        )}

                        {mechanicOptions.map(
                            (mechanic) => (
                                <option
                                    key={
                                        mechanic
                                    }
                                    value={
                                        mechanic
                                    }
                                >
                                    {mechanic}
                                </option>
                            ),
                        )}

                    </Select>
                </div>

                <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-muted)]">

                    <span className="mr-2 font-semibold text-[var(--text)]">
                        Reported fault:
                    </span>

                    {job.faults ||
                        "No fault description"}

                </div>
            </div>

            {/* =============================================================
                DIAGNOSIS
            ============================================================= */}

            {(job.diagnosisNotes ||
                (job.diagnosisFindings?.length ??
                    0) > 0) && (

                <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <div className="flex items-center justify-between">

                        <h2 className="flex items-center gap-2 text-sm font-bold">
                            <ClipboardList
                                size={14}
                                className="text-[var(--primary)]"
                            />
                            Diagnosis
                        </h2>

                        <Link
                            to={`/jobs/${job.id}/diagnosis`}
                            className="text-xs font-semibold text-[var(--primary)]"
                        >
                            Edit diagnosis
                        </Link>

                    </div>

                    {job.diagnosisNotes && (
                        <p className="mt-3 text-sm text-[var(--text-muted)]">
                            {
                                job.diagnosisNotes
                            }
                        </p>
                    )}

                    {(job.diagnosisFindings
                        ?.length ?? 0) >
                        0 && (

                        <div className="mt-3 space-y-2">

                            {job.diagnosisFindings?.map(
                                (
                                    finding: JobDiagnosisFinding,
                                ) => (

                                    <div
                                        key={
                                            finding.id
                                        }
                                        className="rounded-lg bg-[var(--surface-alt)] p-3"
                                    >

                                        <div className="flex items-center gap-2">

                                            <span className="text-sm font-semibold">
                                                {
                                                    finding.label
                                                }
                                            </span>

                                            <Badge
                                                variant={
                                                    finding.severity ===
                                                    "danger"
                                                        ? "danger"
                                                        : finding.severity ===
                                                            "warning"
                                                            ? "warning"
                                                            : "success"
                                                }
                                            >
                                                {
                                                    finding.severity
                                                }
                                            </Badge>

                                        </div>

                                        <div className="mt-1 text-xs text-[var(--text-muted)]">
                                            {
                                                finding.note
                                            }
                                        </div>

                                    </div>
                                ),
                            )}

                        </div>
                    )}
                </div>
            )}

            {/* =============================================================
                LABOR + PARTS
            ============================================================= */}

            <div className="mb-5 grid gap-4 md:grid-cols-2">

                {/* Labor */}

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <Wrench
                            size={14}
                            className="text-[var(--primary)]"
                        />
                        Labor charge selector
                    </h2>

                    <div className="flex gap-2">

                        <Select
                            value={laborPick}
                            onChange={(event) =>
                                setLaborPick(event.target.value)
                            }
                        >
                            {(catalog ?? []).map((item) => (
                                <option
                                    key={item.code}
                                    value={item.code}
                                >
                                    {item.name} — {currency(item.price)}
                                </option>
                            ))}
                        </Select>

                        <Button
                            variant="secondary"
                            onClick={
                                handleAddLabor
                            }
                            disabled={
                                addingLine ||
                                !catalog?.length
                            }
                        >
                            <Plus
                                size={13}
                            />
                        </Button>

                    </div>
                </div>

                {/* Parts */}

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <Package
                            size={14}
                            className="text-[var(--primary)]"
                        />
                        Parts pull selector
                    </h2>

                    <div className="flex gap-2">

                        <Select
                            value={partPick}
                            onChange={(event) =>
                                setPartPick(event.target.value)
                            }
                        >
                            {(inventoryList ?? []).map((item) => (
                                <option
                                    key={item.sku}
                                    value={item.sku}
                                >
                                    {item.name} — {currency(item.price)} (
                                    {item.qty} in stock)
                                </option>
                            ))}
                        </Select>

                        <Button
                            variant="secondary"
                            onClick={
                                handleAddPart
                            }
                            disabled={
                                addingLine ||
                                !inventoryList?.length
                            }
                        >
                            <Plus
                                size={13}
                            />
                        </Button>

                    </div>
                </div>
            </div>

            {/* =============================================================
                JOB LINES
            ============================================================= */}

            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <ReceiptIcon
                    size={14}
                    className="text-[var(--primary)]"
                />
                Job line items
            </h2>

            <Table
                head={[
                    "Type",
                    "Description",
                    "Amount",
                    "",
                ]}
                rows={lines.map(
                    (
                        line: JobLine,
                        index: number,
                    ) => [
                        <Badge
                            key={`type-${index}`}
                            variant={
                                line.type ===
                                "labor"
                                    ? "default"
                                    : "success"
                            }
                        >
                            {line.type}
                        </Badge>,

                        line.name,

                        currency(
                            line.price,
                        ),

                        <button
                            key={`remove-${index}`}
                            type="button"
                            onClick={() =>
                                handleRemoveLine(
                                    index,
                                )
                            }
                            className="text-[var(--text-faint)] hover:text-[var(--danger)]"
                            title="Remove line"
                        >
                            <Trash2
                                size={13}
                            />
                        </button>,
                    ],
                )}
            />

            {/* =============================================================
                TOTAL
            ============================================================= */}

            <div className="mt-4 flex flex-wrap items-center justify-end gap-5">

                <div className="text-sm text-[var(--text-muted)]">
                    {laborLines.length}{" "}
                    labor ·{" "}
                    {parts.length} parts
                </div>

                <div className="text-sm text-[var(--text-muted)]">
                    Job total
                </div>

                <div className="font-mono text-2xl font-bold text-[var(--primary)]">
                    {currency(total)}
                </div>

                <Button
                    variant="primary"
                    disabled={
                        lines.length === 0
                    }
                    onClick={
                        goToCheckout
                    }
                >
                    <CreditCard
                        size={14}
                    />
                    Checkout
                </Button>
            </div>

            {/* =============================================================
                COMPLETE REPAIR
            ============================================================= */}

            {job.stage === "active" && (

                <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <div className="mb-4">

                        <h2 className="flex items-center gap-2 text-sm font-bold">
                            <CheckCircle2
                                size={14}
                                className="text-[var(--primary)]"
                            />
                            Complete repair
                        </h2>

                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Record the vehicle's
                            final mileage.
                            Completing the job
                            adds it to the
                            vehicle's permanent
                            service history.
                        </p>

                    </div>

                    <div className="flex flex-wrap items-end gap-3">

                        <div>

                            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                Final mileage
                            </label>

                            <Input
                                type="number"
                                min={
                                    currentVehicle
                                        ?.mileage ??
                                    0
                                }
                                value={
                                    finalMileage
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setFinalMileage(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                className="!w-48"
                            />

                        </div>

                        <Button
                            variant="primary"
                            onClick={
                                handleCompleteJob
                            }
                            disabled={
                                completingJob ||
                                !finalMileage
                            }
                        >
                            <CheckCircle2
                                size={13}
                            />

                            {completingJob
                                ? "Completing…"
                                : "Mark ready for pickup"}
                        </Button>

                    </div>
                </div>
            )}

            {/* =============================================================
                SERVICE HISTORY
            ============================================================= */}

            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="flex items-center gap-2 text-sm font-bold">
                            <History
                                size={14}
                                className="text-[var(--primary)]"
                            />
                            Vehicle service history
                        </h2>

                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Previous completed work
                            for{" "}
                            {job.registration}
                        </p>

                    </div>

                    <Link
                        to={`/customers/${encodeURIComponent(
                            job.registration,
                        )}/history`}
                        className="text-xs font-semibold text-[var(--primary)]"
                    >
                        View full history
                    </Link>

                </div>

                {historyLoading ? (

                    <div className="mt-4 h-12 animate-pulse rounded-lg bg-[var(--surface-alt)]" />

                ) : !vehicleHistory?.length ? (

                    <div className="mt-4 rounded-lg bg-[var(--surface-alt)] p-4 text-center text-xs text-[var(--text-muted)]">
                        No previous completed
                        services for this
                        vehicle.
                    </div>

                ) : (

                    <div className="mt-4 space-y-2">

                        {vehicleHistory
                            .slice(0, 5)
                            .map(
                                (
                                    historyJob: ServiceHistoryJob,
                                ) => (

                                    <Link
                                        key={
                                            historyJob.id
                                        }
                                        to={`/jobs/${historyJob.id}`}
                                        className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--surface-alt)]"
                                    >

                                        <div>

                                            <div className="text-sm font-semibold">
                                                {
                                                    historyJob.id
                                                }
                                            </div>

                                            <div className="text-xs text-[var(--text-muted)]">

                                                {formatDate(
                                                    historyJob.completedAt,
                                                )}

                                                {historyJob.mileageAtEnd !=
                                                    null && (
                                                    <>
                                                        {" · "}
                                                        {Number(
                                                            historyJob.mileageAtEnd,
                                                        ).toLocaleString(
                                                            "en-KE",
                                                        )}{" "}
                                                        km
                                                    </>
                                                )}

                                                {historyJob.faults && (
                                                    <>
                                                        {" · "}
                                                        {
                                                            historyJob.faults
                                                        }
                                                    </>
                                                )}

                                            </div>

                                        </div>

                                        <div className="font-mono text-sm font-semibold">
                                            {currency(
                                                historyJob.total ??
                                                    (
                                                        historyJob.lines ??
                                                        []
                                                    ).reduce(
                                                        (
                                                            sum,
                                                            line,
                                                        ) =>
                                                            sum +
                                                            Number(
                                                                line.price ||
                                                                    0,
                                                            ),
                                                        0,
                                                    ),
                                            )}
                                        </div>

                                    </Link>
                                ),
                            )}

                    </div>
                )}
            </div>

        </div>
    );
}