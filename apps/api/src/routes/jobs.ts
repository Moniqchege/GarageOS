import { Router } from "express";
import { prisma } from "../db";
import type { JobCard, JobDiagnosisFinding, JobLine, JobStage } from "@garage/types";

export const jobsRouter = Router();

const jobInclude = { lines: { orderBy: { position: "asc" as const } } };

function toJobCard(row: Awaited<ReturnType<typeof findJobRow>>) {
    if (!row) return null;
    return {
        ...row,
        startedAt: Number(row.startedAt),
        diagnosisFindings: (row.diagnosisFindings as JobDiagnosisFinding[] | null) ?? undefined,
        diagnosisNotes: row.diagnosisNotes ?? undefined,
        lines: row.lines.map(({ id: _id, jobId: _jobId, position: _position, ...line }) => line),
    };
}

async function findJobRow(id: string) {
    return prisma.jobCard.findUnique({ where: { id }, include: jobInclude });
}

// GET /api/jobs?stage=diagnostics
jobsRouter.get("/", async (req, res) => {
    const { stage } = req.query;
    const rows = await prisma.jobCard.findMany({
        where: stage ? { stage: String(stage) } : undefined,
        include: jobInclude,
        orderBy: { startedAt: "desc" },
    });
    res.json(rows.map(toJobCard));
});

// GET /api/jobs/:id
jobsRouter.get("/:id", async (req, res) => {
    const row = await findJobRow(req.params.id);
    if (!row) return res.status(404).json({ error: "Job not found" });
    res.json(toJobCard(row));
});

// POST /api/jobs  — open a new job card
jobsRouter.post("/", async (req, res) => {
    const { registration, customer, phone, mechanic, faults } = req.body as Partial<JobCard>;
    if (!registration || !customer) {
        return res.status(400).json({ error: "registration and customer are required" });
    }
    const count = await prisma.jobCard.count();
    const id = `JC-${1040 + count + 1}`;

    const row = await prisma.jobCard.create({
        data: {
            id,
            registration: String(registration).toUpperCase(),
            customer: String(customer),
            phone: String(phone ?? ""),
            mechanic: String(mechanic ?? ""),
            stage: "diagnostics",
            startedAt: Date.now(),
            faults: String(faults ?? ""),
        },
        include: jobInclude,
    });
    res.status(201).json(toJobCard(row));
});

// PATCH /api/jobs/:id  — update faults, mechanic, etc.
jobsRouter.patch("/:id", async (req, res) => {
    const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Job not found" });

    const allowed: (keyof JobCard)[] = ["faults", "mechanic", "registration", "customer", "phone"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in req.body) data[key] = req.body[key as string];
    }

    const row = await prisma.jobCard.update({ where: { id: existing.id }, data, include: jobInclude });
    res.json(toJobCard(row));
});

// PATCH /api/jobs/:id/stage
jobsRouter.patch("/:id/stage", async (req, res) => {
    const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Job not found" });

    const validStages: JobStage[] = ["diagnostics", "active", "parts", "done"];
    const { stage } = req.body as { stage: JobStage };
    if (!validStages.includes(stage)) {
        return res.status(400).json({ error: "Invalid stage" });
    }
    const row = await prisma.jobCard.update({ where: { id: existing.id }, data: { stage }, include: jobInclude });
    res.json(toJobCard(row));
});

// POST /api/jobs/:id/lines
jobsRouter.post("/:id/lines", async (req, res) => {
    const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id }, include: jobInclude });
    if (!existing) return res.status(404).json({ error: "Job not found" });

    const line = req.body as JobLine;
    if (!line.type || !line.name || line.price == null) {
        return res.status(400).json({ error: "type, name, and price are required" });
    }
    await prisma.jobLine.create({
        data: {
            jobId: existing.id,
            type: line.type,
            name: line.name,
            price: line.price,
            sku: line.sku,
            position: existing.lines.length,
        },
    });
    const row = await findJobRow(existing.id);
    res.status(201).json(toJobCard(row));
});

