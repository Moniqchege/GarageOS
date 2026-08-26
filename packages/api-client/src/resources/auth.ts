import { get, post } from "../http";
import type { Employee } from "@garage/types";

export interface BusinessSettings {
    name: string;
    kra: string;
    vatRate: number;
}

export interface LoginResponse {
    user: Omit<Employee, "pin">;
    settings: BusinessSettings;
}

export const auth = {
    login: (pin: string) =>
        post<LoginResponse>("/api/auth/login", { pin }),

    logout: () =>
        post<void>("/api/auth/logout"),

    me: () =>
        get<LoginResponse["user"]>("/api/auth/me"),
};
