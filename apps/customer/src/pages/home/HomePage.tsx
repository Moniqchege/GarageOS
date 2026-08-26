import {
    Bell,
    Calendar,
    Car,
    ChevronRight,
    CreditCard,
    Gauge,
    MessageCircle,
    Phone,
    Plus,
    Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { customers, useApi } from "@garage/api-client";
import { Badge, Card } from "@garage/ui";

// Demo: the logged-in customer's registration plate
const CUSTOMER_REG = "KDK 420X";

const quick = [
    { label: "Book a service",      icon: Calendar,       path: "/book"    },
    { label: "Vehicle diagnostics", icon: Gauge,          path: "/vehicle" },
    { label: "Message garage",      icon: MessageCircle,  path: "/profile" },
    { label: "Call garage",         icon: Phone,          path: "/profile" },
];

export function HomePage() {
    const navigate = useNavigate();

    const { data: vehicles, loading } = useApi(
        () => customers.vehicles(CUSTOMER_REG),
        [],
    );
    const { data: notifications } = useApi(
        () => customers.notifications(CUSTOMER_REG),
        [],
    );

    const vehicle  = vehicles?.[0];
    const unread   = (notifications ?? []).filter((n) => !n.read).length;

    return (
        <div className="px-5 py-6">
            <div className="mb-2 flex items-start justify-between">
                <div>
                    <div className="text-xs text-[var(--text-muted)]">Good afternoon,</div>
                    <h1 className="text-xl font-bold">James Mutiso</h1>
                </div>
                <button
                    onClick={() => navigate("/alerts")}
                    className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5"
                >
                    <Bell size={16} />
                    {unread > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-bold text-white">
                            {unread}
                        </span>
                    )}
                </button>
            </div>

            {/* Vehicle chips */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {(vehicles ?? []).map((v) => (
                    <button
                        key={v.registration}
                        onClick={() => navigate("/vehicle")}
                        className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--primary)] bg-[var(--primary-dim)] px-3 py-2 font-mono text-xs font-bold text-[var(--primary)]"
                    >
                        <Car size={13} /> {v.registration}
                    </button>
                ))}
                <button className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-[var(--text-faint)] px-3 py-2 text-xs text-[var(--text-muted)]">
                    <Plus size={12} /> Add vehicle
                </button>
            </div>

            {/* Primary vehicle card */}
            {loading && (
                <div className="mt-4 h-40 animate-pulse rounded-xl bg-[var(--surface)]" />
            )}

            {vehicle && (
                <Card className="mt-4 overflow-hidden">
                    <div className="bg-gradient-to-br from-white to-[var(--surface-alt)] p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-mono text-lg font-bold">{vehicle.registration}</div>
                                <div className="mt-1 text-xs text-[var(--text-muted)]">
                                    {vehicle.model} · {vehicle.year} · {vehicle.color}
                                </div>
                            </div>
                            <Badge variant={vehicle.health >= 80 ? "success" : "warning"}>
                                {vehicle.health}% health
                            </Badge>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] uppercase text-[var(--text-faint)]">Mileage</div>
                                <div className="mt-1 text-sm font-semibold">
                                    {vehicle.mileage.toLocaleString()} km
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-[var(--text-faint)]">Next service</div>
                                <div className="mt-1 text-sm font-semibold">{vehicle.nextServiceDate}</div>
                            </div>
                        </div>
                    </div>

                    {/* Active job banner */}
                    {vehicle.activeJob && (
                        <button
                            onClick={() => navigate("/vehicle")}
                            className="flex w-full items-center gap-3 border-t border-[var(--border)] p-4 text-left"
                        >
                            <div className="rounded-full bg-[var(--primary-dim)] p-2">
                                <Wrench size={15} className="text-[var(--primary)]" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold">
                                    {vehicle.activeJob.stage === "done"
                                        ? "Ready for pickup"
                                        : "Your car is in the workshop"}
                                </div>
                                <div className="mt-1 text-[10px] text-[var(--text-muted)]">
                                    {vehicle.activeJob.faults}
                                </div>
                            </div>
                            <ChevronRight size={15} className="text-[var(--text-faint)]" />
                        </button>
                    )}
                </Card>
            )}

            {/* Quick actions */}
            <h2 className="mt-6 text-sm font-bold">Quick actions</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
                {quick.map(({ label, icon: Icon, path }) => (
                    <button
                        key={label}
                        onClick={() => navigate(path)}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left"
                    >
                        <Icon size={18} className="text-[var(--primary)]" />
                        <span className="mt-3 block text-xs font-semibold">{label}</span>
                    </button>
                ))}
            </div>

            {/* Payment method */}
            <Card className="mt-4 p-4">
                <div className="flex items-center gap-3">
                    <CreditCard size={17} className="text-[var(--text-muted)]" />
                    <div className="flex-1 text-xs">M-Pesa · 0722 xxx 220</div>
                    <Badge variant="success">Default</Badge>
                </div>
            </Card>

            {/* Next service target */}
            {vehicle && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <Gauge size={18} className="text-[var(--secondary)]" />
                    <div>
                        <div className="text-xs font-semibold">Next service target</div>
                        <div className="mt-1 text-[10px] text-[var(--text-muted)]">
                            {vehicle.nextServiceKm.toLocaleString()} km
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
