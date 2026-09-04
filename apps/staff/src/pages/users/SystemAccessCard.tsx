import { useState } from "react";
import { KeyRound } from "lucide-react";
import { users, useMutation } from "@garage/api-client";
import type { Employee } from "@garage/types";
import { Badge, Button, Field, Input } from "@garage/ui";

interface SystemAccessCardProps {
    employee: Employee;
    onUpdated: (employee: Employee) => void;
}

export function SystemAccessCard({
    employee,
    onUpdated,
}: SystemAccessCardProps) {
    const [showPinForm, setShowPinForm] = useState(false);
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const { mutate: updateAccess, loading } = useMutation(
        (payload: { enabled: boolean; pin?: string }) =>
            users.updateAccess(employee.id, payload),
    );

    const toggleAccess = async () => {
        if (employee.loginEnabled) {
            const updated = await updateAccess({ enabled: false });

            if (updated) onUpdated(updated);
            return;
        }

        if (!employee.hasPin) {
            setShowPinForm(true);
            return;
        }

        const updated = await updateAccess({ enabled: true });

        if (updated) onUpdated(updated);
    };

    const grantWithNewPin = async () => {
        setFormError(null);

        if (pin.length !== 4) {
            setFormError("PIN must be exactly 4 digits");
            return;
        }

        if (confirmPin.length !== 4) {
            setFormError("Please confirm the 4-digit PIN");
            return;
        }

        if (pin !== confirmPin) {
            setFormError("PINs do not match");
            return;
        }

        const updated = await updateAccess({
            enabled: true,
            pin,
        });

        if (!updated) {
            setFormError("Couldn't save — please try again");
            return;
        }

        onUpdated(updated);
        setShowPinForm(false);
        setPin("");
        setConfirmPin("");
        setFormError(null);
    };

    const cancelPinForm = () => {
        setShowPinForm(false);
        setPin("");
        setConfirmPin("");
        setFormError(null);
    };

    const canGrantAccess =
        pin.length === 4 && confirmPin.length === 4;

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                    <KeyRound
                        size={15}
                        className="text-[var(--primary)]"
                    />
                    System access
                </h2>

                <Badge
                    variant={
                        employee.loginEnabled ? "success" : "danger"
                    }
                >
                    {employee.loginEnabled ? "Enabled" : "Disabled"}
                </Badge>
            </div>

            <p className="mb-4 text-xs text-[var(--text-muted)]">
                {employee.loginEnabled
                    ? "This employee can log in to the system with their PIN."
                    : employee.hasPin
                        ? "Login is turned off. Their existing PIN is kept on file."
                        : "This employee has never been given a PIN and cannot log in."}
            </p>

            {!showPinForm && (
                <Button
                    variant={
                        employee.loginEnabled
                            ? "secondary"
                            : "primary"
                    }
                    onClick={toggleAccess}
                    disabled={loading}
                    className="w-full justify-center"
                >
                    {employee.loginEnabled
                        ? "Disable access"
                        : employee.hasPin
                            ? "Enable access"
                            : "Grant access"}
                </Button>
            )}

            {showPinForm && (
                <div className="space-y-3.5 rounded-lg border border-[var(--border)] p-4">
                    <p className="text-xs font-semibold text-[var(--text)]">
                        Set a 4-digit PIN to grant this employee access
                    </p>

                    <Field label="New PIN">
                        <Input
                            maxLength={4}
                            inputMode="numeric"
                            type="password"
                            value={pin}
                            onChange={(e) => {
                                setPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4),
                                );
                                setFormError(null);
                            }}
                            placeholder="••••"
                        />
                    </Field>

                    <Field label="Confirm PIN">
                        <Input
                            maxLength={4}
                            inputMode="numeric"
                            type="password"
                            value={confirmPin}
                            onChange={(e) => {
                                setConfirmPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4),
                                );
                                setFormError(null);
                            }}
                            placeholder="••••"
                        />
                    </Field>

                    {formError && (
                        <p className="text-xs text-[var(--danger)]">
                            {formError}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={cancelPinForm}
                            disabled={loading}
                            className="flex-1 justify-center"
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            onClick={grantWithNewPin}
                            disabled={loading || !canGrantAccess}
                            className="flex-1 justify-center"
                        >
                            {loading
                                ? "Saving…"
                                : "Grant access"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}