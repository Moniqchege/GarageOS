import { del, get, patch, post } from "../http";
import type { Employee } from "@garage/types";

export interface CreateUserPayload extends Omit<Employee, "id" | "lastLogin"> {
    pin: string;
}

export interface UpdatePinPayload {
    currentPin: string;
    newPin: string;
}

export const users = {
    list: () =>
        get<Employee[]>("/api/users"),

    get: (id: string) =>
        get<Employee>(`/api/users/${id}`),

    create: (data: CreateUserPayload) =>
        post<Employee>("/api/users", data),

    update: (id: string, data: Partial<Employee>) =>
        patch<Employee>(`/api/users/${id}`, data),

    updatePin: (id: string, payload: UpdatePinPayload) =>
        patch<void>(`/api/users/${id}/pin`, payload),

    setStatus: (id: string, status: Employee["status"]) =>
        patch<Employee>(`/api/users/${id}/status`, { status }),

    remove: (id: string) =>
        del<void>(`/api/users/${id}`),
};
