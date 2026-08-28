import { Router } from "express";
import { prisma } from "../db";

export const customersRouter = Router();

const vehicleInclude = {
    customer: true,
    jobCards: {
        include: {
            lines: {
                orderBy: {
                    position: "asc" as const,
                },
            },
        },
        orderBy: {
            startedAt: "desc" as const,
        },
    },
};

function serializeJob(job: any) {
    return {
        id: job.id,
        registration: job.registration,
        customer: job.vehicle?.customer?.name ?? "",
        phone: job.vehicle?.customer?.phone ?? "",
        vehicle: job.vehicle
            ? {
                registration: job.vehicle.registration,
                model: job.vehicle.model,
                year: job.vehicle.year,
                color: job.vehicle.color,
            }
            : null,

        mechanic: job.mechanic,
        stage: job.stage,

        startedAt: Number(job.startedAt),
        completedAt:
            job.completedAt != null
                ? Number(job.completedAt)
                : null,

        mileageAtStart: job.mileageAtStart,
        mileageAtEnd: job.mileageAtEnd,

        faults: job.faults,
        diagnosisNotes: job.diagnosisNotes ?? null,
        diagnosisFindings: job.diagnosisFindings ?? null,

        lines: job.lines.map((line: any) => ({
            id: line.id,
            type: line.type,
            name: line.name,
            price: line.price,
            sku: line.sku,
            position: line.position,
        })),

        total: job.lines.reduce(
            (sum: number, line: any) => sum + Number(line.price),
            0,
        ),
    };
}

// GET /api/customers
customersRouter.get("/", async (_req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                vehicles: {
                    orderBy: {
                        registration: "asc",
                    },
                    include: {
                        jobCards: {
                            orderBy: {
                                startedAt: "desc",
                            },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const result = customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,

            vehicles: customer.vehicles.map((vehicle) => ({
                registration: vehicle.registration,
                model: vehicle.model,
                year: vehicle.year,
                color: vehicle.color,
                mileage: vehicle.mileage,
                fuel: vehicle.fuel,
                health: vehicle.health,
                nextServiceKm: vehicle.nextServiceKm,
                nextServiceDate: vehicle.nextServiceDate,

                lastService:
                    vehicle.jobCards[0]?.completedAt
                        ? Number(vehicle.jobCards[0].completedAt)
                        : null,

                activeJob:
                    vehicle.jobCards[0] &&
                        vehicle.jobCards[0].stage !== "done"
                        ? {
                            id: vehicle.jobCards[0].id,
                            stage: vehicle.jobCards[0].stage,
                        }
                        : null,
            })),
        }));

        res.json(result);
    } catch (error) {
        console.error("GET /api/customers failed:", error);
        res.status(500).json({
            error: "Failed to load customers",
        });
    }
});

