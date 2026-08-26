import { Router } from "express";
import { clearCart, inventoryItems, posCart, settings } from "../store";
import type { CartLine } from "../store";

export const posRouter = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cartSummary() {
    const subtotal = posCart.reduce((s, c) => s + c.price * c.qty, 0);
    const vat = Math.round(subtotal * (settings.vatRate / 100));
    const total = subtotal + vat;
    return { items: posCart, subtotal, vat, total };
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

// GET /api/pos/cart
posRouter.get("/cart", (_req, res) => {
    res.json(cartSummary());
});

// POST /api/pos/cart/items  — { sku, qty }
posRouter.post("/cart/items", (req, res) => {
    const { sku, qty = 1 } = req.body as { sku?: string; qty?: number };
    if (!sku) return res.status(400).json({ error: "sku is required" });

    const item = inventoryItems.find(
        (i) => i.sku.toLowerCase() === String(sku).toLowerCase(),
    );
    if (!item) return res.status(404).json({ error: "Item not found" });

    const addQty = Number(qty);
    if (item.qty < addQty) {
        return res.status(409).json({ error: `Only ${item.qty} units in stock` });
    }

    // Deduct from inventory
    item.qty -= addQty;

    // Update or add cart line
    const existing = posCart.find((c) => c.sku === item.sku);
    if (existing) {
        existing.qty += addQty;
    } else {
        posCart.push({ sku: item.sku, name: item.name, price: item.price, qty: addQty });
    }

    res.status(201).json(cartSummary());
});

// PATCH /api/pos/cart/items/:sku  — { qty }  (absolute new qty, not delta)
posRouter.patch("/cart/items/:sku", (req, res) => {
    const line = posCart.find(
        (c) => c.sku.toLowerCase() === req.params.sku.toLowerCase(),
    );
    if (!line) return res.status(404).json({ error: "Item not in cart" });

    const newQty = Number(req.body.qty);
    if (isNaN(newQty) || newQty < 0) {
        return res.status(400).json({ error: "qty must be a non-negative number" });
    }

    const item = inventoryItems.find((i) => i.sku === line.sku);
    if (!item) return res.status(404).json({ error: "Inventory item not found" });

    // Restore the old qty back to inventory, then deduct the new qty
    item.qty += line.qty;
    if (item.qty < newQty) {
        item.qty -= 0; // rollback
        return res.status(409).json({ error: `Only ${item.qty} units in stock` });
    }
    item.qty -= newQty;

    if (newQty === 0) {
        const idx = posCart.indexOf(line);
        posCart.splice(idx, 1);
    } else {
        line.qty = newQty;
    }

    res.json(cartSummary());
});

// DELETE /api/pos/cart/items/:sku  — remove line and restore inventory
posRouter.delete("/cart/items/:sku", (req, res) => {
    const idx = posCart.findIndex(
        (c) => c.sku.toLowerCase() === req.params.sku.toLowerCase(),
    );
    if (idx === -1) return res.status(404).json({ error: "Item not in cart" });

    const [removed] = posCart.splice(idx, 1);
    const item = inventoryItems.find((i) => i.sku === removed.sku);
    if (item) item.qty += removed.qty;

    res.json(cartSummary());
});

// ─── Checkout ─────────────────────────────────────────────────────────────────

interface CheckoutBody {
    method: "cash" | "mpesa" | "card";
    amountTendered?: number;
    mpesaRef?: string;
}

// POST /api/pos/checkout
posRouter.post("/checkout", (req, res) => {
    if (posCart.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const { method, amountTendered, mpesaRef } = req.body as CheckoutBody;
    if (!["cash", "mpesa", "card"].includes(method)) {
        return res.status(400).json({ error: "method must be cash, mpesa, or card" });
    }
    if (method === "mpesa" && (!mpesaRef || String(mpesaRef).length < 8)) {
        return res.status(400).json({ error: "A valid M-Pesa reference is required" });
    }

    const { items, subtotal, vat, total } = cartSummary();

    const change =
        method === "cash" && amountTendered != null
            ? Math.max(0, Number(amountTendered) - total)
            : 0;

    const receipt = {
        id: "INV-" + (4000 + Math.floor(Math.random() * 900)),
        items: items.map((l: CartLine) => ({ ...l })), // snapshot
        subtotal,
        vat,
        total,
        method,
        mpesaRef: mpesaRef ?? null,
        change,
        vatReg: settings.kra,
        paidAt: new Date().toISOString(),
    };

    clearCart();
    res.status(201).json(receipt);
});

// GET /api/pos/receipts/:id  — stub (no persistence yet)
posRouter.get("/receipts/:id", (req, res) => {
    res.status(404).json({
        error: "Receipt retrieval requires persistent storage — not yet implemented",
    });
});

// POST /api/pos/cart/clear  — cancel sale and restore inventory
posRouter.post("/cart/clear", (_req, res) => {
    // Restore all cart quantities back to inventory
    for (const line of posCart) {
        const item = inventoryItems.find((i) => i.sku === line.sku);
        if (item) item.qty += line.qty;
    }
    clearCart();
    res.json(cartSummary());
});
