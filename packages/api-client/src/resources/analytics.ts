import { get } from "../http";

export interface AnalyticsSummary {
    totalRevenue: number;
    totalJobs: number;
    avgTurnaroundHours: number;
    openJobs: number;
    vatRate: number;
}

export interface JobRevenueEntry {
    jobId: string;
    registration: string;
    stage: string;
    revenue: number;
    startedAt: number;
}

export interface JobStageCount {
    total: number;
    diagnostics: number;
    active: number;
    parts: number;
    done: number;
}

export interface InventoryStats {
    stockValue: number;
    lowStockCount: number;
    lowStockItems: Array<{ sku: string; name: string; qty: number; low: number }>;
    topHeld: Array<{ sku: string; name: string; qty: number; low: number }>;
}

export interface StaffStat {
    employeeId: string;
    name: string;
    role: string;
    jobsAssigned: number;
    jobsCompleted: number;
    avgTurnaroundHours: number;
}

export const analytics = {
    summary: () => get<AnalyticsSummary>("/api/analytics/summary"),
    revenue: () => get<JobRevenueEntry[]>("/api/analytics/revenue"),
    jobs: () => get<JobStageCount>("/api/analytics/jobs"),
    inventory: () => get<InventoryStats>("/api/analytics/inventory"),
    staff: () => get<StaffStat[]>("/api/analytics/staff"),
};
