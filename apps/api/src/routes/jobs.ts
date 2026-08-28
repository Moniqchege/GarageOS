import { Router } from "express";
import { prisma } from "../db";
import type {
    JobCard as JobCardType,
    JobDiagnosisFinding,
    JobLine as JobLineType,
    JobStage,
} from "@garage/types";

export const jobsRouter = Router();

const jobInclude = {
    vehicle: {
        include: {
            customer: true,
        },
    },

    lines: {
        orderBy: {
            position: "asc" as const,
        },
    },
};

async function findJobRow(id: string) {
    return prisma.jobCard.findUnique({
        where: {
            id,
        },
        include: jobInclude,
    });
}

function toJobCard(row: any) {
    if (!row) return null;

    return {
        id: row.id,

        registration: row.registration,

        customer: row.vehicle?.customer?.name ?? "",
        phone: row.vehicle?.customer?.phone ?? "",

        vehicle: row.vehicle
            ? {
                registration: row.vehicle.registration,
                model: row.vehicle.model,
                year: row.vehicle.year,
                color: row.vehicle.color,
                mileage: row.vehicle.mileage,
            }
            : null,

        mechanic: row.mechanic,
        stage: row.stage,

        startedAt: Number(row.startedAt),

        completedAt:
            row.completedAt != null
                ? Number(row.completedAt)
                : null,

        mileageAtStart: row.mileageAtStart,
        mileageAtEnd: row.mileageAtEnd,

        faults: row.faults,

        diagnosisNotes:
            row.diagnosisNotes ?? undefined,

        diagnosisFindings:
            (row.diagnosisFindings as
                | JobDiagnosisFinding[]
                | null) ?? undefined,

        lines: row.lines.map((line: any) => ({
            id: line.id,
            type: line.type,
            name: line.name,
            price: line.price,
            sku: line.sku,
        })),

        total: row.lines.reduce(
            (sum: number, line: any) =>
                sum + Number(line.price),
            0,
        ),
    };
}

// Generate job number
async function generateJobId() {
    const count = await prisma.jobCard.count();

    return `JC-${1041 + count}`;
}

// GET /api/jobs
jobsRouter.get("/", async (req, res) => {
    try {
        const { stage, registration } = req.query;

        const rows = await prisma.jobCard.findMany({
            where: {
                ...(stage
                    ? {
                        stage: String(stage),
                    }
                    : {}),

                ...(registration
                    ? {
                        registration:
                            String(
                                registration,
                            ).toUpperCase(),
                    }
                    : {}),
            },

            include: jobInclude,

            orderBy: {
                startedAt: "desc",
            },
        });

        res.json(rows.map(toJobCard));
    } catch (error) {
        console.error("GET /api/jobs failed:", error);

        res.status(500).json({
            error: "Failed to load jobs",
        });
    }
});

// GET /api/jobs/:id
jobsRouter.get("/:id", async (req, res) => {
    try {
        const row = await findJobRow(req.params.id);

        if (!row) {
            return res.status(404).json({
                error: "Job not found",
            });
        }

        res.json(toJobCard(row));
    } catch (error) {
        console.error(
            "GET /api/jobs/:id failed:",
            error,
        );

        res.status(500).json({
            error: "Failed to load job",
        });
    }
});

// POST /api/jobs
jobsRouter.post("/", async (req, res) => {
    try {
        const {
            registration,
            mechanic,
            faults,
            mileageAtStart,
            fuel,
        } = req.body as Partial<JobCardType> & {
                mileageAtStart?: number;
                fuel?: number;
        };

        if (!registration) {
            return res.status(400).json({
                error: "registration is required",
            });
        }

        const normalizedRegistration =
            String(registration)
                .trim()
                .toUpperCase();

        const vehicle =
            await prisma.vehicle.findUnique({
                where: {
                    registration:
                        normalizedRegistration,
                },
                include: {
                    customer: true,
                },
            });

        if (!vehicle) {
            return res.status(404).json({
                error:
                    "Vehicle not found. Create the customer and vehicle before opening a job card.",
            });
        }

        const activeJob =
            await prisma.jobCard.findFirst({
                where: {
                    registration:
                        normalizedRegistration,

                    stage: {
                        not: "done",
                    },
                },
            });

        if (activeJob) {
            return res.status(409).json({
                error:
                    "This vehicle already has an active job card.",
                jobId: activeJob.id,
            });
        }

        const id = await generateJobId();

        const startingMileage =
            mileageAtStart != null
                ? Number(mileageAtStart)
                : vehicle.mileage;

        const row = await prisma.jobCard.create({
            data: {
                id,

                registration:
                    normalizedRegistration,

                mechanic: String(
                    mechanic ?? "",
                ),

                stage: "diagnostics",

                startedAt: BigInt(
                    Date.now(),
                ),

                mileageAtStart:
                    startingMileage,

                faults: String(
                    faults ?? "",
                ),
            },

            include: jobInclude,
        });

        if (
            startingMileage > vehicle.mileage || fuel != null
        ) {
            await prisma.vehicle.update({
                where: {
                    registration:
                        normalizedRegistration,
                },
                data: {
                    ...(startingMileage > vehicle.mileage ? { mileage: startingMileage } : {}),
                    ...(fuel != null ? { fuel: Number(fuel) } : {}),
                },
            });
        }

        res.status(201).json(
            toJobCard(row),
        );
    } catch (error) {
        console.error(
            "POST /api/jobs failed:",
            error,
        );

        res.status(500).json({
            error: "Failed to create job card",
        });
    }
});

