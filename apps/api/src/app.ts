import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./routes/auth";
import { vehiclesRouter } from "./routes/vehicles";
import { customersRouter } from "./routes/customers";
import { jobsRouter } from "./routes/jobs";
import { inventoryRouter } from "./routes/inventory";
import { laborRouter } from "./routes/labor";
import { posRouter } from "./routes/pos";
import { usersRouter } from "./routes/users";
import { analyticsRouter } from "./routes/analytics";
import { settingsRouter } from "./routes/settings";

export function createApp() {
    const app = express();

    // ─── Global Middleware ───────────────────────────────────────────────────────
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(
        cors({
            origin: [
                process.env.STAFF_APP_URL ?? "http://localhost:5173",
                process.env.CUSTOMER_APP_URL ?? "http://localhost:5174",
            ],
            credentials: true,
        })
    );
    app.use(express.json());

    // ─── Health Check ────────────────────────────────────────────────────────────
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // ─── API Routes ──────────────────────────────────────────────────────────────
    app.use("/api/auth", authRouter);
    app.use("/api/vehicles", vehiclesRouter);
    app.use("/api/customers", customersRouter);
    app.use("/api/jobs", jobsRouter);
    app.use("/api/inventory", inventoryRouter);
    app.use("/api/labor", laborRouter);
    app.use("/api/pos", posRouter);
    app.use("/api/users", usersRouter);
    app.use("/api/analytics", analyticsRouter);
    app.use("/api/settings", settingsRouter);

    // ─── 404 Handler ─────────────────────────────────────────────────────────────
    app.use((_req, res) => {
        res.status(404).json({ error: "Route not found" });
    });

    // ─── Global Error Handler ────────────────────────────────────────────────────
    app.use(
        (
            err: Error,
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction
        ) => {
            console.error(err.stack);
            res.status(500).json({ error: "Internal server error" });
        }
    );

    return app;
}
