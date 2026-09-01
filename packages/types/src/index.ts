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