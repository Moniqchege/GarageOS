import { useState, type ReactNode } from "react";
import {
    AlertTriangle,
    Bell,
    Power,
} from "lucide-react";

export type Notification = {
    text: string;
    level?: "danger" | "warning";
};

export type TopBarUser = {
    name: string;
    role: string;
};

type TopBarProps = {
    section?: string;
    title?: string;
    user?: TopBarUser;
    onLogout?: () => void;
    right?: ReactNode;
    notifications?: Notification[];
    collapsed?: boolean;
};

export function TopBar({
    section = "Workshop",
    title = "Staff terminal",
    user,
    onLogout,
    right,
    notifications = [],
    collapsed = true,
}: TopBarProps) {
    const [open, setOpen] = useState(false);

    return (
        <header
    className={[
        "fixed right-0 top-0 z-50 h-16 border-b border-[var(--border)] bg-[var(--surface)]",
        "transition-[left] duration-200 ease-in-out",
        collapsed ? "left-16" : "left-60",
    ].join(" ")}
>
            <div className="flex h-full items-center justify-between px-6">

                {/* Context */}
                <div className="leading-tight">
                    <div className="text-[24px] mt-3.5 text-sm font-bold">
                        {title}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {right}
                    {/* Notifications */}
                    <div className="relative">

                        <button
                            type="button"
                            onClick={() => setOpen((value) => !value)}
                            aria-label="Notifications"
                            aria-expanded={open}
                            className="relative flex items-center justify-center rounded-md border border-[var(--border)] bg-transparent p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                        >
                            <Bell size={15} />

                            {notifications.length > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-bold text-white">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {open && (
                            <div className="absolute right-0 top-11 w-72 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--raised)] p-1 shadow-xl">
                                <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                    Alerts
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="px-3 py-4 text-xs text-[var(--text-faint)]">
                                        All clear — nothing needs attention.
                                    </div>
                                ) : (
                                    notifications.map((notification, index) => (
                                        <div
                                            key={`${notification.text}-${index}`}
                                            className="flex gap-2 border-t border-[var(--border)] px-2 py-3.5 text-xs"
                                        >
                                            <span
                                                className={
                                                    notification.level === "danger"
                                                        ? "mt-0.5 text-[var(--danger)]"
                                                        : "mt-0.5 text-[var(--warning)]"
                                                }
                                            >
                                                <AlertTriangle size={12} />
                                            </span>

                                            <span className="leading-relaxed text-[var(--text)]">
                                                {notification.text}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* User */}
                    {user && (
                        <div className="flex items-center gap-2">

                            {/* Avatar */}
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--raised)] text-[10px] font-bold text-[var(--text-muted)]">
                                {user.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>

                            {/* User information */}
                            <div className="hidden leading-tight sm:block">
                                <div className="text-xs font-medium text-[var(--text)]">
                                    {user.name}
                                </div>

                                <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                    {user.role}
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                type="button"
                                onClick={onLogout}
                                title="Log out"
                                aria-label="Log out"
                                className="ml-1 flex items-center justify-center rounded-md border border-[var(--border)] bg-transparent p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                            >
                                <Power size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}