// GET /api/customers/search?q=
customersRouter.get("/search", async (req, res) => {
    try {
        const q = String(req.query.q ?? "").trim();

        if (!q) {
            return res.json([]);
        }

        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: q,
                        },
                    },
                    {
                        phone: {
                            contains: q,
                        },
                    },
                    {
                        vehicles: {
                            some: {
                                OR: [
                                    {
                                        registration: {
                                            contains: q.toUpperCase(),
                                        },
                                    },
                                    {
                                        model: {
                                            contains: q,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            include: {
                vehicles: {
                    include: {
                        jobCards: {
                            orderBy: {
                                startedAt: "desc",
                            },
                            take: 1,
                        },
                    },
                    orderBy: {
                        registration: "asc",
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
            take: 20,
        });

        res.json(
            customers.map((customer) => ({
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,

                vehicles: customer.vehicles.map((vehicle) => ({
                    registration: vehicle.registration,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    mileage: vehicle.mileage,
                    nextServiceKm: vehicle.nextServiceKm,
                    nextServiceDate: vehicle.nextServiceDate,

                    lastJob: vehicle.jobCards[0]
                        ? {
                            id: vehicle.jobCards[0].id,
                            stage: vehicle.jobCards[0].stage,
                            startedAt: Number(
                                vehicle.jobCards[0].startedAt,
                            ),
                        }
                        : null,
                })),
            })),
        );
    } catch (error) {
        console.error("GET /api/customers/search failed:", error);
        res.status(500).json({
            error: "Failed to search customers",
        });
    }
});

// GET /api/customers/:id
customersRouter.get("/:id", async (req, res) => {
    try {
        const customer = await prisma.customer.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                vehicles: {
                    orderBy: {
                        registration: "asc",
                    },
                },
            },
        });

        if (!customer) {
            return res.status(404).json({
                error: "Customer not found",
            });
        }

        res.json(customer);
    } catch (error) {
        console.error("GET /api/customers/:id failed:", error);
        res.status(500).json({
            error: "Failed to load customer",
        });
    }
});

// GET /api/customers/:id/vehicles
customersRouter.get("/:id/vehicles", async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: {
                customerId: req.params.id,
            },
            include: {
                jobCards: {
                    orderBy: {
                        startedAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                registration: "asc",
            },
        });

        res.json(
            vehicles.map((vehicle) => ({
                ...vehicle,
                jobCards: vehicle.jobCards.map(serializeJob),
            })),
        );
    } catch (error) {
        console.error(
            "GET /api/customers/:id/vehicles failed:",
            error,
        );

        res.status(500).json({
            error: "Failed to load customer vehicles",
        });
    }
});

// GET /api/customers/:id/vehicles/:registration/history
customersRouter.get(
    "/:id/vehicles/:registration/history",
    async (req, res) => {
        try {
            const registration = req.params.registration.toUpperCase();

            const vehicle = await prisma.vehicle.findFirst({
                where: {
                    registration,
                    customerId: req.params.id,
                },
                include: {
                    customer: true,
                    jobCards: {
                        include: {
                            lines: {
                                orderBy: {
                                    position: "asc",
                                },
                            },
                        },
                        orderBy: {
                            startedAt: "desc",
                        },
                    },
                },
            });

            if (!vehicle) {
                return res.status(404).json({
                    error: "Vehicle not found for this customer",
                });
            }

            const history = vehicle.jobCards.map(serializeJob);

            const totalSpent = history
                .filter((job) => job.stage === "done")
                .reduce((sum, job) => sum + job.total, 0);

            res.json({
                customer: {
                    id: vehicle.customer.id,
                    name: vehicle.customer.name,
                    phone: vehicle.customer.phone,
                    email: vehicle.customer.email,
                },

                vehicle: {
                    registration: vehicle.registration,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    mileage: vehicle.mileage,
                    fuel: vehicle.fuel,
                    health: vehicle.health,
                    nextServiceKm: vehicle.nextServiceKm,
                    nextServiceDate: vehicle.nextServiceDate,
                },

                summary: {
                    totalJobs: history.length,
                    completedJobs: history.filter(
                        (job) => job.stage === "done",
                    ).length,
                    totalSpent,
                    lastService:
                        history.find(
                            (job) => job.stage === "done",
                        )?.completedAt ?? null,
                },

                history,
            });
        } catch (error) {
            console.error(
                "GET vehicle history failed:",
                error,
            );

            res.status(500).json({
                error: "Failed to load vehicle history",
            });
        }
    },
);

