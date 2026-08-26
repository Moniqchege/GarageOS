import { Router } from "express";

export const vehiclesRouter = Router();

// GET    /api/vehicles              — list all vehicles
vehiclesRouter.get("/", (_req, res) => {
    res.status(501).json({ message: "Not implemented" });
});

// GET    /api/vehicles/:id          — get a single vehicle by id
vehiclesRouter.get("/:id", (_req, res) => {
    res.status(501).json({ message: "Not implemented" });
});

// POST   /api/vehicles              — register a new vehicle (intake)
vehiclesRouter.post("/", (_req, res) => {
    res.status(501).json({ message: "Not implemented" });
});

// PATCH  /api/vehicles/:id          — update vehicle details / mileage / health
vehiclesRouter.patch("/:id", (_req, res) => {
    res.status(501).json({ message: "Not implemented" });
});

// DELETE /api/vehicles/:id          — remove a vehicle record
vehiclesRouter.delete("/:id", (_req, res) => {
    res.status(501).json({ message: "Not implemented" });
});

// GET    /api/vehicles/:id/history  — full service history for a vehicle
vehiclesRouter.get("/:id/history", (_req, res) => {
    res.status(501).json({ message: "Not implemented" });
});
