import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
    BarChart3,
    Car,
    ChevronLeft,
    LayoutGrid,
    Package,
    Settings,
    ShoppingCart,
    Users,
    Wrench,
} from "lucide-react";
import { TopBar, type Notification } from "./TopBar";

type NavigationItem = {
    label: string;
    title: string;
    path: string;
    icon: typeof LayoutGrid;
};

type NavigationGroup = {
    section: string;
    items: NavigationItem[];
};

const navigation: NavigationGroup[] = [
    {
        section: "WORKSHOP",
        items: [
            {
                label: "Bay board",
                // title: "Live Workshop Operations",
                title: "",
                path: "/",
                icon: LayoutGrid,
            },
            {
                label: "Vehicles",
                // title: "Vehicle Reception & Intake",
                title: "",
                path: "/intake",
                icon: Car,
            },
            {
                label: "Customers",
                // title: "Customers & Vehicle History",
                title: "",
                path: "/customers",
                icon: Users,
            },
        ],
    },
    {
        section: "OPERATIONS",
        items: [
            {
                label: "Inventory",
                // title: "Master Warehouse Stock Ingestion",
                title: "",
                path: "/stock",
                icon: Package,
            },
            {
                label: "Labor",
                // title: "Labor Charge Catalog",
                title: "",
                path: "/labor",
                icon: Wrench,
            },
            {
                label: "Sales",
                // title: "Retail Spare Parts Counter",
                title: "",
                path: "/pos",
                icon: ShoppingCart,
            },
            {
                label: "Team",
                // title: "Staff Profiles & Permission Matrix",
                title: "",
                path: "/users",
                icon: Users,
            },
            {
                label: "Reports",
                // title: "Executive Financial Analytics",
                title: "",
                path: "/analytics",
                icon: BarChart3,
            },
        ],
    },
    {
        section: "ADMINISTRATION",
        items: [
            {
                label: "Settings",
                // title: "Settings",
                title: "",
                path: "/settings",
                icon: Settings,
            },
        ],
    },
];

const notifications: Notification[] = [
    {
        text: "Vehicle KDK 420X has been waiting for diagnostics.",
        level: "warning",
    },
    {
        text: "Low stock detected for engine oil.",
        level: "danger",
    },
];

export function StaffLayout() {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);

    const currentItem =
        navigation
            .flatMap((group) => group.items)
            .find((item) =>
                item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path)
            ) ?? navigation[0].items[0];

    return (
        <div className="min-h-screen bg-[var(--bg)]">

            {/* =========================================================
                SIDEBAR
            ========================================================= */}
            <aside
                className={[
                    "fixed bottom-0 left-0 top-0 z-40 border-r border-[var(--border)] bg-[var(--surface)]",
                    "transition-[width] duration-200 ease-in-out",
                    collapsed ? "w-16" : "w-60",
                ].join(" ")}
            >

                {/* =====================================================
                    GARAGEOS BRAND
                ===================================================== */}
                <div
                    className={[
                        "relative flex h-16 items-center border-b border-[var(--border)]",
                        collapsed ? "justify-center px-2" : "px-4",
                    ].join(" ")}
                >
                    {/* Brand */}
                    <div
                        className={[
                            "flex items-center",
                            collapsed ? "justify-center" : "gap-3",
                        ].join(" ")}
                    >

                        {/* Logo */}
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                                background: "var(--primary)",
                            }}
                            title={collapsed ? "GarageOS" : undefined}
                        >
                            <Wrench
                                size={17}
                                color="#0B0D10"
                            />
                        </div>

                        {/* Brand text */}
                        {!collapsed && (
                            <div className="leading-none">
                                <div
                                    className="text-[17px] font-bold tracking-wide"
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                    }}
                                >
                                    GARAGE
                                    <span className="text-[var(--primary)]">
                                        OS
                                    </span>
                                </div>

                                <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    Workshop management
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Collapse button */}
                    <button
                        type="button"
                        onClick={() => setCollapsed((value) => !value)}
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                        aria-label={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                        className={[
                            "absolute flex items-center justify-center",
                            "rounded-md border border-[var(--border)]",
                            "bg-[var(--surface)] text-[var(--text-muted)]",
                            "transition hover:bg-[var(--surface-alt)] hover:text-[var(--text)]",
                            collapsed
                                ? "-right-3 h-6 w-6"
                                : "right-2 h-6 w-6",
                        ].join(" ")}
                    >
                        <ChevronLeft
                            size={13}
                            className={
                                collapsed
                                    ? "rotate-180 transition-transform"
                                    : "transition-transform"
                            }
                        />
                    </button>
                </div>

                {/* =====================================================
                    NAVIGATION
                ===================================================== */}
                <div
                    className={[
                        "p-3",
                        collapsed ? "px-2" : "px-3",
                    ].join(" ")}
                >

                    {navigation.map((group) => (
                        <div
                            key={group.section}
                            className="mb-5"
                        >

                            {/* Section label */}
                            {!collapsed && (
                                <div className="mb-2 px-3 text-[9px] font-bold tracking-[0.14em] text-[var(--text-faint)]">
                                    {group.section}
                                </div>
                            )}

                            {/* Collapsed separator */}
                            {collapsed && (
                                <div className="mx-2 mb-2 border-t border-[var(--border)]" />
                            )}

                            <nav className="space-y-1">

                                {group.items.map(
                                    ({
                                        label,
                                        title,
                                        path,
                                        icon: Icon,
                                    }) => (
                                        <NavLink
                                            key={path}
                                            to={path}
                                            end={path === "/"}
                                            title={
                                                collapsed
                                                    ? label
                                                    : undefined
                                            }
                                            className={({ isActive }) =>
                                                [
                                                    "group flex items-center rounded-lg text-sm transition",
                                                    collapsed
                                                        ? "justify-center px-0 py-2.5"
                                                        : "gap-3 px-3 py-2.5",

                                                    isActive
                                                        ? "bg-[var(--primary-dim)] text-[var(--primary)]"
                                                        : "text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]",
                                                ].join(" ")
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <Icon
                                                        size={17}
                                                        className={[
                                                            "shrink-0",
                                                            isActive
                                                                ? "text-[var(--primary)]"
                                                                : "text-[var(--text-muted)] group-hover:text-[var(--text)]",
                                                        ].join(" ")}
                                                    />

                                                    {!collapsed && (
                                                        <span>
                                                            {label}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    )
                                )}

                            </nav>
                        </div>
                    ))}

                </div>

            </aside>

            {/* =========================================================
                TOP BAR
            ========================================================= */}
            <TopBar
                section="Workshop"
                title={currentItem.title}
                notifications={notifications}
                user={{
                    name: "Johnathan Mwangi",
                    role: "System Administrator",
                }}
                onLogout={() => {
                    console.log("Logging out...");
                }}
                collapsed={collapsed}
            />

            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}
            <main
                className={[
                    "pt-16 transition-[margin] duration-200 ease-in-out",
                    collapsed ? "ml-16" : "ml-60",
                ].join(" ")}
            >
                <Outlet />
            </main>
        </div>
    );
}