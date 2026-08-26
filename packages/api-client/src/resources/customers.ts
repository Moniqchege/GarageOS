import { get, patch, post, del } from "../http";
import type { CustomerNotification, CustomerVehicle, CustomerVehicleRecord } from "@garage/types";

export const customers = {
    list: () =>
        get<CustomerVehicleRecord[]>("/api/customers"),

    get: (reg: string) =>
        get<CustomerVehicleRecord>(`/api/customers/${reg}`),

    create: (data: Omit<CustomerVehicleRecord, "id">) =>
        post<CustomerVehicleRecord>("/api/customers", data),

    update: (reg: string, data: Partial<CustomerVehicleRecord>) =>
        patch<CustomerVehicleRecord>(`/api/customers/${reg}`, data),

    remove: (reg: string) =>
        del<void>(`/api/customers/${reg}`),

    vehicles: (reg: string) =>
        get<CustomerVehicle[]>(`/api/customers/${reg}/vehicles`),

    notifications: (reg: string) =>
        get<CustomerNotification[]>(`/api/customers/${reg}/notifications`),

    markRead: (reg: string, id: number) =>
        patch<CustomerNotification>(`/api/customers/${reg}/notifications/${id}/read`, {}),

    markAllRead: (reg: string) =>
        patch<CustomerNotification[]>(`/api/customers/${reg}/notifications/read-all`, {}),
};
