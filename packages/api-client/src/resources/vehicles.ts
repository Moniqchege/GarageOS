import { del, get, patch, post } from "../http";
import type { CustomerVehicle, ServiceHistoryEntry, Vehicle } from "@garage/types";

export const vehicles = {
    list: () =>
        get<Vehicle[]>("/api/vehicles"),

    get: (id: string) =>
        get<CustomerVehicle>(`/api/vehicles/${id}`),

    create: (data: Omit<Vehicle, "id">) =>
        post<Vehicle>("/api/vehicles", data),

    update: (id: string, data: Partial<Vehicle>) =>
        patch<Vehicle>(`/api/vehicles/${id}`, data),

    remove: (id: string) =>
        del<void>(`/api/vehicles/${id}`),

    history: (id: string) =>
        get<ServiceHistoryEntry[]>(`/api/vehicles/${id}/history`),
};