// PATCH /api/jobs/:id
jobsRouter.patch("/:id", async (req, res) => {
    try {
        const existing =
            await prisma.jobCard.findUnique({
                where: {
                    id: req.params.id,
                },
            });

        if (!existing) {
            return res.status(404).json({
                error: "Job not found",
            });
        }

        const allowed = [
            "faults",
            "mechanic",
            "mileageAtStart",
            "mileageAtEnd",
        ];

        const data: Record<
            string,
            unknown
        > = {};

        for (const key of allowed) {
            if (
                key in req.body
            ) {
                data[key] =
                    req.body[key];
            }
        }

        const row =
            await prisma.jobCard.update({
                where: {
                    id: existing.id,
                },

                data,

                include: jobInclude,
            });

        res.json(
            toJobCard(row),
        );
    } catch (error) {
        console.error(
            "PATCH /api/jobs/:id failed:",
            error,
        );

        res.status(500).json({
            error: "Failed to update job",
        });
    }
});

// PATCH /api/jobs/:id/stage
jobsRouter.patch(
    "/:id/stage",
    async (req, res) => {
        try {
            const existing =
                await prisma.jobCard.findUnique({
                    where: {
                        id: req.params.id,
                    },
                });

            if (!existing) {
                return res.status(404).json({
                    error: "Job not found",
                });
            }

            const validStages: JobStage[] = [
                "diagnostics",
                "active",
                "parts",
                "done",
            ];

            const {
                stage,
                mileageAtEnd,
            } =
                req.body as {
                    stage: JobStage;
                    mileageAtEnd?: number;
                };

            if (
                !validStages.includes(
                    stage,
                )
            ) {
                return res.status(400).json({
                    error: "Invalid stage",
                });
            }

            const completing =
                stage === "done";

            const row =
                await prisma.$transaction(
                    async (tx) => {
                        const updated =
                            await tx.jobCard.update(
                                {
                                    where: {
                                        id: existing.id,
                                    },

                                    data: {
                                        stage,

                                        ...(completing
                                            ? {
                                                completedAt:
                                                    BigInt(
                                                        Date.now(),
                                                    ),

                                                ...(mileageAtEnd !=
                                                    null
                                                    ? {
                                                        mileageAtEnd:
                                                            Number(
                                                                mileageAtEnd,
                                                            ),
                                                    }
                                                    : {}),
                                            }
                                            : {}),
                                    },

                                    include:
                                        jobInclude,
                                },
                            );

                        if (
                            completing &&
                            mileageAtEnd !=
                            null
                        ) {
                            await tx.vehicle.update(
                                {
                                    where: {
                                        registration:
                                            existing.registration,
                                    },

                                    data: {
                                        mileage:
                                            Number(
                                                mileageAtEnd,
                                            ),
                                    },
                                },
                            );
                        }

                        return updated;
                    },
                );

            res.json(
                toJobCard(row),
            );
        } catch (error) {
            console.error(
                "PATCH stage failed:",
                error,
            );

            res.status(500).json({
                error: "Failed to update job stage",
            });
        }
    },
);

// POST /api/jobs/:id/lines
jobsRouter.post(
    "/:id/lines",
    async (req, res) => {
        try {
            const existing =
                await prisma.jobCard.findUnique({
                    where: {
                        id: req.params.id,
                    },
                    include: {
                        lines: true,
                    },
                });

            if (!existing) {
                return res.status(404).json({
                    error: "Job not found",
                });
            }

            const line =
                req.body as JobLineType;

            if (
                !line.type ||
                !line.name ||
                line.price == null
            ) {
                return res.status(400).json({
                    error:
                        "type, name, and price are required",
                });
            }

            if (
                !["labor", "part"].includes(
                    line.type,
                )
            ) {
                return res.status(400).json({
                    error:
                        "type must be labor or part",
                });
            }

            await prisma.jobLine.create({
                data: {
                    jobId: existing.id,
                    type: line.type,
                    name: line.name,
                    price: Number(
                        line.price,
                    ),
                    sku:
                        line.sku ??
                        null,
                    position:
                        existing.lines
                            .length,
                },
            });

            const row =
                await findJobRow(
                    existing.id,
                );

            res.status(201).json(
                toJobCard(row),
            );
        } catch (error) {
            console.error(
                "POST job line failed:",
                error,
            );

            res.status(500).json({
                error:
                    "Failed to add job line",
            });
        }
    },
);

