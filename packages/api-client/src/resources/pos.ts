import { del, get, patch, post } from "../http";

export interface CartLine {
    sku: string;
    name: string;
    price: number;
    qty: number;
}

export interface Cart {
    items: CartLine[];
    subtotal: number;
    vat: number;
    total: number;
}

export interface CheckoutPayload {
    method: "cash" | "mpesa" | "card";
    amountTendered?: number;
    mpesaRef?: string;
}

export interface Receipt {
    id: string;
    items: CartLine[];
    subtotal: number;
    vat: number;
    total: number;
    method: CheckoutPayload["method"];
    mpesaRef: string | null;
    change: number;
    vatReg: string;
    paidAt: string;
    /** Present when this receipt came from a job-card checkout rather than the retail POS counter. */
    jobId?: string;
    registration?: string;
}

export const pos = {
    getCart: () =>
        get<Cart>("/api/pos/cart"),

    addItem: (sku: string, qty = 1) =>
        post<Cart>("/api/pos/cart/items", { sku, qty }),

    updateItem: (sku: string, qty: number) =>
        patch<Cart>(`/api/pos/cart/items/${sku}`, { qty }),

    removeItem: (sku: string) =>
        del<Cart>(`/api/pos/cart/items/${sku}`),

    clearCart: () =>
        post<Cart>("/api/pos/cart/clear"),

    checkout: (payload: CheckoutPayload) =>
        post<Receipt>("/api/pos/checkout", payload),

    getReceipt: (id: string) =>
        get<Receipt>(`/api/pos/receipts/${id}`),
};
