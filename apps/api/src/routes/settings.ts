import { Router } from "express";
import { prisma } from "../db";

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get("/", async (_req, res) => {
    const settings = await prisma.businessSettings.findUnique({ where: { id: 1 } });
    res.json(settings);
});

// POST /api/settings  — update settings
settingsRouter.post("/", async (req, res) => {
    const { name, kra, vatRate } = req.body as { name?: string; kra?: string; vatRate?: number };
    const data: Record<string, unknown> = {};
    if (name    != null) data.name    = String(name);
    if (kra     != null) data.kra     = String(kra);
    if (vatRate != null) data.vatRate = Number(vatRate);

    const settings = await prisma.businessSettings.upsert({
        where: { id: 1 },
        update: data,
        create: {
            id: 1,
            name: String(name ?? "My Garage"),
            kra: String(kra ?? ""),
            vatRate: Number(vatRate ?? 16),
        },
    });
    res.json(settings);
});
