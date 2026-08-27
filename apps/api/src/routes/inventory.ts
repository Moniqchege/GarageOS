import { Router } from "express";
import { prisma } from "../db";
import type { InventoryItem } from "@garage/types";

export const inventoryRouter = Router();

// GET /api/inventory?low=true
inventoryRouter.get("/", async (req, res) => {
    const items = await prisma.inventoryItem.findMany({
        orderBy: { added: "desc" },
    });
    const result = req.query.low === "true"
        ? items.filter((i) => i.qty <= i.low)
        : items;
    res.json(result);
});

// GET /api/inventory/:sku
inventoryRouter.get("/:sku", async (req, res) => {
    const item = await prisma.inventoryItem.findUnique({
        where: { sku: req.params.sku.toUpperCase() },
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
});

// POST /api/inventory  — add new item
inventoryRouter.post("/", async (req, res) => {
    const body = req.body as Partial<InventoryItem>;
    if (!body.sku || !body.name) {
        return res.status(400).json({ error: "sku and name are required" });
    }
    const sku = String(body.sku).toUpperCase();

    const exists = await prisma.inventoryItem.findUnique({ where: { sku } });
    if (exists) return res.status(409).json({ error: "SKU already exists" });

    const item = await prisma.inventoryItem.create({
        data: {
            sku,
            name: String(body.name),
            fits: String(body.fits ?? "Universal"),
            cost: Number(body.cost ?? 0),
            price: Number(body.price ?? 0),
            qty: Number(body.qty ?? 0),
            low: Number(body.low ?? 5),
            added: new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
        },
    });
    res.status(201).json(item);
});

// PATCH /api/inventory/:sku  — update item details or quantity (restock inline)
inventoryRouter.patch("/:sku", async (req, res) => {
    const existing = await prisma.inventoryItem.findUnique({ where: { sku: req.params.sku.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const allowed: (keyof InventoryItem)[] = ["name", "fits", "cost", "price", "qty", "low"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in req.body) data[key] = req.body[key as string];
    }

    const item = await prisma.inventoryItem.update({
        where: { sku: existing.sku },
        data,
    });
    res.json(item);
});

// POST /api/inventory/:sku/restock  — { qty: number }
inventoryRouter.post("/:sku/restock", async (req, res) => {
    const existing = await prisma.inventoryItem.findUnique({ where: { sku: req.params.sku.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const qty = Number(req.body.qty);
    if (!qty || qty < 1) return res.status(400).json({ error: "qty must be a positive number" });

    const item = await prisma.inventoryItem.update({
        where: { sku: existing.sku },
        data: { qty: { increment: qty } },
    });
    res.json(item);
});

// DELETE /api/inventory/:sku
inventoryRouter.delete("/:sku", async (req, res) => {
    const existing = await prisma.inventoryItem.findUnique({ where: { sku: req.params.sku.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Item not found" });

    await prisma.inventoryItem.delete({ where: { sku: existing.sku } });
    res.status(204).send();
});
