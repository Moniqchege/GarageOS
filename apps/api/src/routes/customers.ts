import { Router } from "express";
import { prisma } from "../db";
import type { CustomerVehicleRecord } from "@garage/types";

export const customersRouter = Router();

// GET /api/customers
customersRouter.get("/", async (_req, res) => {
    const records = await prisma.vehicleRecord.findMany({ orderBy: { registration: "asc" } });
    res.json(records);
});

// GET /api/customers/:reg  — look up by registration plate (primary key in this domain)
customersRouter.get("/:reg", async (req, res) => {
    const record = await prisma.vehicleRecord.findUnique({
        where: { registration: req.params.reg.toUpperCase() },
    });
    if (!record) return res.status(404).json({ error: "Customer not found" });
    res.json(record);
});

// POST /api/customers
customersRouter.post("/", async (req, res) => {
    const body = req.body as Partial<CustomerVehicleRecord>;
    if (!body.registration || !body.customer) {
        return res.status(400).json({ error: "registration and customer are required" });
    }
    const registration = String(body.registration).toUpperCase();

    const exists = await prisma.vehicleRecord.findUnique({ where: { registration } });
    if (exists) return res.status(409).json({ error: "Registration already exists" });

    const record = await prisma.vehicleRecord.create({
        data: {
            registration,
            customer: String(body.customer),
            phone: String(body.phone ?? ""),
            model: String(body.model ?? ""),
            mileage: Number(body.mileage ?? 0),
            lastService: String(body.lastService ?? ""),
            nextServiceKm: Number(body.nextServiceKm ?? 0),
            nextServiceDate: String(body.nextServiceDate ?? ""),
        },
    });
    res.status(201).json(record);
});

// PATCH /api/customers/:reg
customersRouter.patch("/:reg", async (req, res) => {
    const existing = await prisma.vehicleRecord.findUnique({ where: { registration: req.params.reg.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Customer not found" });

    const allowed: (keyof CustomerVehicleRecord)[] = [
        "customer", "phone", "model", "mileage", "lastService", "nextServiceKm", "nextServiceDate",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in req.body) data[key] = req.body[key as string];
    }

    const record = await prisma.vehicleRecord.update({ where: { registration: existing.registration }, data });
    res.json(record);
});

// DELETE /api/customers/:reg
customersRouter.delete("/:reg", async (req, res) => {
    const existing = await prisma.vehicleRecord.findUnique({ where: { registration: req.params.reg.toUpperCase() } });
    if (!existing) return res.status(404).json({ error: "Customer not found" });

    await prisma.vehicleRecord.delete({ where: { registration: existing.registration } });
    res.status(204).send();
});

// GET /api/customers/:reg/vehicles  — full vehicle detail (customer-app view)
customersRouter.get("/:reg/vehicles", async (req, res) => {
    const vehicle = await prisma.customerVehicle.findUnique({
        where: { registration: req.params.reg.toUpperCase() },
    });
    res.json(vehicle ? [vehicle] : []);
});

// GET /api/customers/:reg/notifications
customersRouter.get("/:reg/notifications", async (_req, res) => {
    // Demo: all notifications belong to the single seeded customer
    const notifications = await prisma.customerNotification.findMany({ orderBy: { id: "desc" } });
    res.json(notifications);
});

// PATCH /api/customers/:reg/notifications/:id/read
customersRouter.patch("/:reg/notifications/:id/read", async (req, res) => {
    const existing = await prisma.customerNotification.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ error: "Notification not found" });

    const notif = await prisma.customerNotification.update({ where: { id: existing.id }, data: { read: true } });
    res.json(notif);
});

// PATCH /api/customers/:reg/notifications/read-all
customersRouter.patch("/:reg/notifications/read-all", async (_req, res) => {
    await prisma.customerNotification.updateMany({ data: { read: true } });
    const notifications = await prisma.customerNotification.findMany({ orderBy: { id: "desc" } });
    res.json(notifications);
});
