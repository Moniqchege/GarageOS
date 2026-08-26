import { Router } from "express";
import { jobCards, inventoryItems, settings } from "../store";
import type { JobCard, JobDiagnosisFinding, JobLine, JobStage } from "@garage/types";

export const jobsRouter = Router();

// GET /api/jobs?stage=diagnostics
jobsRouter.get("/", (req, res) => {
    const { stage } = req.query;
    const result = stage
        ? jobCards.filter((j) => j.stage === stage)
        : jobCards;
    res.json(result);
});

// GET /api/jobs/:id
jobsRouter.get("/:id", (req, res) => {
    const job = jobCards.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
});

// POST /api/jobs  — open a new job card
jobsRouter.post("/", (req, res) => {
    const { registration, customer, phone, mechanic, faults } = req.body as Partial<JobCard>;
    if (!registration || !customer) {
        return res.status(400).json({ error: "registration and customer are required" });
    }
    const id = `JC-${1040 + jobCards.length + 1}`;
    const job: JobCard = {
        id,
        registration: String(registration).toUpperCase(),
        customer: String(customer),
        phone: String(phone ?? ""),
        mechanic: String(mechanic ?? ""),
        stage: "diagnostics",
        startedAt: Date.now(),
        faults: String(faults ?? ""),
        lines: [],
    };
    jobCards.unshift(job);
    res.status(201).json(job);
});

// PATCH /api/jobs/:id  — update faults, mechanic, etc.
jobsRouter.patch("/:id", (req, res) => {
    const idx = jobCards.findIndex((j) => j.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Job not found" });
    const allowed: (keyof JobCard)[] = ["faults", "mechanic", "registration", "customer", "phone"];
    for (const key of allowed) {
        if (key in req.body) {
            (jobCards[idx] as unknown as Record<string, unknown>)[key as string] = req.body[key as string];
        }
    }
    res.json(jobCards[idx]);
});

// PATCH /api/jobs/:id/stage
jobsRouter.patch("/:id/stage", (req, res) => {
    const job = jobCards.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    const validStages: JobStage[] = ["diagnostics", "active", "parts", "done"];
    const { stage } = req.body as { stage: JobStage };
    if (!validStages.includes(stage)) {
        return res.status(400).json({ error: "Invalid stage" });
    }
    job.stage = stage;
    res.json(job);
});

// POST /api/jobs/:id/lines
jobsRouter.post("/:id/lines", (req, res) => {
    const job = jobCards.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    const line = req.body as JobLine;
    if (!line.type || !line.name || line.price == null) {
        return res.status(400).json({ error: "type, name, and price are required" });
    }
    job.lines = [...(job.lines ?? []), line];
    res.status(201).json(job);
});

// DELETE /api/jobs/:id/lines/:lineIdx
jobsRouter.delete("/:id/lines/:lineIdx", (req, res) => {
    const job = jobCards.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    const idx = Number(req.params.lineIdx);
    if (isNaN(idx) || idx < 0 || idx >= (job.lines?.length ?? 0)) {
        return res.status(400).json({ error: "Invalid line index" });
    }
    job.lines = job.lines!.filter((_: unknown, i: number) => i !== idx);
    res.json(job);
});

// PATCH /api/jobs/:id/diagnosis — save mechanic notes + findings, separate
// from the customer-reported fault text captured at intake
jobsRouter.patch("/:id/diagnosis", (req, res) => {
    const job = jobCards.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const { notes, findings } = req.body as {
        notes?: string;
        findings?: JobDiagnosisFinding[];
    };
    if (notes !== undefined) job.diagnosisNotes = String(notes);
    if (findings !== undefined) job.diagnosisFindings = findings;

    res.json(job);
});

// POST /api/jobs/:id/close
jobsRouter.post("/:id/close", (req, res) => {
    const job = jobCards.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    job.stage = "done";
    res.json(job);
});

// POST /api/jobs/:id/checkout — settle a job card's line items and close it
interface JobCheckoutBody {
    method: "cash" | "mpesa" | "card";
    amountTendered?: number;
    mpesaRef?: string;
}

jobsRouter.post("/:id/checkout", (req, res) => {
    const job = jobCards.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const lines = job.lines ?? [];
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

    const subtotal = lines.reduce((s, l) => s + l.price, 0);
    const vat = Math.round(subtotal * (settings.vatRate / 100));
    const total = subtotal + vat;

    const change =
        method === "cash" && amountTendered != null
            ? Math.max(0, Number(amountTendered) - total)
            : 0;

    // Deduct any part lines that reference real inventory SKUs
    for (const line of lines) {
        if (line.type === "part" && line.sku) {
            const item = inventoryItems.find((i) => i.sku === line.sku);
            if (item && item.qty > 0) item.qty -= 1;
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
        vatReg: settings.kra,
        paidAt: new Date().toISOString(),
        jobId: job.id,
        registration: job.registration,
    };

    job.stage = "done";
    res.status(201).json(receipt);
});
