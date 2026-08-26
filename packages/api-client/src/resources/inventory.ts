import { del, get, patch, post } from "../http";
import type { InventoryItem } from "@garage/types";

export interface RestockPayload {
    qty: number;
}

export const inventory = {
    list: (lowStockOnly = false) =>
        get<InventoryItem[]>(lowStockOnly ? "/api/inventory?low=true" : "/api/inventory"),

    get: (sku: string) =>
        get<InventoryItem>(`/api/inventory/${sku}`),

    create: (data: InventoryItem) =>
        post<InventoryItem>("/api/inventory", data),

    update: (sku: string, data: Partial<InventoryItem>) =>
        patch<InventoryItem>(`/api/inventory/${sku}`, data),

    restock: (sku: string, payload: RestockPayload) =>
        post<InventoryItem>(`/api/inventory/${sku}/restock`, payload),

    remove: (sku: string) =>
        del<void>(`/api/inventory/${sku}`),
};
