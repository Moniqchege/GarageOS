import { Router } from "express";
import { employees, settings } from "../store";

export const authRouter = Router();

/**
 * POST /api/auth/login
 * Body: { pin: string }
 * Returns the matched employee (no PIN in response) + business settings.
 * No JWT yet — the front-end stores the returned user object in memory/sessionStorage.
 */
authRouter.post("/login", (req, res) => {
    const { pin } = req.body as { pin?: string };

    if (!pin || String(pin).length !== 4) {
        return res.status(400).json({ error: "A 4-digit PIN is required" });
    }

    const emp = employees.find((e) => e.pin === String(pin));

    if (!emp) {
        return res.status(401).json({ error: "Incorrect PIN" });
    }
    if (emp.status !== "Active") {
        return res.status(403).json({ error: "This account is suspended" });
    }

    // Update last-login timestamp
    emp.lastLogin = new Date().toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const { pin: _pin, ...safeEmp } = emp;
    res.json({ user: safeEmp, settings });
});

/**
 * POST /api/auth/logout  — stateless for now; client clears its own session
 */
authRouter.post("/logout", (_req, res) => {
    res.status(204).send();
});

/**
 * GET /api/auth/me  — re-validate a stored session (placeholder for token auth)
 */
authRouter.get("/me", (_req, res) => {
    // Until JWT is added, return 401 so the client always starts at the login screen
    res.status(401).json({ error: "Not authenticated" });
});
