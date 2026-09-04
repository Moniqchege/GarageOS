import { Router } from "express";
import { prisma } from "../db";

export const payrollRouter = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Unix-ms boundaries for a calendar month (local midnight, UTC stored). */
function monthBounds(year: number, month: number): { from: bigint; to: bigint } {
    const from = BigInt(Date.UTC(year, month - 1, 1));           // 1st of month 00:00 UTC
    const to   = BigInt(Date.UTC(year, month, 1));               // 1st of NEXT month 00:00 UTC
    return { from, to };
}

/**
 * Calculate earnings for one employee given their completed jobs in a period.
 *
 * payMethod variants:
 *   Commission            → Σ(job.total × commissionRate / 100)
 *   Daily rate            → distinct working days × rate
 *   Daily rate+commission → daily earnings + commission earnings
 *   Fixed monthly         → rate (flat; independent of jobs)
 */
function calcEarnings(
    employee: {
        payMethod: string;
        rate: number | null;
        commissionRate: number | null;
    },
    jobs: Array<{ total: number; completedAt: bigint | null }>,
): number {
    const { payMethod, rate, commissionRate } = employee;

    const commissionEarnings = () => {
        if (!commissionRate) return 0;
        return jobs.reduce((sum, j) => sum + j.total * (commissionRate / 100), 0);
    };

    const dailyEarnings = () => {
        if (!rate) return 0;
        // count distinct calendar days (UTC date string YYYY-MM-DD)
        const days = new Set(
            jobs
                .filter((j) => j.completedAt != null)
                .map((j) => {
                    const d = new Date(Number(j.completedAt));
                    return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
                }),
        );
        return days.size * rate;
    };

    switch (payMethod) {
        case "Commission":
            return commissionEarnings();
        case "Daily rate":
            return dailyEarnings();
        case "Daily rate + commission":
            return dailyEarnings() + commissionEarnings();
        case "Fixed monthly":
            return rate ?? 0;
        default:
            return 0;
    }
}

// ─── GET /api/payroll?year=&month= ──────────────────────────────────────────
// Returns a payroll summary row for every active employee for the given month.
payrollRouter.get("/", async (req, res) => {
    const year  = parseInt(req.query.year  as string);
    const month = parseInt(req.query.month as string);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "year and month (1–12) are required" });
    }

    const { from, to } = monthBounds(year, month);

    // Fetch all employees
    const employees = await prisma.employee.findMany({ orderBy: { id: "asc" } });

    // Fetch all completed job cards in this month
    const allJobs = await prisma.jobCard.findMany({
        where: {
            stage: "done",
            completedAt: { gte: from, lt: to },
        },
        include: { lines: true },
    });

    // Fetch existing PayPeriod records for this month
    const periods = await prisma.payPeriod.findMany({
        where: { year, month },
    });
    const periodByEmployee = new Map(periods.map((p) => [p.employeeId, p]));

    const rows = employees.map((emp) => {
        const empJobs = allJobs
            .filter((j) => j.mechanic === emp.name)
            .map((j) => ({
                total: j.lines.reduce((s, l) => s + Number(l.price), 0),
                completedAt: j.completedAt,
            }));

        const earnings  = calcEarnings(emp, empJobs);
        const period    = periodByEmployee.get(emp.id);
        const paid      = period?.paid ?? false;
        const paidAt    = period?.paidAt != null ? Number(period.paidAt) : null;

        return {
            employeeId:    emp.id,
            name:          emp.name,
            role:          emp.role,
            payMethod:     emp.payMethod,
            rate:          emp.rate,
            commissionRate: emp.commissionRate,
            jobsCompleted: empJobs.length,
            laborGenerated: empJobs.reduce((s, j) => s + j.total, 0),
            earnings:      Math.round(earnings),
            paid,
            paidAt,
        };
    });

    res.json(rows);
});

// ─── GET /api/payroll/:employeeId?year=&month= ───────────────────────────────
// Single-employee period summary (used on EmployeePage overview).
payrollRouter.get("/:employeeId", async (req, res) => {
    const { employeeId } = req.params;
    const year  = parseInt(req.query.year  as string);
    const month = parseInt(req.query.month as string);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "year and month (1–12) are required" });
    }

    const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const { from, to } = monthBounds(year, month);

    const jobs = await prisma.jobCard.findMany({
        where: {
            mechanic: emp.name,
            stage: "done",
            completedAt: { gte: from, lt: to },
        },
        include: { lines: true },
    });

    const mappedJobs = jobs.map((j) => ({
        total: j.lines.reduce((s, l) => s + Number(l.price), 0),
        completedAt: j.completedAt,
    }));

    const earnings = calcEarnings(emp, mappedJobs);

    const period = await prisma.payPeriod.findUnique({
        where: { employeeId_year_month: { employeeId: emp.id, year, month } },
    });

    res.json({
        employeeId:    emp.id,
        year,
        month,
        payMethod:     emp.payMethod,
        rate:          emp.rate,
        commissionRate: emp.commissionRate,
        jobsCompleted: jobs.length,
        laborGenerated: mappedJobs.reduce((s, j) => s + j.total, 0),
        earnings:      Math.round(earnings),
        paid:          period?.paid ?? false,
        paidAt:        period?.paidAt != null ? Number(period.paidAt) : null,
    });
});

// ─── PATCH /api/payroll/:employeeId/mark-paid ────────────────────────────────
// Marks (or unmarks) a pay period as paid. Does NOT wire money anywhere.
payrollRouter.patch("/:employeeId/mark-paid", async (req, res) => {
    const { employeeId } = req.params;
    const year  = parseInt(req.query.year  as string);
    const month = parseInt(req.query.month as string);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "year and month (1–12) are required" });
    }

    const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    // Allow toggling: body may include { paid: false } to unmark
    const paid: boolean = req.body?.paid !== false;
    const paidAt = paid ? BigInt(Date.now()) : null;

    const period = await prisma.payPeriod.upsert({
        where: {
            employeeId_year_month: { employeeId: emp.id, year, month },
        },
        create: { employeeId: emp.id, year, month, paid, paidAt },
        update: { paid, paidAt },
    });

    res.json({
        employeeId:  period.employeeId,
        year:        period.year,
        month:       period.month,
        paid:        period.paid,
        paidAt:      period.paidAt != null ? Number(period.paidAt) : null,
    });
});
