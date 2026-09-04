export type JobStage =
    | "diagnostics"
    | "active"
    | "parts"
    | "ready"
    | "done";

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    vehicleIds?: string[];
}

export interface Vehicle {
    registration: string;
    model: string;
    year?: number;
    color?: string;
    mileage: number;
    fuel?: number;
    health?: number;

    customer?: Customer;

    lastServiceKm?: number;
    nextServiceKm?: number;
}

export interface JobLine {
    id?: number;
    type: "labor" | "part";
    name: string;
    price: number;
    sku?: string;
}

export interface JobDiagnosisFinding {
    id: string;
    label: string;
    severity: "ok" | "warning" | "danger";
    note: string;
}

export interface JobCard {
    id: string;

    registration: string;

    customer?: string;
    phone?: string;

    vehicle?: Vehicle;

    mechanic: string;
    stage: JobStage;

    startedAt: number;
    completedAt?: number;

    mileageAtStart?: number;
    mileageAtEnd?: number;

    faults: string;

    diagnosisNotes?: string;
    diagnosisFindings?: JobDiagnosisFinding[];

    lines?: JobLine[];
}

export interface ServiceHistoryJob {
    id: string;
    registration: string;
    mechanic: string;
    stage: JobStage;
    startedAt: number;
    completedAt?: number;
    mileageAtStart?: number;
    mileageAtEnd?: number;
    faults: string;
    diagnosisNotes?: string;
    total: number;
    lines?: JobLine[];
}

export interface CustomerVehicleRecord {
    registration: string;
    customer: string;
    phone: string;
    model: string;
    mileage: number;
    lastServiceKm: number;
    nextServiceKm: number;
    nextServiceDate: string;
}

export interface VehicleSearchResult {
    registration: string;
    model: string;
    mileage: number;
    fuel?: number;
    customer: {
        name: string;
        phone: string;
    };
}

export interface JobCreatePayload extends Omit<JobCard, "id" | "stage" | "startedAt" | "lines"> {
    fuel?: number;
}

export interface CustomerNotification {
    id: number;
    customerId: string;
    type: string;
    read: boolean;
    time: string;
    title: string;
    body: string;
    createdAt: string;
}

export interface CustomerVehicle {
    registration: string;
    customerId: string;
    model: string;
    year: number | null;
    color: string | null;
    mileage: number;
    fuel: number | null;
    health: number | null;
    nextServiceKm: number | null;
    nextServiceDate: string | null;
    createdAt: string;
    updatedAt: string;
    jobCards: ServiceHistoryJob[];
}

export interface VehicleRegistrationPayload {
    customerName: string;
    phone: string;
    email?: string;
    registration: string;
    model: string;
    year?: number;
    color?: string;
    mileage?: number;
    fuel?: number;
    lastServiceKm?: number;
    nextServiceKm?: number;
    serviceIntervalKm?: number;
}

export interface ServiceInfoPayload {
    lastServiceKm?: number;
    nextServiceKm?: number;
}

export interface LaborCharge {
    code: string;
    name: string;
    category: string;
    price: number;
}

export const INVENTORY_CATEGORIES = [
    "Fast Moving Parts",
    "Engine Oils",
    "Filters",
    "Brake Pads",
    "Electrical Components",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export interface InventoryItem {
    sku: string;
    name: string;
    fits: string;
    category: string;
    cost: number;
    price: number;
    qty: number;
    low: number;
    added: string;
}

export type EmployeeStatus = "Active" | "Suspended";

export type PayMethod =
    | "Commission"
    | "Daily rate"
    | "Daily rate + commission"
    | "Fixed monthly";

export interface Employee {
    id: string;
    name: string;
    role: string;
    phone: string;
    status: EmployeeStatus;
    lastLogin: string;

    payMethod: PayMethod;
    rate?: number | null;
    commissionRate?: number | null;
}

// ─── Payroll ─────────────────────────────────────────────────────────────────

/** One row in the payroll table — one employee for a given month. */
export interface PayrollRow {
    employeeId: string;
    name: string;
    role: string;
    payMethod: PayMethod;
    rate: number | null;
    commissionRate: number | null;
    /** Number of job cards completed in the period. */
    jobsCompleted: number;
    /** Total revenue generated across those jobs (sum of job line prices). */
    laborGenerated: number;
    /** Calculated earnings for the period based on pay method. */
    earnings: number;
    /** Whether the period has been marked as paid. */
    paid: boolean;
    /** Epoch ms when marked paid, or null. */
    paidAt: number | null;
}

/** Single-employee period summary (used on the employee detail page). */
export interface EmployeePayPeriod {
    employeeId: string;
    year: number;
    month: number;
    payMethod: PayMethod;
    rate: number | null;
    commissionRate: number | null;
    jobsCompleted: number;
    laborGenerated: number;
    earnings: number;
    paid: boolean;
    paidAt: number | null;
}

/** Response from PATCH mark-paid. */
export interface MarkPaidResult {
    employeeId: string;
    year: number;
    month: number;
    paid: boolean;
    paidAt: number | null;
}