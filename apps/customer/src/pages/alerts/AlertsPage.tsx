import { Calendar, FileText, Sparkles, Wrench } from "lucide-react";

import { customers, useApi, useMutation } from "@garage/api-client";
import { Card } from "@garage/ui";
import type { CustomerNotification } from "@garage/types";

const CUSTOMER_REG = "KDK 420X";

const notifIcon = {
    job:      Wrench,
    reminder: Calendar,
    promo:    Sparkles,
    invoice:  FileText,
} as const;

const notifColor: Record<CustomerNotification["type"], string> = {
    job:      "text-[var(--primary)] bg-[var(--primary-dim)]",
    reminder: "text-[var(--warning)] bg-[var(--warning-dim)]",
    promo:    "text-[var(--secondary)] bg-[var(--secondary-dim)]",
    invoice:  "text-[var(--info)] bg-[var(--info)]/10",
};

export function AlertsPage() {
    const { data, loading, refetch } = useApi(
        () => customers.notifications(CUSTOMER_REG),
        [],
    );
    const { mutate: readAll } = useMutation(
        () => customers.markAllRead(CUSTOMER_REG),
    );

    const notifications = data ?? [];
    const unread        = notifications.filter((n) => !n.read).length;

    const handleMarkAll = async () => {
        await readAll();
        refetch();
    };

    return (
        <div className="px-5 py-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold">Alerts</h1>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {loading ? "…" : `${unread} unread`}
                    </p>
                </div>
                <button
                    onClick={handleMarkAll}
                    className="text-xs font-bold text-[var(--primary)]"
                >
                    Mark all read
                </button>
            </div>

            <div className="mt-4 space-y-2.5">
                {loading &&
                    [1, 2, 3].map((n) => (
                        <div key={n} className="h-20 animate-pulse rounded-xl bg-[var(--surface)]" />
                    ))}

                {notifications.map((n) => {
                    const Icon = notifIcon[n.type];
                    return (
                        <Card
                            key={n.id}
                            className={`flex items-start gap-3 p-4 ${n.read ? "opacity-65" : ""}`}
                        >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notifColor[n.type]}`}>
                                <Icon size={15} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between gap-2">
                                    <span className="text-sm font-bold">{n.title}</span>
                                    {!n.read && (
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]" />
                                    )}
                                </div>
                                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                                    {n.body}
                                </p>
                                <div className="mt-1 text-[10px] text-[var(--text-faint)]">
                                    {n.time}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
