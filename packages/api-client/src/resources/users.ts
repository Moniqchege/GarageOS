import { del, get, patch, post } from "../http";
import type { CompensationHistoryEntry, Employee, PayMethod } from "@garage/types";

export interface CreateUserPayload
    extends Omit<Employee, "id" | "lastLogin" | "loginEnabled" | "hasPin"> {
    pin: string;
    loginEnabled?: boolean;
}

export interface UpdatePinPayload {
    currentPin: string;
    newPin: string;
}

export interface UpdateCompensationPayload {
    payMethod?: PayMethod;
    rate?: number | null;
    commissionRate?: number | null;
}

export interface EmployeeActivityJob {
    id: string;
    registration: string;
    vehicle: string;
    customer: string;
    faults: string;
    completedAt: number | null;
    total: number;
}

export interface UpdateAccessPayload {
    enabled: boolean;
    pin?: string;
}

export const users = {
    list: () =>
        get<Employee[]>("/api/users"),

    get: (id: string) =>
        get<Employee>(`/api/users/${id}`),

    getActivity: (id: string) =>
        get<EmployeeActivityJob[]>(`/api/users/${id}/activity`),

    create: (data: CreateUserPayload) =>
        post<Employee>("/api/users", data),

    update: (id: string, data: Partial<Employee>) =>
        patch<Employee>(`/api/users/${id}`, data),

    updateCompensation: (id: string, data: UpdateCompensationPayload) =>
        patch<Employee>(`/api/users/${id}/compensation`, data),

    updatePin: (id: string, payload: UpdatePinPayload) =>
        patch<void>(`/api/users/${id}/pin`, payload),

    setStatus: (id: string, status: Employee["status"]) =>
        patch<Employee>(`/api/users/${id}/status`, { status }),

    remove: (id: string) =>
        del<void>(`/api/users/${id}`),

    getCompensationHistory: (id: string) =>
        get<CompensationHistoryEntry[]>(`/api/users/${id}/compensation-history`),

    updateAccess: (id: string, data: UpdateAccessPayload) =>
        patch<Employee>(`/api/users/${id}/access`, data),
};