// DELETE /api/jobs/:id/lines/:lineIdx
jobsRouter.delete("/:id/lines/:lineIdx", async (req, res) => {
    const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id }, include: jobInclude });
    if (!existing) return res.status(404).json({ error: "Job not found" });

    const idx = Number(req.params.lineIdx);
    if (isNaN(idx) || idx < 0 || idx >= existing.lines.length) {
        return res.status(400).json({ error: "Invalid line index" });
    }
    await prisma.jobLine.delete({ where: { id: existing.lines[idx].id } });

    const row = await findJobRow(existing.id);
    res.json(toJobCard(row));
});

// PATCH /api/jobs/:id/diagnosis — save mechanic notes + findings, separate
// from the customer-reported fault text captured at intake
jobsRouter.patch("/:id/diagnosis", async (req, res) => {
    const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Job not found" });

    const { notes, findings } = req.body as {
        notes?: string;
        findings?: JobDiagnosisFinding[];
    };
    const data: Record<string, unknown> = {};
    if (notes !== undefined) data.diagnosisNotes = String(notes);
    if (findings !== undefined) data.diagnosisFindings = findings;

    const row = await prisma.jobCard.update({ where: { id: existing.id }, data, include: jobInclude });
    res.json(toJobCard(row));
});

// POST /api/jobs/:id/close
jobsRouter.post("/:id/close", async (req, res) => {
    const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Job not found" });

    const row = await prisma.jobCard.update({ where: { id: existing.id }, data: { stage: "done" }, include: jobInclude });
    res.json(toJobCard(row));
});

// POST /api/jobs/:id/checkout — settle a job card's line items and close it
interface JobCheckoutBody {
    method: "cash" | "mpesa" | "card";
    amountTendered?: number;
    mpesaRef?: string;
}

jobsRouter.post("/:id/checkout", async (req, res) => {
    const job = await prisma.jobCard.findUnique({ where: { id: req.params.id }, include: jobInclude });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const lines = job.lines;
    if (lines.length === 0) {
        return res.status(400).json({ error: "Job card has no line items" });
    }

    const { method, amountTendered, mpesaRef } = req.body as JobCheckoutBody;
    if (!["cash", "mpesa", "card"].includes(method)) {
        return res.status(400).json({ error: "method must be cash, mpesa, or card" });
    }
    if (method === "mpesa" && (!mpesaRef || String(mpesaRef).length < 8)) {
        return res.status(400).json({ error: "A valid M-Pesa reference is required" });
    }

    const settings = await prisma.businessSettings.findUnique({ where: { id: 1 } });
    const vatRate = settings?.vatRate ?? 16;

    const subtotal = lines.reduce((s, l) => s + l.price, 0);
    const vat = Math.round(subtotal * (vatRate / 100));
    const total = subtotal + vat;

    const change =
        method === "cash" && amountTendered != null
            ? Math.max(0, Number(amountTendered) - total)
            : 0;

    // Deduct any part lines that reference real inventory SKUs
    for (const line of lines) {
        if (line.type === "part" && line.sku) {
            const item = await prisma.inventoryItem.findUnique({ where: { sku: line.sku } });
            if (item && item.qty > 0) {
                await prisma.inventoryItem.update({ where: { sku: item.sku }, data: { qty: { decrement: 1 } } });
            }
        }
    }

    const receipt = {
        id: "INV-" + (4000 + Math.floor(Math.random() * 900)),
        items: lines.map((l) => ({
            sku: l.sku ?? l.name,
            name: l.name,
            price: l.price,
            qty: 1,
        })),
        subtotal,
        vat,
        total,
        method,
        mpesaRef: mpesaRef ?? null,
        change,
        vatReg: settings?.kra ?? "",
        paidAt: new Date().toISOString(),
        jobId: job.id,
        registration: job.registration,
    };

    await prisma.jobCard.update({ where: { id: job.id }, data: { stage: "done" } });
    res.status(201).json(receipt);
});
