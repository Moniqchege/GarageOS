import { useState } from "react";
import { Bell, Check, Receipt, Settings as SettingsIcon } from "lucide-react";

import { useApi, useMutation, get, post } from "@garage/api-client";
import { Button, Field, Input } from "@garage/ui";

interface BusinessSettings {
    name: string;
    kra: string;
    vatRate: number;
}

export function SettingsPage() {
    const { data, refetch } = useApi(
        () => get<BusinessSettings>("/api/settings"),
        [],
    );

    const { mutate: save, loading: saving, error } = useMutation(
        (settings: BusinessSettings) =>
            post<BusinessSettings>("/api/settings", settings),
    );

    const [form, setForm] = useState<BusinessSettings | null>(null);
    const current = form ?? data ?? { name: "", kra: "", vatRate: 16 };

    const handleSave = async () => {
        await save(current);
        setForm(null);
        refetch();
    };

    const isDirty = form !== null;

    return (
        <div className="mx-auto max-w-xl p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Business details used across job cards, invoices, and receipts.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            )}

            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <SettingsIcon size={15} className="text-[var(--primary)]" />
                Business &amp; invoicing
            </h2>
            <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4.5">
                <Field label="Business name">
                    <Input
                        value={current.name}
                        onChange={(e) =>
                            setForm({ ...current, name: e.target.value })
                        }
                    />
                </Field>
                <Field label="KRA PIN" className="mt-3.5">
                    <Input
                        value={current.kra}
                        onChange={(e) =>
                            setForm({ ...current, kra: e.target.value })
                        }
                    />
                </Field>
                <Field label="VAT rate (%)" className="mt-3.5">
                    <Input
                        value={String(current.vatRate)}
                        onChange={(e) =>
                            setForm({
                                ...current,
                                vatRate: Number(e.target.value.replace(/\D/g, "") || "0"),
                            })
                        }
                    />
                </Field>

                {isDirty && (
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-4 justify-center"
                    >
                        <Check size={13} /> {saving ? "Saving…" : "Save changes"}
                    </Button>
                )}
            </div>

            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Receipt size={15} className="text-[var(--primary)]" />
                Job card catalog
            </h2>
            <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4.5 text-sm text-[var(--text-muted)]">
                Labor charges and parts pricing are managed from Stock ingestion
                and each job card's line items.
            </div>

            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Bell size={15} className="text-[var(--primary)]" />
                Notifications
            </h2>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4.5 text-sm text-[var(--text-muted)]">
                Low-stock and service-due alerts show in the bell icon on every
                screen. Connecting SMS/WhatsApp delivery to customers is available
                as a follow-up integration.
            </div>
        </div>
    );
}
