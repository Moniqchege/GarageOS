import { useLocation, useNavigate } from "react-router-dom";
import { Check, Plus, Printer } from "lucide-react";

import type { Receipt } from "@garage/api-client";
import { Button } from "@garage/ui";

const fmt = (n: number) => Math.round(n).toLocaleString("en-KE");

export function ReceiptPage() {
    const navigate  = useNavigate();
    const { state } = useLocation();
    const receipt   = state as Receipt | null;

    if (!receipt) {
        return (
            <div className="p-6">
                <p className="text-sm text-[var(--text-muted)]">
                    No receipt to show. Complete a sale from the POS counter first.
                </p>
            </div>
        );
    }

    const { items, subtotal, vat, total, method, mpesaRef, id, vatReg, jobId, registration } = receipt;

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Invoicing &amp; Clearance Slip</h1>
                <button
                    onClick={() => navigate("/pos")}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white"
                >
                    <Plus size={13} /> New sale
                </button>
            </div>

            <div className="mb-5 text-center">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--secondary-dim)]">
                    <Check size={22} className="text-[var(--secondary)]" />
                </div>
                <div className="text-lg font-bold">Payment received</div>
            </div>

            <div className="flex flex-wrap justify-center gap-5">
                {/* ETR Receipt */}
                <div className="w-[300px] rounded-lg bg-white p-5 font-mono text-[11.5px] text-neutral-900 shadow-sm">
                    <div className="text-center font-bold">GARAGE OS ETR INVOICE</div>
                    <div className="mb-2.5 text-center text-neutral-500">
                        {id} · VAT reg. {vatReg}
                    </div>
                    <div className="my-2 border-t border-dashed border-neutral-300" />
                    {items.map((it) => (
                        <div key={it.sku} className="mb-0.5 flex justify-between">
                            <span>{it.name.slice(0, 20)} x{it.qty}</span>
                            <span>{fmt(it.price * it.qty)}</span>
                        </div>
                    ))}
                    <div className="my-2 border-t border-dashed border-neutral-300" />
                    <div className="flex justify-between"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    <div className="flex justify-between"><span>VAT 16%</span><span>{fmt(vat)}</span></div>
                    <div className="flex justify-between font-bold"><span>TOTAL KSh</span><span>{fmt(total)}</span></div>
                    <div className="my-2 border-t border-dashed border-neutral-300" />
                    <div className="text-center text-neutral-500">
                        {method === "mpesa" ? `M-Pesa · ${mpesaRef}` : "Cash payment"}
                    </div>
                </div>

                {/* Gate pass */}
                <div className="w-[300px] rounded-lg bg-white p-5 text-neutral-900 shadow-sm">
                    <div className="mb-3 text-center text-xs font-bold">SECURITY GATE PASS</div>
                    <div className="text-[10.5px] text-neutral-500">Vehicle registration</div>
                    <div className="mb-3 font-mono text-lg font-bold">
                        {registration ?? "N/A — Retail sale"}
                    </div>
                    {jobId && (
                        <div className="mb-3 text-[10.5px] text-neutral-500">Job card {jobId}</div>
                    )}
                    <div className="mb-3 rounded-md bg-[var(--secondary)] py-2 text-center text-[11px] font-bold text-white">
                        COMPLETELY PAID / CLEARED FOR ROADWAY EXIT
                    </div>
                    <div
                        className="h-7"
                        style={{ background: "repeating-linear-gradient(90deg,#1a1a1a 0 2px,transparent 2px 5px)" }}
                    />
                    <div className="mt-1 text-center text-[9.5px] text-neutral-500">{id}</div>
                </div>

                <div className="flex w-full justify-center">
                    <Button variant="ghost"><Printer size={13} /> Print documents</Button>
                </div>
            </div>
        </div>
    );
}
