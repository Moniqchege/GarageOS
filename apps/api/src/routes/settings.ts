import { Router } from "express";
import { settings } from "../store";

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get("/", (_req, res) => {
    res.json(settings);
});

// POST /api/settings  — update in-memory settings
settingsRouter.post("/", (req, res) => {
    const { name, kra, vatRate } = req.body as Partial<typeof settings>;
    if (name    != null) settings.name    = String(name);
    if (kra     != null) settings.kra     = String(kra);
    if (vatRate != null) settings.vatRate = Number(vatRate);
    res.json(settings);
});
