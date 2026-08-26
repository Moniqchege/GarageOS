import { Router } from "express";
import {
    customerNotifications,
    customerRecords,
    customerVehicles,
} from "../store";
import type { CustomerVehicleRecord } from "@garage/types";

export const customersRouter = Router();

// GET /api/customers
customersRouter.get("/", (_req, res) => {
    res.json(customerRecords);
});

// GET /api/customers/:reg  — look up by registration plate (primary key in this domain)
customersRouter.get("/:reg", (req, res) => {
    const record = customerRecords.find(
        (c) => c.registration.toLowerCase() === req.params.reg.toLowerCase(),
    );
    if (!record) return res.status(404).json({ error: "Customer not found" });
    res.json(record);
});

// POST /api/customers
customersRouter.post("/", (req, res) => {
    const body = req.body as Partial<CustomerVehicleRecord>;
    if (!body.registration || !body.customer) {
        return res.status(400).json({ error: "registration and customer are required" });
    }
    const exists = customerRecords.find(
        (c) => c.registration.toLowerCase() === body.registration!.toLowerCase(),
    );
    if (exists) return res.status(409).json({ error: "Registration already exists" });

    const record: CustomerVehicleRecord = {
        registration: String(body.registration).toUpperCase(),
        customer: String(body.customer),
        phone: String(body.phone ?? ""),
        model: String(body.model ?? ""),
        mileage: Number(body.mileage ?? 0),
        lastService: String(body.lastService ?? ""),
        nextServiceKm: Number(body.nextServiceKm ?? 0),
        nextServiceDate: String(body.nextServiceDate ?? ""),
    };
    customerRecords.push(record);
    res.status(201).json(record);
});

// PATCH /api/customers/:reg
customersRouter.patch("/:reg", (req, res) => {
    const record = customerRecords.find(
        (c) => c.registration.toLowerCase() === req.params.reg.toLowerCase(),
    );
    if (!record) return res.status(404).json({ error: "Customer not found" });

    const allowed: (keyof CustomerVehicleRecord)[] = [
        "customer", "phone", "model", "mileage", "lastService", "nextServiceKm", "nextServiceDate",
    ];
    for (const key of allowed) {
        if (key in req.body) (record as unknown as Record<string, unknown>)[key as string] = req.body[key as string];
    }
    res.json(record);
});

// DELETE /api/customers/:reg
customersRouter.delete("/:reg", (req, res) => {
    const idx = customerRecords.findIndex(
        (c) => c.registration.toLowerCase() === req.params.reg.toLowerCase(),
    );
    if (idx === -1) return res.status(404).json({ error: "Customer not found" });
    customerRecords.splice(idx, 1);
    res.status(204).send();
});

// GET /api/customers/:reg/vehicles  — full vehicle detail (customer-app view)
customersRouter.get("/:reg/vehicles", (req, res) => {
    const vehicles = customerVehicles.filter(
        (v) => v.registration.toLowerCase() === req.params.reg.toLowerCase(),
    );
    res.json(vehicles);
});

// GET /api/customers/:reg/notifications
customersRouter.get("/:reg/notifications", (_req, res) => {
    // Demo: all notifications belong to the single seeded customer
    res.json(customerNotifications);
});

// PATCH /api/customers/:reg/notifications/:id/read
customersRouter.patch("/:reg/notifications/:id/read", (req, res) => {
    const notif = customerNotifications.find(
        (n) => n.id === Number(req.params.id),
    );
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    notif.read = true;
    res.json(notif);
});

// PATCH /api/customers/:reg/notifications/read-all
customersRouter.patch("/:reg/notifications/read-all", (_req, res) => {
    customerNotifications.forEach((n) => (n.read = true));
    res.json(customerNotifications);
});
