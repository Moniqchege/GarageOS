import { ChevronRight, CreditCard, MapPin, MessageCircle, Phone, Star } from "lucide-react";

import { customers, useApi, get } from "@garage/api-client";
import { Badge, Card } from "@garage/ui";

const CUSTOMER_REG = "KDK 420X";

interface BusinessInfo {
    name: string;
    kra: string;
    vatRate: number;
}

// Hardcoded garage contact (set in settings)
const GARAGE_PHONE    = "0722 900 100";
const GARAGE_LOCATION = "Enterprise Rd, Industrial Area, Nairobi";

export function ProfilePage() {
    const { data: vehicles, loading: vLoading } = useApi(
        () => customers.vehicles(CUSTOMER_REG),
        [],
    );
    const { data: settings } = useApi(
        () => get<BusinessInfo>("/api/settings"),
        [],
    );

    const garageName = settings?.name ?? "Kamau & Sons Auto Garage";

    return (
        <div className="px-5 py-6">
            <h1 className="text-xl font-bold">Profile</h1>

            {/* Customer card */}
            <Card className="mt-4 flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary-dim)] text-sm font-bold text-[var(--primary)]">
                    JM
                </div>
                <div>
                    <div className="text-sm font-bold">James Mutiso</div>
                    <div className="text-xs text-[var(--text-muted)]">0722 100 220</div>
                </div>
            </Card>

            {/* Loyalty */}
            <Card className="mt-3 flex items-center gap-3 p-4">
                <Star size={18} className="text-[var(--warning)]" />
                <div>
                    <div className="text-xs font-bold">1,240 loyalty points</div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        260 points to your next free oil top-up
                    </div>
                </div>
            </Card>

            {/* Vehicles */}
            <h2 className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                My vehicles
            </h2>
            <div className="mt-2 space-y-2">
                {vLoading && (
                    <div className="h-14 animate-pulse rounded-xl bg-[var(--surface)]" />
                )}
                {(vehicles ?? []).map((v) => (
                    <Card key={v.registration} className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-mono text-xs font-bold">{v.registration}</div>
                            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{v.model}</div>
                        </div>
                        <ChevronRight size={14} className="text-[var(--text-faint)]" />
                    </Card>
                ))}
            </div>

            {/* Garage info */}
            <h2 className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Garage
            </h2>
            <Card className="mt-2 p-4">
                <div className="mb-1 text-xs font-bold">{garageName}</div>
                <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <MapPin size={11} /> {GARAGE_LOCATION}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <Phone size={11} /> {GARAGE_PHONE}
                </div>
                <div className="mt-3 flex gap-2">
                    <a
                        href={`tel:${GARAGE_PHONE.replace(/\s/g, "")}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] py-2 text-xs font-bold text-white"
                    >
                        <Phone size={12} /> Call
                    </a>
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--secondary-dim)] py-2 text-xs font-bold text-[var(--secondary)]">
                        <MessageCircle size={12} /> Message
                    </button>
                </div>
            </Card>

            {/* Payment */}
            <h2 className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Payment methods
            </h2>
            <Card className="mt-2 flex items-center gap-2.5 p-4">
                <CreditCard size={16} className="text-[var(--text-muted)]" />
                <div className="flex-1 text-xs">M-Pesa · 0722 xxx 220</div>
                <Badge variant="success">Default</Badge>
            </Card>
        </div>
    );
}
