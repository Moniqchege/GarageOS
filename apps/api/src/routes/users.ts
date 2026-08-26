import { Router } from "express";
import { employees } from "../store";
import type { Employee } from "@garage/types";

export const usersRouter = Router();

// GET /api/users
usersRouter.get("/", (_req, res) => {
    // Never expose PINs to the client
    res.json(employees.map(({ pin: _pin, ...safe }) => safe));
});

// GET /api/users/:id
usersRouter.get("/:id", (req, res) => {
    const emp = employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    const { pin: _pin, ...safe } = emp;
    res.json(safe);
});

// POST /api/users  — create employee
usersRouter.post("/", (req, res) => {
    const body = req.body as Partial<Employee>;
    if (!body.name || !body.pin || String(body.pin).length !== 4) {
        return res.status(400).json({ error: "name and a 4-digit pin are required" });
    }
    const id = "EMP-" + String(employees.length + 1).padStart(3, "0");
    const emp: Employee = {
        id,
        name: String(body.name),
        role: String(body.role ?? "Storekeeper"),
        phone: String(body.phone ?? ""),
        pin: String(body.pin),
        status: "Active",
        lastLogin: "Never",
    };
    employees.push(emp);
    const { pin: _pin, ...safe } = emp;
    res.status(201).json(safe);
});

// PATCH /api/users/:id  — update name, role, phone, status
usersRouter.patch("/:id", (req, res) => {
    const emp = employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const allowed: (keyof Employee)[] = ["name", "role", "phone", "status"];
    for (const key of allowed) {
        if (key in req.body) (emp as unknown as Record<string, unknown>)[key as string] = req.body[key as string];
    }
    const { pin: _pin, ...safe } = emp;
    res.json(safe);
});

// PATCH /api/users/:id/pin
usersRouter.patch("/:id/pin", (req, res) => {
    const emp = employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const { currentPin, newPin } = req.body as { currentPin: string; newPin: string };
    if (emp.pin !== String(currentPin)) {
        return res.status(403).json({ error: "Current PIN is incorrect" });
    }
    if (!newPin || String(newPin).length !== 4) {
        return res.status(400).json({ error: "New PIN must be 4 digits" });
    }
    emp.pin = String(newPin);
    res.status(204).send();
});

// PATCH /api/users/:id/status  — { status: "Active" | "Suspended" }
usersRouter.patch("/:id/status", (req, res) => {
    const emp = employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const { status } = req.body as { status: Employee["status"] };
    if (status !== "Active" && status !== "Suspended") {
        return res.status(400).json({ error: "status must be Active or Suspended" });
    }
    emp.status = status;
    const { pin: _pin, ...safe } = emp;
    res.json(safe);
});

// DELETE /api/users/:id
usersRouter.delete("/:id", (req, res) => {
    const idx = employees.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Employee not found" });
    employees.splice(idx, 1);
    res.status(204).send();
});
