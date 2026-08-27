import type { JobCard } from "@garage/types";

const VAT_RATE = 0.16;
export function buildJobCheckoutState(job: JobCard) {
    const lines = job.lines ?? [];
    const subtotal = lines.reduce((s, l) => s + l.price, 0);
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

    return {
        items: lines.map((l, i) => ({
            sku: l.sku ?? `${job.id}-${i}`,
            name: l.name,
            price: l.price,
            qty: 1,
        })),
        subtotal,
        vat,
        total,
        jobId: job.id,
        registration: job.registration,
    };
}