// DELETE /api/jobs/:id/lines/:lineIdx
jobsRouter.delete(
    "/:id/lines/:lineIdx",
    async (req, res) => {
        try {
            const existing =
                await prisma.jobCard.findUnique({
                    where: {
                        id: req.params.id,
                    },
                    include: {
                        lines: {
                            orderBy: {
                                position:
                                    "asc",
                            },
                        },
                    },
                });

            if (!existing) {
                return res.status(404).json({
                    error: "Job not found",
                });
            }

            const idx = Number(
                req.params.lineIdx,
            );

            if (
                !Number.isInteger(idx) ||
                idx < 0 ||
                idx >=
                existing.lines
                    .length
            ) {
                return res.status(400).json({
                    error:
                        "Invalid line index",
                });
            }

            await prisma.jobLine.delete({
                where: {
                    id:
                        existing
                            .lines[idx]
                            .id,
                },
            });

            const row =
                await findJobRow(
                    existing.id,
                );

            res.json(
                toJobCard(row),
            );
        } catch (error) {
            console.error(
                "DELETE job line failed:",
                error,
            );

            res.status(500).json({
                error:
                    "Failed to remove job line",
            });
        }
    },
);

// PATCH /api/jobs/:id/diagnosis
jobsRouter.patch(
    "/:id/diagnosis",
    async (req, res) => {
        try {
            const existing =
                await prisma.jobCard.findUnique({
                    where: {
                        id: req.params.id,
                    },
                });

            if (!existing) {
                return res.status(404).json({
                    error: "Job not found",
                });
            }

            const {
                notes,
                findings,
            } =
                req.body as {
                    notes?: string;
                    findings?: JobDiagnosisFinding[];
                };

            const data: Record<
                string,
                unknown
            > = {};

            if (
                notes !== undefined
            ) {
                data.diagnosisNotes =
                    String(
                        notes,
                    );
            }

            if (
                findings !== undefined
            ) {
                data.diagnosisFindings =
                    findings;
            }

            const row =
                await prisma.jobCard.update({
                    where: {
                        id: existing.id,
                    },

                    data,

                    include: jobInclude,
                });

            res.json(
                toJobCard(row),
            );
        } catch (error) {
            console.error(
                "PATCH diagnosis failed:",
                error,
            );

            res.status(500).json({
                error:
                    "Failed to save diagnosis",
            });
        }
    },
);

// POST /api/jobs/:id/close
jobsRouter.post(
    "/:id/close",
    async (req, res) => {
        try {
            const existing =
                await prisma.jobCard.findUnique({
                    where: {
                        id: req.params.id,
                    },
                });

            if (!existing) {
                return res.status(404).json({
                    error: "Job not found",
                });
            }

            const {
                mileageAtEnd,
            } =
                req.body as {
                    mileageAtEnd?: number;
                };

            const row =
                await prisma.$transaction(
                    async (tx) => {
                        const updated =
                            await tx.jobCard.update(
                                {
                                    where: {
                                        id: existing.id,
                                    },

                                    data: {
                                        stage: "done",

                                        completedAt:
                                            BigInt(
                                                Date.now(),
                                            ),

                                        ...(mileageAtEnd !=
                                            null
                                            ? {
                                                mileageAtEnd:
                                                    Number(
                                                        mileageAtEnd,
                                                    ),
                                            }
                                            : {}),
                                    },

                                    include:
                                        jobInclude,
                                },
                            );

                        if (
                            mileageAtEnd !=
                            null
                        ) {
                            await tx.vehicle.update(
                                {
                                    where: {
                                        registration:
                                            existing.registration,
                                    },

                                    data: {
                                        mileage:
                                            Number(
                                                mileageAtEnd,
                                            ),
                                    },
                                },
                            );
                        }

                        return updated;
                    },
                );

            res.json(
                toJobCard(row),
            );
        } catch (error) {
            console.error(
                "POST close failed:",
                error,
            );

            res.status(500).json({
                error:
                    "Failed to close job",
            });
        }
    },
);

