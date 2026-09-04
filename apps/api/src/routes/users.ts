import { Router } from "express";
import { prisma } from "../db";
import type { Employee, PayMethod } from "@garage/types";

export const usersRouter = Router();

function toSafe(emp: any) {
    const { pin, ...rest } = emp;
    return { ...rest, hasPin: pin !== "" };
}

// GET /api/users
usersRouter.get("/", async (_req, res) => {
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

// GET /api/users/:id/compensation-history
usersRouter.get("/:id/compensation-history", async (req, res) => {
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const rows = await prisma.compensationHistory.findMany({
        where: { employeeId: emp.id },
        orderBy: { effectiveAt: "desc" },
    });

    const history = rows.map((h) =>
        h.type === "payment_status"
            ? {
                id: h.id,
                type: "payment_status" as const,
                year: h.year!,
                month: h.month!,
                paid: h.paid!,
                effectiveAt: h.effectiveAt.getTime(),
            }
            : {
                id: h.id,
                type: "compensation_change" as const,
                payMethod: h.payMethod!,
                rate: h.rate,
                commissionRate: h.commissionRate,
                effectiveAt: h.effectiveAt.getTime(),
            },
    );

    res.json(history);
});

// POST /api/users — create employee
usersRouter.post("/", async (req, res) => {
    const body = req.body as Partial<Employee> & { pin?: string; loginEnabled?: boolean };
    if (!body.name) {
        return res.status(400).json({ error: "name is required" });
    }
    const loginEnabled = body.loginEnabled !== false;
    if (loginEnabled && (!body.pin || String(body.pin).length !== 4)) {
        return res.status(400).json({ error: "A 4-digit PIN is required for system access" });
    }

    const count = await prisma.employee.count();
    const id = "EMP-" + String(count + 1).padStart(3, "0");

    const emp = await prisma.employee.create({
        data: {
            id,
            name: String(body.name),
            role: String(body.role ?? "Storekeeper"),
            phone: String(body.phone ?? ""),
            pin: loginEnabled ? String(body.pin) : "",
            status: "Active",
            lastLogin: "Never",
            payMethod: body.payMethod ?? "Commission",
            rate: body.rate != null ? Number(body.rate) : null,
            commissionRate: body.commissionRate != null ? Number(body.commissionRate) : null,
        },
    });

    await prisma.compensationHistory.create({
        data: {
            employeeId: emp.id,
            type: "compensation_change",
            payMethod: emp.payMethod,
            rate: emp.rate,
            commissionRate: emp.commissionRate,
        },
    });
    const { pin: _pin, ...safe } = emp;
    res.status(201).json(safe);
});

// PATCH /api/users/:id — update name, role, phone, status
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

// PATCH /api/users/:id/compensation — payMethod, rate, commissionRate
usersRouter.patch("/:id/compensation", async (req, res) => {
    const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Employee not found" });

    const { payMethod, rate, commissionRate } = req.body as {
        payMethod?: PayMethod;
        rate?: number | string | null;
        commissionRate?: number | string | null;
    };

    const validMethods: PayMethod[] = [
        "Commission",
        "Daily rate",
        "Daily rate + commission",
        "Fixed monthly",
    ];
    if (payMethod && !validMethods.includes(payMethod)) {
        return res.status(400).json({ error: "Invalid pay method" });
    }

    const data = {
        ...(payMethod ? { payMethod } : {}),
        ...(rate !== undefined ? { rate: rate === null || rate === "" ? null : Number(rate) } : {}),
        ...(commissionRate !== undefined
            ? { commissionRate: commissionRate === null || commissionRate === "" ? null : Number(commissionRate) }
            : {}),
    };

    const nextPayMethod = data.payMethod ?? existing.payMethod;
    const nextRate = "rate" in data ? data.rate : existing.rate;
    const nextCommissionRate = "commissionRate" in data ? data.commissionRate : existing.commissionRate;
    const changed =
        nextPayMethod !== existing.payMethod ||
        nextRate !== existing.rate ||
        nextCommissionRate !== existing.commissionRate;

    const [emp] = await prisma.$transaction([
        prisma.employee.update({ where: { id: existing.id }, data }),
        ...(changed
            ? [
                prisma.compensationHistory.create({
                    data: {
                        employeeId: existing.id,
                        type: "compensation_change",
                        payMethod: nextPayMethod,
                        rate: nextRate,
                        commissionRate: nextCommissionRate,
                    },
                }),
            ]
            : []),
    ]);

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

// PATCH /api/users/:id/status
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

// GET /api/users/:id/activity — completed job cards assigned to this employee
usersRouter.get("/:id/activity", async (req, res) => {
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const jobs = await prisma.jobCard.findMany({
        where: {
            mechanic: emp.name,
            stage: "done",
        },
        include: {
            lines: true,
            vehicle: { include: { customer: true } },
        },
        orderBy: { completedAt: "desc" },
        take: 50,
    });

    const result = jobs.map((job) => ({
        id: job.id,
        registration: job.registration,
        vehicle: job.vehicle
            ? `${job.vehicle.model} – ${job.registration}`
            : job.registration,
        customer: job.vehicle?.customer?.name ?? "",
        faults: job.faults,
        completedAt: job.completedAt != null ? Number(job.completedAt) : null,
        total: job.lines.reduce((sum, l) => sum + Number(l.price), 0),
    }));

    res.json(result);
});

// PATCH /api/users/:id/access 
usersRouter.patch("/:id/access", async (req, res) => {
    const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Employee not found" });

    const { enabled, pin } = req.body as { enabled: boolean; pin?: string };

    if (!enabled) {
        const emp = await prisma.employee.update({
            where: { id: existing.id },
            data: { loginEnabled: false },
        });
        return res.json(toSafe(emp));
    }

    if (existing.pin === "") {
        if (!pin || String(pin).length !== 4) {
            return res.status(400).json({ error: "A 4-digit PIN is required to grant system access" });
        }
        const emp = await prisma.employee.update({
            where: { id: existing.id },
            data: { pin: String(pin), loginEnabled: true },
        });
        return res.json(toSafe(emp));
    }

    const emp = await prisma.employee.update({
        where: { id: existing.id },
        data: { loginEnabled: true },
    });
    res.json(toSafe(emp));
});