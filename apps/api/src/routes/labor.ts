import { Router } from "express";
import { laborCatalog } from "../store";
import type { LaborCharge } from "@garage/types";

export const laborRouter = Router();

// GET /api/labor
laborRouter.get("/", (_req, res) => {
    res.json(laborCatalog);
});

// GET /api/labor/:code
laborRouter.get("/:code", (req, res) => {
    const charge = laborCatalog.find(
        (l) => l.code.toLowerCase() === req.params.code.toLowerCase(),
    );
    if (!charge) return res.status(404).json({ error: "Labor charge not found" });
    res.json(charge);
});

// POST /api/labor  — add a new labor charge
laborRouter.post("/", (req, res) => {
    const body = req.body as Partial<LaborCharge>;
    if (!body.name || body.price == null) {
        return res.status(400).json({ error: "name and price are required" });
    }
    const code = "LBR-" + String(laborCatalog.length + 1).padStart(2, "0");
    const charge: LaborCharge = {
        code,
        name: String(body.name),
        category: String(body.category ?? "General"),
        price: Number(body.price),
    };
    laborCatalog.unshift(charge);
    res.status(201).json(charge);
});

// PATCH /api/labor/:code
laborRouter.patch("/:code", (req, res) => {
    const charge = laborCatalog.find(
        (l) => l.code.toLowerCase() === req.params.code.toLowerCase(),
    );
    if (!charge) return res.status(404).json({ error: "Labor charge not found" });

    const allowed: (keyof LaborCharge)[] = ["name", "category", "price"];
    for (const key of allowed) {
        if (key in req.body) {
            (charge as unknown as Record<string, unknown>)[key as string] = req.body[key as string];
        }
    }
    res.json(charge);
});

// DELETE /api/labor/:code
laborRouter.delete("/:code", (req, res) => {
    const idx = laborCatalog.findIndex(
        (l) => l.code.toLowerCase() === req.params.code.toLowerCase(),
    );
    if (idx === -1) return res.status(404).json({ error: "Labor charge not found" });
    laborCatalog.splice(idx, 1);
    res.status(204).send();
});
