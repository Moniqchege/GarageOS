import { Router } from "express";
import { prisma } from "../db";
import type { Employee } from "@garage/types";

export const usersRouter = Router();

// GET /api/users
usersRouter.get("/", async (_req, res) => {
    // Never expose PINs to the client
    const employees = await prisma.employee.findMany({ orderBy: { id: "asc" } });
    res.json(employees.map(({ pin: _pin, ...safe }) => safe));
});

// GET /api/users/:id
usersRouter.get("/:id", async (req, res) => {
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    const { pin: _pin, ...safe } = emp;
    res.json(safe);
});

// POST /api/users  — create employee
usersRouter.post("/", async (req, res) => {
    const body = req.body as Partial<Employee>;
    if (!body.name || !body.pin || String(body.pin).length !== 4) {
        return res.status(400).json({ error: "name and a 4-digit pin are required" });
    }
    const count = await prisma.employee.count();
    const id = "EMP-" + String(count + 1).padStart(3, "0");

    const emp = await prisma.employee.create({
        data: {
            id,
            name: String(body.name),
            role: String(body.role ?? "Storekeeper"),
            phone: String(body.phone ?? ""),
            pin: String(body.pin),
            status: "Active",
            lastLogin: "Never",
        },
    });
    const { pin: _pin, ...safe } = emp;
    res.status(201).json(safe);
});

// PATCH /api/users/:id  — update name, role, phone, status
usersRouter.patch("/:id", async (req, res) => {
    const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Employee not found" });

    const allowed: (keyof Employee)[] = ["name", "role", "phone", "status"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in req.body) data[key] = req.body[key as string];
    }

    const emp = await prisma.employee.update({ where: { id: existing.id }, data });
    const { pin: _pin, ...safe } = emp;
    res.json(safe);
});

// PATCH /api/users/:id/pin
usersRouter.patch("/:id/pin", async (req, res) => {
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const { currentPin, newPin } = req.body as { currentPin: string; newPin: string };
    if (emp.pin !== String(currentPin)) {
        return res.status(403).json({ error: "Current PIN is incorrect" });
    }
    if (!newPin || String(newPin).length !== 4) {
        return res.status(400).json({ error: "New PIN must be 4 digits" });
    }
    await prisma.employee.update({ where: { id: emp.id }, data: { pin: String(newPin) } });
    res.status(204).send();
});

// PATCH /api/users/:id/status  — { status: "Active" | "Suspended" }
usersRouter.patch("/:id/status", async (req, res) => {
    const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Employee not found" });

    const { status } = req.body as { status: Employee["status"] };
    if (status !== "Active" && status !== "Suspended") {
        return res.status(400).json({ error: "status must be Active or Suspended" });
    }
    const emp = await prisma.employee.update({ where: { id: existing.id }, data: { status } });
    const { pin: _pin, ...safe } = emp;
    res.json(safe);
});

// DELETE /api/users/:id
usersRouter.delete("/:id", async (req, res) => {
    const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Employee not found" });

    await prisma.employee.delete({ where: { id: existing.id } });
    res.status(204).send();
});