// GET /api/customers/:id/vehicles/:registration/report
customersRouter.get(
    "/:id/vehicles/:registration/report",
    async (req, res) => {
        try {
            const registration = req.params.registration.toUpperCase();

            const vehicle = await prisma.vehicle.findFirst({
                where: {
                    registration,
                    customerId: req.params.id,
                },
                include: {
                    customer: true,
                    jobCards: {
                        include: {
                            lines: {
                                orderBy: {
                                    position: "asc",
                                },
                            },
                        },
                        orderBy: {
                            startedAt: "asc",
                        },
                    },
                },
            });

            if (!vehicle) {
                return res.status(404).json({
                    error: "Vehicle not found",
                });
            }

            const jobs = vehicle.jobCards.map(serializeJob);

            const completedJobs = jobs.filter(
                (job) => job.stage === "done",
            );

            const totalSpent = completedJobs.reduce(
                (sum, job) => sum + job.total,
                0,
            );

            res.json({
                generatedAt: new Date().toISOString(),

                customer: {
                    id: vehicle.customer.id,
                    name: vehicle.customer.name,
                    phone: vehicle.customer.phone,
                    email: vehicle.customer.email,
                },

                vehicle: {
                    registration: vehicle.registration,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    mileage: vehicle.mileage,
                    fuel: vehicle.fuel,
                    health: vehicle.health,
                },

                serviceSummary: {
                    numberOfVisits: jobs.length,
                    completedVisits: completedJobs.length,
                    totalSpent,
                    firstVisit:
                        jobs[0]?.startedAt ?? null,
                    lastVisit:
                        jobs[jobs.length - 1]?.completedAt ??
                        jobs[jobs.length - 1]?.startedAt ??
                        null,
                },

                serviceHistory: jobs,
            });
        } catch (error) {
            console.error(
                "GET vehicle report failed:",
                error,
            );

            res.status(500).json({
                error: "Failed to generate vehicle report",
            });
        }
    },
);

// POST /api/customers
customersRouter.post("/", async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
        } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                error: "name and phone are required",
            });
        }

        const customer = await prisma.customer.create({
            data: {
                name: String(name).trim(),
                phone: String(phone).trim(),
                email: email
                    ? String(email).trim()
                    : null,
            },
        });

        res.status(201).json(customer);
    } catch (error) {
        console.error("POST /api/customers failed:", error);

        res.status(500).json({
            error: "Failed to create customer",
        });
    }
});

// POST /api/customers/:id/vehicles
customersRouter.post("/:id/vehicles", async (req, res) => {
    try {
        const {
            registration,
            model,
            year,
            color,
            mileage,
            fuel,
            health,
            nextServiceKm,
            nextServiceDate,
        } = req.body;

        if (!registration || !model) {
            return res.status(400).json({
                error: "registration and model are required",
            });
        }

        const customer = await prisma.customer.findUnique({
            where: {
                id: req.params.id,
            },
        });

        if (!customer) {
            return res.status(404).json({
                error: "Customer not found",
            });
        }

        const normalizedRegistration = String(
            registration,
        )
            .trim()
            .toUpperCase();

        const existingVehicle =
            await prisma.vehicle.findUnique({
                where: {
                    registration: normalizedRegistration,
                },
            });

        if (existingVehicle) {
            return res.status(409).json({
                error: "A vehicle with this registration already exists",
            });
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                registration: normalizedRegistration,
                customerId: customer.id,
                model: String(model),
                year:
                    year != null
                        ? Number(year)
                        : null,
                color:
                    color != null
                        ? String(color)
                        : null,
                mileage:
                    mileage != null
                        ? Number(mileage)
                        : 0,
                fuel:
                    fuel != null
                        ? Number(fuel)
                        : null,
                health:
                    health != null
                        ? Number(health)
                        : null,
                nextServiceKm:
                    nextServiceKm != null
                        ? Number(nextServiceKm)
                        : null,
                nextServiceDate:
                    nextServiceDate
                        ? new Date(nextServiceDate)
                        : null,
            },
        });

        res.status(201).json(vehicle);
    } catch (error) {
        console.error(
            "POST /api/customers/:id/vehicles failed:",
            error,
        );

        res.status(500).json({
            error: "Failed to add vehicle",
        });
    }
});

