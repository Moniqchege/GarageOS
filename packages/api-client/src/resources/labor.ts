import { del, get, patch, post } from "../http";
import type { LaborCharge } from "@garage/types";

export const labor = {
    list: () =>
        get<LaborCharge[]>("/api/labor"),

    get: (code: string) =>
        get<LaborCharge>(`/api/labor/${code}`),

    create: (data: Omit<LaborCharge, "code">) =>
        post<LaborCharge>("/api/labor", data),

    update: (code: string, data: Partial<LaborCharge>) =>
        patch<LaborCharge>(`/api/labor/${code}`, data),

    remove: (code: string) =>
        del<void>(`/api/labor/${code}`),
};
