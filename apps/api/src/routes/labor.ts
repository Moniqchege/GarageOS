import { Router } from "express";
import { prisma } from "../db";
import type { LaborCharge } from "@garage/types";

export const laborRouter = Router();

// GET /api/labor
laborRouter.get("/", async (_req, res) => {
    const items = await prisma.laborCharge.findMany({ orderBy: { code: "asc" } });
    res.json(items);
});

// GET /api/labor/:code
laborRouter.get("/:code", async (req, res) => {
    const charge = await prisma.laborCharge.findUnique({
        where: { code: req.params.code.toUpperCase() },
    });
    if (!charge) return res.status(404).json({ error: "Labor charge not found" });
    res.json(charge);
});

// POST /api/labor  — add a new labor charge
laborRouter.post("/", async (req, res) => {
    const body = req.body as Partial<LaborCharge>;
    if (!body.name || body.price == null) {
        return res.status(400).json({ error: "name and price are required" });
    }
    const count = await prisma.laborCharge.count();
    const code = "LBR-" + String(count + 1).padStart(2, "0");

    const charge = await prisma.laborCharge.create({
        data: {
            code,
            name: String(body.name),
            category: String(body.category ?? "General"),
            price: Number(body.price),
        },
    });
    res.status(201).json(charge);
});

// PATCH /api/labor/:code
laborRouter.patch("/:code", async (req, res) => {
    const existing = await prisma.laborCharge.findUnique({ where: { code: req.params.code.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Labor charge not found" });

    const allowed: (keyof LaborCharge)[] = ["name", "category", "price"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in req.body) data[key] = req.body[key as string];
    }

    const charge = await prisma.laborCharge.update({ where: { code: existing.code }, data });
    res.json(charge);
});

// DELETE /api/labor/:code
laborRouter.delete("/:code", async (req, res) => {
    const existing = await prisma.laborCharge.findUnique({ where: { code: req.params.code.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Labor charge not found" });

    await prisma.laborCharge.delete({ where: { code: existing.code } });
    res.status(204).send();
});