// POST /api/customers/register-vehicle
customersRouter.post("/register-vehicle", async (req, res) => {
    try {
        const {
            customerName,
            phone,
            email,
            registration,
            model,
            year,
            color,
            mileage,
            fuel,
        } = req.body as {
            customerName?: string;
            phone?: string;
            email?: string;
            registration?: string;
            model?: string;
            year?: number;
            color?: string;
            mileage?: number;
            fuel?: number;
        };

        if (!customerName || !phone || !registration || !model) {
            return res.status(400).json({
                error: "customerName, phone, registration, and model are required",
            });
        }

        const normalizedRegistration = String(registration).trim().toUpperCase();
        const trimmedPhone = String(phone).trim();

        const existingVehicle = await prisma.vehicle.findUnique({
            where: { registration: normalizedRegistration },
        });

        if (existingVehicle) {
            return res.status(409).json({
                error: "A vehicle with this registration already exists",
            });
        }

        const vehicle = await prisma.$transaction(async (tx) => {
            let customer = await tx.customer.findFirst({
                where: { phone: trimmedPhone },
            });

            if (!customer) {
                customer = await tx.customer.create({
                    data: {
                        name: String(customerName).trim(),
                        phone: trimmedPhone,
                        email: email ? String(email).trim() : null,
                    },
                });
            }

            return tx.vehicle.create({
                data: {
                    registration: normalizedRegistration,
                    customerId: customer.id,
                    model: String(model).trim(),
                    year: year != null ? Number(year) : null,
                    color: color != null ? String(color) : null,
                    mileage: mileage != null ? Number(mileage) : 0,
                    fuel: fuel != null ? Number(fuel) : null,
                },
                include: { customer: true },
            });
        });

        res.status(201).json(vehicle);
    } catch (error) {
        console.error("POST register-vehicle failed:", error);
        res.status(500).json({ error: "Failed to register vehicle" });
    }
});

// GET /api/customers/:id/notifications
customersRouter.get("/:id/notifications", async (req, res) => {
    try {
        const notifications =
            await prisma.customerNotification.findMany({
                where: {
                    customerId: req.params.id,
                },
                orderBy: {
                    id: "desc",
                },
            });

        res.json(notifications);
    } catch (error) {
        console.error(
            "GET notifications failed:",
            error,
        );

        res.status(500).json({
            error: "Failed to load notifications",
        });
    }
});

// GET /api/customers/vehicles/:registration/history
customersRouter.get("/vehicles/:registration/history", async (req, res) => {
    try {
        const registration = req.params.registration.toUpperCase();

        const vehicle = await prisma.vehicle.findUnique({
            where: { registration },
            include: {
                jobCards: {
                    include: { lines: { orderBy: { position: "asc" } } },
                    orderBy: { startedAt: "desc" },
                },
            },
        });

        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        res.json(vehicle.jobCards.map(serializeJob));
    } catch (error) {
        console.error("GET vehicle history by registration failed:", error);
        res.status(500).json({ error: "Failed to load vehicle history" });
    }
});

// PATCH /api/customers/:id/notifications/:notificationId/read
customersRouter.patch(
    "/:id/notifications/:notificationId/read",
    async (req, res) => {
        try {
            const notification =
                await prisma.customerNotification.findFirst({
                    where: {
                        id: Number(
                            req.params.notificationId,
                        ),
                        customerId: req.params.id,
                    },
                });

            if (!notification) {
                return res.status(404).json({
                    error: "Notification not found",
                });
            }

            const updated =
                await prisma.customerNotification.update({
                    where: {
                        id: notification.id,
                    },
                    data: {
                        read: true,
                    },
                });

            res.json(updated);
        } catch (error) {
            console.error(
                "PATCH notification failed:",
                error,
            );

            res.status(500).json({
                error: "Failed to update notification",
            });
        }
    },
);

// PATCH /api/customers/:id/notifications/read-all
customersRouter.patch(
    "/:id/notifications/read-all",
    async (req, res) => {
        try {
            await prisma.customerNotification.updateMany({
                where: {
                    customerId: req.params.id,
                },
                data: {
                    read: true,
                },
            });

            const notifications =
                await prisma.customerNotification.findMany({
                    where: {
                        customerId: req.params.id,
                    },
                    orderBy: {
                        id: "desc",
                    },
                });

            res.json(notifications);
        } catch (error) {
            console.error(
                "PATCH read-all failed:",
                error,
            );

            res.status(500).json({
                error: "Failed to update notifications",
            });
        }
    },
);