// POST /api/jobs/:id/checkout
interface JobCheckoutBody {
    method: "cash" | "mpesa" | "card";
    amountTendered?: number;
    mpesaRef?: string;
    mileageAtEnd?: number;
}

jobsRouter.post(
    "/:id/checkout",
    async (req, res) => {
        try {
            const job =
                await prisma.jobCard.findUnique({
                    where: {
                        id: req.params.id,
                    },

                    include: {
                        ...jobInclude,
                    },
                });

            if (!job) {
                return res.status(404).json({
                    error: "Job not found",
                });
            }

            if (job.lines.length === 0) {
                return res.status(400).json({
                    error:
                        "Job card has no line items",
                });
            }

            if (
                job.stage === "done"
            ) {
                return res.status(409).json({
                    error:
                        "Job has already been completed",
                });
            }

            const {
                method,
                amountTendered,
                mpesaRef,
                mileageAtEnd,
            } =
                req.body as JobCheckoutBody;

            if (
                ![
                    "cash",
                    "mpesa",
                    "card",
                ].includes(method)
            ) {
                return res.status(400).json({
                    error:
                        "method must be cash, mpesa, or card",
                });
            }

            if (
                method === "mpesa" &&
                (!mpesaRef ||
                    String(
                        mpesaRef,
                    ).length < 8)
            ) {
                return res.status(400).json({
                    error:
                        "A valid M-Pesa reference is required",
                });
            }

            const settings =
                await prisma.businessSettings.findUnique(
                    {
                        where: {
                            id: 1,
                        },
                    },
                );

            const vatRate =
                settings?.vatRate ??
                16;

            const subtotal =
                job.lines.reduce(
                    (sum, line) =>
                        sum +
                        Number(
                            line.price,
                        ),
                    0,
                );

            const vat = Math.round(
                subtotal *
                (vatRate /
                    100),
            );

            const total =
                subtotal + vat;

            const change =
                method === "cash" &&
                    amountTendered !=
                    null
                    ? Math.max(
                        0,
                        Number(
                            amountTendered,
                        ) - total,
                    )
                    : 0;

            const receipt =
                await prisma.$transaction(
                    async (tx) => {
                        for (const line of job.lines) {
                            if (
                                line.type ===
                                "part" &&
                                line.sku
                            ) {
                                const item =
                                    await tx.inventoryItem.findUnique(
                                        {
                                            where: {
                                                sku:
                                                    line.sku,
                                            },
                                        },
                                    );

                                if (
                                    !item
                                ) {
                                    throw new Error(
                                        `Inventory item ${line.sku} not found`,
                                    );
                                }

                                if (
                                    item.qty <
                                    1
                                ) {
                                    throw new Error(
                                        `${item.name} is out of stock`,
                                    );
                                }

                                await tx.inventoryItem.update(
                                    {
                                        where: {
                                            sku:
                                                item.sku,
                                        },
                                        data: {
                                            qty: {
                                                decrement:
                                                    1,
                                            },
                                        },
                                    },
                                );
                            }
                        }

                        await tx.jobCard.update(
                            {
                                where: {
                                    id: job.id,
                                },

                                data: {
                                    stage: "done",

                                    completedAt:
                                        BigInt(
                                            Date.now(),
                                        ),

                                    ...(mileageAtEnd !=
                                        null
                                        ? {
                                            mileageAtEnd:
                                                Number(
                                                    mileageAtEnd,
                                                ),
                                        }
                                        : {}),
                                },
                            },
                        );

                        if (
                            mileageAtEnd !=
                            null
                        ) {
                            await tx.vehicle.update(
                                {
                                    where: {
                                        registration:
                                            job.registration,
                                    },

                                    data: {
                                        mileage:
                                            Number(
                                                mileageAtEnd,
                                            ),
                                    },
                                },
                            );
                        }

                        return {
                            id:
                                "INV-" +
                                (
                                    4000 +
                                    Math.floor(
                                        Math.random() *
                                        900,
                                    )
                                ),

                            items:
                                job.lines.map(
                                    (line) => ({
                                        sku:
                                            line.sku ??
                                            line.name,
                                        name:
                                            line.name,
                                        price:
                                            line.price,
                                        qty: 1,
                                    }),
                                ),

                            subtotal,
                            vat,
                            total,
                            method,

                            mpesaRef:
                                mpesaRef ??
                                null,

                            change,

                            vatReg:
                                settings?.kra ??
                                "",

                            paidAt:
                                new Date().toISOString(),

                            jobId:
                                job.id,

                            registration:
                                job.registration,
                        };
                    },
                );

            res.status(201).json(
                receipt,
            );
        } catch (error) {
            console.error(
                "POST checkout failed:",
                error,
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Checkout failed";

            res.status(500).json({
                error: message,
            });
        }
    },
);