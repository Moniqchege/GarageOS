import { Router } from "express";
import { employees, inventoryItems, jobCards, settings } from "../store";

export const analyticsRouter = Router();

// GET /api/analytics/summary
analyticsRouter.get("/summary", (_req, res) => {
    const revenue = jobCards.reduce(
        (sum, j) => sum + (j.lines ?? []).reduce((s: number, l: { price: number }) => s + l.price, 0),
        0,
    );
    const openJobs = jobCards.filter((j) => j.stage !== "done").length;

    // Average turnaround: closed jobs only, in hours
    const closed = jobCards.filter((j) => j.stage === "done");
    const avgMs = closed.length
        ? closed.reduce((s, j) => s + (Date.now() - j.startedAt), 0) / closed.length
        : 0;
    const avgTurnaroundHours = Math.round(avgMs / 3_600_000);

    res.json({
        totalRevenue: revenue,
        totalJobs: jobCards.length,
        avgTurnaroundHours,
        openJobs,
        vatRate: settings.vatRate,
    });
});

// GET /api/analytics/revenue
analyticsRouter.get("/revenue", (_req, res) => {
    // Aggregate per-job revenue as a simple flat list for the frontend to chart
    const data = jobCards.map((j) => ({
        jobId: j.id,
        registration: j.registration,
        stage: j.stage,
        revenue: (j.lines ?? []).reduce((s: number, l: { price: number }) => s + l.price, 0),
        startedAt: j.startedAt,
    }));
    res.json(data);
});

// GET /api/analytics/jobs
analyticsRouter.get("/jobs", (_req, res) => {
    const stageCounts = {
        diagnostics: jobCards.filter((j) => j.stage === "diagnostics").length,
        active: jobCards.filter((j) => j.stage === "active").length,
        parts: jobCards.filter((j) => j.stage === "parts").length,
        done: jobCards.filter((j) => j.stage === "done").length,
    };
    res.json({ total: jobCards.length, ...stageCounts });
});

// GET /api/analytics/inventory
analyticsRouter.get("/inventory", (_req, res) => {
    const stockValue = inventoryItems.reduce((s, i) => s + i.cost * i.qty, 0);
    const lowStock = inventoryItems.filter((i) => i.qty <= i.low);
    const topHeld = [...inventoryItems]
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)
        .map(({ sku, name, qty, low }) => ({ sku, name, qty, low }));

    res.json({ stockValue, lowStockCount: lowStock.length, lowStockItems: lowStock, topHeld });
});

// GET /api/analytics/staff
analyticsRouter.get("/staff", (_req, res) => {
    const stats = employees.map((emp) => {
        const assigned = jobCards.filter((j) => j.mechanic === emp.name);
        const closed = assigned.filter((j) => j.stage === "done");
        const avgMs = closed.length
            ? closed.reduce((s, j) => s + (Date.now() - j.startedAt), 0) / closed.length
            : 0;
        return {
            employeeId: emp.id,
            name: emp.name,
            role: emp.role,
            jobsAssigned: assigned.length,
            jobsCompleted: closed.length,
            avgTurnaroundHours: Math.round(avgMs / 3_600_000),
        };
    });
    res.json(stats);
});
