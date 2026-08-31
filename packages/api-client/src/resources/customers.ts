import { get, patch, post, del } from "../http";
import type {
    CustomerNotification,
    CustomerVehicle,
    CustomerVehicleRecord,
    ServiceHistoryJob,
    ServiceInfoPayload,
    VehicleRegistrationPayload,
    VehicleSearchResult,
} from "@garage/types";

interface CustomerSearchResult {
    name: string;
    phone: string;
    vehicles: Array<{
        registration: string;
        model: string;
        mileage: number;
        fuel?: number;
    }>;
}

interface CustomerRosterEntry {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    vehicles: Array<{
        registration: string;
        model: string;
        mileage: number;
        lastServiceKm: number | null;
        nextServiceKm: number | null;
        nextServiceDate: string | null;
    }>;
}

const formatDate = (value: number | string | null) => {
    if (value == null) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

export const customers = {
    async list(): Promise<CustomerVehicleRecord[]> {
        const rows = await get<CustomerRosterEntry[]>("/api/customers");

        return rows.flatMap((customer) =>
            customer.vehicles.map((vehicle) => ({
                registration: vehicle.registration,
                customer: customer.name,
                phone: customer.phone,
                model: vehicle.model,
                mileage: vehicle.mileage,
                lastServiceKm: vehicle.lastServiceKm ?? 0,
                nextServiceKm: vehicle.nextServiceKm ?? 0,
                nextServiceDate: formatDate(vehicle.nextServiceDate),
            })),
        );
    },

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

    async searchVehicles(query: string): Promise<VehicleSearchResult[]> {
        const results = await get<CustomerSearchResult[]>(
            `/api/customers/search?q=${encodeURIComponent(query)}`,
        );

        return results.flatMap((customer) =>
            customer.vehicles.map((vehicle) => ({
                registration: vehicle.registration,
                model: vehicle.model,
                mileage: vehicle.mileage,
                fuel: vehicle.fuel,
                customer: { name: customer.name, phone: customer.phone },
            })),
        );
    },

    vehicleHistory: (registration: string) =>
        get<ServiceHistoryJob[]>(
            `/api/customers/vehicles/${encodeURIComponent(registration)}/history`,
        ),

    registerVehicle: (payload: VehicleRegistrationPayload) =>
        post<CustomerVehicle>("/api/customers/register-vehicle", payload),

    updateServiceInfo: (registration: string, payload: ServiceInfoPayload) =>
        patch<CustomerVehicle>(
            `/api/customers/vehicles/${encodeURIComponent(registration)}/service-info`,
            payload,
        ),
};