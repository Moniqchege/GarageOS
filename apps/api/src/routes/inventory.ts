import { Router } from "express";
import { prisma } from "../db";
import type { InventoryItem } from "@garage/types";

export const inventoryRouter = Router();

const SKU_PREFIX = "PT";

async function generateSku(): Promise<string> {
    const last = await prisma.inventoryItem.findFirst({
        where: { sku: { startsWith: `${SKU_PREFIX}-` } },
        orderBy: { sku: "desc" },
    });

    let next = 1;
    if (last) {
        const match = last.sku.match(/(\d+)$/);
        if (match) next = parseInt(match[1], 10) + 1;
    }

    return `${SKU_PREFIX}-${String(next).padStart(5, "0")}`;
}

inventoryRouter.get("/next-sku", async (_req, res) => {
    const sku = await generateSku();
    res.json({ sku });
});

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

// POST /api/inventory 
inventoryRouter.post("/", async (req, res) => {
    const body = req.body as Partial<InventoryItem>;
    if (!body.name) {
        return res.status(400).json({ error: "name is required" });
    }

    const data = {
        name: String(body.name),
        fits: String(body.fits ?? "Universal"),
        cost: Number(body.cost ?? 0),
        price: Number(body.price ?? 0),
        qty: Number(body.qty ?? 0),
        low: Number(body.low ?? 5),
        added: new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
    };

    for (let attempt = 0; attempt < 5; attempt++) {
        const sku = await generateSku();
        try {
            const item = await prisma.inventoryItem.create({ data: { sku, ...data } });
            return res.status(201).json(item);
        } catch (err: any) {
            if (err?.code === "P2002") continue;
            throw err;
        }
    }

    res.status(500).json({ error: "Could not generate a unique SKU, please retry" });
});

// PATCH /api/inventory/:sku
inventoryRouter.patch("/:sku", async (req, res) => {
    const existing = await prisma.inventoryItem.findUnique({ where: { sku: req.params.sku.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const allowed: (keyof InventoryItem)[] = ["name", "fits", "cost", "price", "qty", "low"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in req.body) data[key] = req.body[key as string];
    }

    const item = await prisma.inventoryItem.update({ where: { sku: existing.sku }, data });
    res.json(item);
});

// POST /api/inventory/:sku/restock — { qty: number }
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