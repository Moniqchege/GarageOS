import { Router } from "express";
import { inventoryItems } from "../store";
import type { InventoryItem } from "@garage/types";

export const inventoryRouter = Router();

// GET /api/inventory?low=true
inventoryRouter.get("/", (req, res) => {
    const items = req.query.low === "true"
        ? inventoryItems.filter((i) => i.qty <= i.low)
        : inventoryItems;
    res.json(items);
});

// GET /api/inventory/:sku
inventoryRouter.get("/:sku", (req, res) => {
    const item = inventoryItems.find(
        (i) => i.sku.toLowerCase() === req.params.sku.toLowerCase(),
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
});

// POST /api/inventory  — add new item
inventoryRouter.post("/", (req, res) => {
    const body = req.body as Partial<InventoryItem>;
    if (!body.sku || !body.name) {
        return res.status(400).json({ error: "sku and name are required" });
    }
    const exists = inventoryItems.find(
        (i) => i.sku.toLowerCase() === body.sku!.toLowerCase(),
    );
    if (exists) return res.status(409).json({ error: "SKU already exists" });

    const item: InventoryItem = {
        sku: String(body.sku).toUpperCase(),
        name: String(body.name),
        fits: String(body.fits ?? "Universal"),
        cost: Number(body.cost ?? 0),
        price: Number(body.price ?? 0),
        qty: Number(body.qty ?? 0),
        low: Number(body.low ?? 5),
        added: new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
    };
    inventoryItems.unshift(item);
    res.status(201).json(item);
});

// PATCH /api/inventory/:sku  — update item details or quantity (restock inline)
inventoryRouter.patch("/:sku", (req, res) => {
    const item = inventoryItems.find(
        (i) => i.sku.toLowerCase() === req.params.sku.toLowerCase(),
    );
    if (!item) return res.status(404).json({ error: "Item not found" });

    const allowed: (keyof InventoryItem)[] = ["name", "fits", "cost", "price", "qty", "low"];
    for (const key of allowed) {
        if (key in req.body) {
            (item as unknown as Record<string, unknown>)[key as string] = req.body[key as string];
        }
    }
    res.json(item);
});

// POST /api/inventory/:sku/restock  — { qty: number }
inventoryRouter.post("/:sku/restock", (req, res) => {
    const item = inventoryItems.find(
        (i) => i.sku.toLowerCase() === req.params.sku.toLowerCase(),
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    const qty = Number(req.body.qty);
    if (!qty || qty < 1) return res.status(400).json({ error: "qty must be a positive number" });
    item.qty += qty;
    res.json(item);
});

// DELETE /api/inventory/:sku
inventoryRouter.delete("/:sku", (req, res) => {
    const idx = inventoryItems.findIndex(
        (i) => i.sku.toLowerCase() === req.params.sku.toLowerCase(),
    );
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    inventoryItems.splice(idx, 1);
    res.status(204).send();
});
