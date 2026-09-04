import type { JobCard } from "@garage/types";

const VAT_RATE = 0.16;

export function buildJobCheckoutState(job: JobCard) {
    const lines = job.lines ?? [];

    // Prices are VAT-inclusive. The total is simply the sum of line prices.
    // VAT is back-calculated from the inclusive total.
    const total = lines.reduce((s, l) => s + l.price, 0);
    const vat = Math.round(total - total / (1 + VAT_RATE));
    const subtotal = total - vat;

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
